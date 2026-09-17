import hashlib
import uuid
from datetime import datetime


def calculate_sha256(file_bytes: bytes) -> str:
    return hashlib.sha256(file_bytes).hexdigest()


def generate_evidence_id() -> str:
    return f"EV-{uuid.uuid4().hex[:8].upper()}"


def get_timestamp() -> str:
    return datetime.now().isoformat()