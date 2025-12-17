from __future__ import annotations

import os
from typing import Optional

from bson import ObjectId
from fastapi import UploadFile
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket


class FileStorageService:
    def __init__(self, bucket_name: str = "resume_files") -> None:
        mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27018")
        client = AsyncIOMotorClient(mongo_uri)
        db = client.jobs_db
        self.bucket = AsyncIOMotorGridFSBucket(db, bucket_name=bucket_name)

    async def save_file(self, uploaded_file: UploadFile, user_email: str) -> str:
        filename = uploaded_file.filename or "resume.pdf"
        metadata = {"user_email": user_email}

        file_id = await self.bucket.upload_from_stream(
            filename,
            uploaded_file.file,
            metadata=metadata,
        )

        await uploaded_file.seek(0)

        return str(file_id)

    async def get_file(self, file_id: str) -> bytes:
        oid = ObjectId(file_id)
        stream = await self.bucket.open_download_stream(oid)
        chunks: list[bytes] = []
        while True:
            data = await stream.read(1024 * 1024)
            if not data:
                break
            chunks.append(data)
        return b"".join(chunks)

    async def delete_file(self, file_id: str) -> bool:
        try:
            oid = ObjectId(file_id)
            await self.bucket.delete(oid)
            return True
        except Exception:
            return False
