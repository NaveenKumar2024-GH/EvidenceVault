import os

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
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

# Allow React frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Evidence storage directory
EVIDENCE_DIRECTORY = "evidence_files"
os.makedirs(EVIDENCE_DIRECTORY, exist_ok=True)

# Initialize database
initialize_database()


@app.get("/")
def root():
    return {
        "message": "EvidenceVault API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/evidence/upload")
async def upload_evidence(
    file: UploadFile = File(...),
    evidence_type: str = Form(...),
    uploaded_by: str = Form(...)
):

    # Read uploaded file
    file_bytes = await file.read()

    # Generate evidence identity and fingerprint
    file_hash = calculate_sha256(file_bytes)
    evidence_id = generate_evidence_id()
    timestamp = get_timestamp()

    # Save actual evidence file
    file_path = os.path.join(
        EVIDENCE_DIRECTORY,
        evidence_id
    )

    with open(file_path, "wb") as evidence_file:
        evidence_file.write(file_bytes)

    connection = get_connection()

    # Store evidence metadata
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

    # Create first chain-of-custody event
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
        "evidence": [dict(record) for record in records]
    }


@app.get("/evidence/{evidence_id}")
def get_evidence(evidence_id: str):

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


@app.get("/evidence/{evidence_id}/custody")
def get_custody_history(evidence_id: str):

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
        "custody_events": [dict(record) for record in records]
    }


@app.post("/evidence/{evidence_id}/verify")
def verify_evidence(evidence_id: str):

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

    # Locate stored evidence
    file_path = os.path.join(
        EVIDENCE_DIRECTORY,
        evidence_id
    )

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail="Evidence file not found"
        )

    # Recalculate SHA-256
    with open(file_path, "rb") as evidence_file:
        current_file_bytes = evidence_file.read()

    current_hash = calculate_sha256(current_file_bytes)
    original_hash = record["file_hash"]

    # Compare fingerprints
    if current_hash == original_hash:
        status = "VERIFIED"
        message = "Evidence integrity verified"
    else:
        status = "COMPROMISED"
        message = "Evidence integrity compromised"

    # Update status
    connection = get_connection()

    connection.execute(
        """
        UPDATE evidence
        SET status = ?
        WHERE evidence_id = ?
        """,
        (status, evidence_id)
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