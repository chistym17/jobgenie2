from fastapi import APIRouter

from .upload_resume_v2 import router as upload_resume_v2_router
from .status_v2 import router as status_v2_router
from .resume_detail_v2 import router as resume_detail_v2_router


router = APIRouter()

router.include_router(upload_resume_v2_router)
router.include_router(status_v2_router)
router.include_router(resume_detail_v2_router)


