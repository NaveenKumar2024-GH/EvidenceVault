import os
import threading
import time

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from database import initialize_database, get_connection
from evidence_service import (
    calculate_sha256,
    generate_evidence_id,
    get_timestamp
)


app = FastAPI(
    title="EvidenceVault API",
    description="Digital Evidence Management and Integrity Platform",
    version="1.0.0"
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "https://evidence-vault-beta.vercel.app",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Evidence Storage
# ---------------------------------------------------------

EVIDENCE_DIRECTORY = "evidence_files"

os.makedirs(
    EVIDENCE_DIRECTORY,
    exist_ok=True
)


# ---------------------------------------------------------
# Database
# ---------------------------------------------------------

initialize_database()


# ---------------------------------------------------------
# Real-Time Integrity Watcher
# ---------------------------------------------------------

WATCH_INTERVAL = 5

watcher_running = False
watcher_thread = None


def integrity_watcher():
    """
    Background integrity monitoring engine.

    Periodically checks every registered evidence item.

    Detects:
    1. Missing evidence files
    2. Modified evidence files

    When detected:
    - Evidence status becomes COMPROMISED
    - An audit event is recorded

    Duplicate audit events are avoided while the
    evidence remains COMPROMISED.
    """

    global watcher_running

    watcher_running = True

    print(
        f"[INTEGRITY WATCHER] Started - "
        f"checking every {WATCH_INTERVAL} seconds"
    )

    while True:

        try:
            connection = get_connection()

            records = connection.execute(
                """
                SELECT *
                FROM evidence
                """
            ).fetchall()

            for record in records:

                evidence_id = record["evidence_id"]

                file_path = os.path.join(
                    EVIDENCE_DIRECTORY,
                    evidence_id
                )

                # -------------------------------------------------
                # CASE 1: Evidence file is missing
                # -------------------------------------------------

                if not os.path.exists(file_path):

                    if record["status"] != "COMPROMISED":

                        timestamp = get_timestamp()

                        connection.execute(
                            """
                            UPDATE evidence
                            SET status = ?
                            WHERE evidence_id = ?
                            """,
                            (
                                "COMPROMISED",
                                evidence_id
                            )
                        )

                        connection.execute(
                            """
                            INSERT INTO audit_logs
                            (
                                evidence_id,
                                action,
                                performed_by,
                                ip_address,
                                timestamp,
                                details
                            )
                            VALUES (?, ?, ?, ?, ?, ?)
                            """,
                            (
                                evidence_id,
                                "FILE_MISSING",
                                "INTEGRITY_WATCHER",
                                "LOCAL_SYSTEM",
                                timestamp,
                                "Evidence file missing from secure storage"
                            )
                        )

                        print(
                            f"[INTEGRITY ALERT] "
                            f"{evidence_id} - FILE MISSING"
                        )

                    continue

                # -------------------------------------------------
                # CASE 2: Evidence file exists
                # -------------------------------------------------

                try:

                    with open(
                        file_path,
                        "rb"
                    ) as evidence_file:

                        current_file_bytes = (
                            evidence_file.read()
                        )

                    current_hash = calculate_sha256(
                        current_file_bytes
                    )

                except Exception as error:

                    print(
                        f"[INTEGRITY WATCHER] "
                        f"Could not read {evidence_id}: {error}"
                    )

                    continue

                original_hash = record["file_hash"]

                # -------------------------------------------------
                # CASE 3: Evidence file was modified
                # -------------------------------------------------

                if current_hash != original_hash:

                    if record["status"] != "COMPROMISED":

                        timestamp = get_timestamp()

                        connection.execute(
                            """
                            UPDATE evidence
                            SET status = ?
                            WHERE evidence_id = ?
                            """,
                            (
                                "COMPROMISED",
                                evidence_id
                            )
                        )

                        connection.execute(
                            """
                            INSERT INTO audit_logs
                            (
                                evidence_id,
                                action,
                                performed_by,
                                ip_address,
                                timestamp,
                                details
                            )
                            VALUES (?, ?, ?, ?, ?, ?)
                            """,
                            (
                                evidence_id,
                                "FILE_MODIFIED",
                                "INTEGRITY_WATCHER",
                                "LOCAL_SYSTEM",
                                timestamp,
                                "Evidence file hash changed during background integrity scan"
                            )
                        )

                        print(
                            f"[INTEGRITY ALERT] "
                            f"{evidence_id} - FILE MODIFIED"
                        )

            connection.commit()
            connection.close()

        except Exception as error:

            print(
                f"[INTEGRITY WATCHER ERROR] {error}"
            )

        time.sleep(WATCH_INTERVAL)


def start_integrity_watcher():

    global watcher_thread

    if (
        watcher_thread is None
        or not watcher_thread.is_alive()
    ):

        watcher_thread = threading.Thread(
            target=integrity_watcher,
            daemon=True,
            name="EvidenceIntegrityWatcher"
        )

        watcher_thread.start()


@app.on_event("startup")
def startup_event():

    start_integrity_watcher()


# ---------------------------------------------------------
# Root
# ---------------------------------------------------------

@app.get("/")
def root():

    return {
        "message": "EvidenceVault API is running"
    }


# ---------------------------------------------------------
# Health
# ---------------------------------------------------------

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "integrity_watcher": (
            "running"
            if watcher_running
            else "stopped"
        )
    }


# ---------------------------------------------------------
# Upload Evidence
# ---------------------------------------------------------

