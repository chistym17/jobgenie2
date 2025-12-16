from __future__ import annotations

import os
import pathlib
import time
from typing import BinaryIO

from fastapi import UploadFile


class FileStorageService:

    def __init__(self, base_dir: str | None = None) -> None:
        if base_dir is None:
            backend_root = pathlib.Path(__file__).resolve().parents[3]
            base_dir = backend_root / "uploads" / "resumes"
        self.base_path = pathlib.Path(base_dir)
        self.base_path.mkdir(parents=True, exist_ok=True)

    def _build_path(self, user_email: str, filename: str) -> pathlib.Path:
        safe_email = user_email.replace("@", "_at_").replace("/", "_")
        timestamp = int(time.time() * 1000)
        safe_name = os.path.basename(filename)
        return self.base_path / safe_email / f"{timestamp}_{safe_name}"

    async def save_file(self, uploaded_file: UploadFile, user_email: str) -> str:
        target_path = self._build_path(user_email, uploaded_file.filename or "resume.pdf")
        target_path.parent.mkdir(parents=True, exist_ok=True)

        with target_path.open("wb") as out_f:
            while True:
                chunk = await uploaded_file.read(1024 * 1024)
                if not chunk:
                    break
                out_f.write(chunk)

        await uploaded_file.seek(0)

        return str(target_path)

    def get_file(self, file_path: str) -> bytes:
        path = pathlib.Path(file_path)
        with path.open("rb") as f:
            return f.read()

    def delete_file(self, file_path: str) -> bool:
        try:
            path = pathlib.Path(file_path)
            if path.exists():
                path.unlink()
            return True
        except Exception:
            return False