@app.post("/evidence/upload")
async def upload_evidence(
    file: UploadFile = File(...),
    evidence_type: str = Form(...),
    uploaded_by: str = Form(...)
):

    file_bytes = await file.read()

    file_hash = calculate_sha256(
        file_bytes
    )

    evidence_id = generate_evidence_id()

    timestamp = get_timestamp()

    file_path = os.path.join(
        EVIDENCE_DIRECTORY,
        evidence_id
    )

    with open(
        file_path,
        "wb"
    ) as evidence_file:

        evidence_file.write(
            file_bytes
        )

    connection = get_connection()

    connection.execute(
        """
        INSERT INTO evidence
        (
            evidence_id,
            filename,
            evidence_type,
            file_hash,
            file_size,
            uploaded_by,
            uploaded_at,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            evidence_id,
            file.filename,
            evidence_type,
            file_hash,
            len(file_bytes),
            uploaded_by,
            timestamp,
            "REGISTERED"
        )
    )

    connection.execute(
        """
        INSERT INTO custody_events
        (
            evidence_id,
            action,
            performed_by,
            timestamp,
            notes
        )
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            evidence_id,
            "EVIDENCE_REGISTERED",
            uploaded_by,
            timestamp,
            "Evidence uploaded and SHA-256 fingerprint generated"
        )
    )

    connection.commit()
    connection.close()

    return {
        "message": "Evidence successfully registered",
        "evidence_id": evidence_id,
        "filename": file.filename,
        "evidence_type": evidence_type,
        "sha256": file_hash,
        "file_size": len(file_bytes),
        "uploaded_by": uploaded_by,
        "uploaded_at": timestamp,
        "status": "REGISTERED"
    }


# ---------------------------------------------------------
# Get All Evidence
# ---------------------------------------------------------

@app.get("/evidence")
def get_all_evidence():

    connection = get_connection()

    records = connection.execute(
        """
        SELECT *
        FROM evidence
        ORDER BY uploaded_at DESC
        """
    ).fetchall()

    connection.close()

    return {
        "count": len(records),
        "evidence": [
            dict(record)
            for record in records
        ]
    }


# ---------------------------------------------------------
# Get Single Evidence
# ---------------------------------------------------------

@app.get("/evidence/{evidence_id}")
def get_evidence(
    evidence_id: str
):

    connection = get_connection()

    record = connection.execute(
        """
        SELECT *
        FROM evidence
        WHERE evidence_id = ?
        """,
        (evidence_id,)
    ).fetchone()

    connection.close()

    if record is None:

        raise HTTPException(
            status_code=404,
            detail="Evidence not found"
        )

    return dict(record)


# ---------------------------------------------------------
# Chain of Custody
# ---------------------------------------------------------

@app.get("/evidence/{evidence_id}/custody")
def get_custody_history(
    evidence_id: str
):

    connection = get_connection()

    records = connection.execute(
        """
        SELECT *
        FROM custody_events
        WHERE evidence_id = ?
        ORDER BY timestamp ASC
        """,
        (evidence_id,)
    ).fetchall()

    connection.close()

    if not records:

        raise HTTPException(
            status_code=404,
            detail="No custody history found"
        )

    return {
        "evidence_id": evidence_id,
        "custody_events": [
            dict(record)
            for record in records
        ]
    }


# ---------------------------------------------------------
# Verify Evidence
# ---------------------------------------------------------

@app.post("/evidence/{evidence_id}/verify")
def verify_evidence(
    evidence_id: str,
    request: Request
):

    connection = get_connection()

    record = connection.execute(
        """
        SELECT *
        FROM evidence
        WHERE evidence_id = ?
        """,
        (evidence_id,)
    ).fetchone()

    if record is None:

        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Evidence not found"
        )

    file_path = os.path.join(
        EVIDENCE_DIRECTORY,
        evidence_id
    )

    if not os.path.exists(file_path):

        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Evidence file not found"
        )

    with open(
        file_path,
        "rb"
    ) as evidence_file:

        current_file_bytes = (
            evidence_file.read()
        )

    current_hash = calculate_sha256(
        current_file_bytes
    )

    original_hash = record["file_hash"]

    if current_hash == original_hash:

        status = "VERIFIED"

        message = (
            "Evidence integrity verified"
        )

    else:

        status = "COMPROMISED"

        message = (
            "Evidence integrity compromised"
        )

    client_ip = (
        request.client.host
        if request.client
        else "unknown"
    )

    audit_timestamp = get_timestamp()

    connection.execute(
        """
        INSERT INTO audit_logs
        (
            evidence_id,
            action,
            performed_by,
            ip_address,
            timestamp,
            details
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            evidence_id,
            "INTEGRITY_CHECK",
            record["uploaded_by"],
            client_ip,
            audit_timestamp,
            message
        )
    )

    connection.execute(
        """
        UPDATE evidence
        SET status = ?
        WHERE evidence_id = ?
        """,
        (
            status,
            evidence_id
        )
    )

    connection.commit()
    connection.close()

    return {
        "evidence_id": evidence_id,
        "original_sha256": original_hash,
        "current_sha256": current_hash,
        "status": status,
        "message": message
    }


# ---------------------------------------------------------
# Audit Logs
# ---------------------------------------------------------

@app.get("/evidence/{evidence_id}/audit")
def get_audit_logs(
    evidence_id: str
):

    connection = get_connection()

    records = connection.execute(
        """
        SELECT *
        FROM audit_logs
        WHERE evidence_id = ?
        ORDER BY timestamp ASC
        """,
        (evidence_id,)
    ).fetchall()

    connection.close()

    if not records:

        raise HTTPException(
            status_code=404,
            detail="No audit logs found"
        )

    return {
        "evidence_id": evidence_id,
        "audit_logs": [
            dict(record)
            for record in records
        ]
    }