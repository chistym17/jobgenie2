from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from bson.errors import InvalidId
from typing import List, Dict, Any

from app.services.v2 import recommendation_service
from app.utils.logger_v2 import get_v2_logger

router = APIRouter(prefix="/recommendations", tags=["Recommendations v2"])
logger = get_v2_logger("resume_v2.api.recommendations")


@router.get("", response_model=List[Dict[str, Any]])
async def get_recommendation_history(
    user_email: str = Query(..., description="User email to fetch recommendations for"),
):
    """
    Get all recommendations for a user (recommendation history).
    
    Returns list of recommendation records sorted by creation date (newest first).
    """
    try:
        logger.info("Fetching recommendation history for user_email=%s", user_email)
        recommendations = await recommendation_service.get_recommendations_by_user(user_email)
        logger.info("Found %d recommendation records for user_email=%s", len(recommendations), user_email)
        return recommendations
    except Exception as e:
        logger.error("Error fetching recommendation history for user_email=%s err=%s", user_email, e)
        raise HTTPException(status_code=500, detail=f"Failed to fetch recommendation history: {str(e)}")


@router.get("/{upload_id}", response_model=Dict[str, Any])
async def get_recommendations_by_upload(upload_id: str):
    """
    Get recommendations for a specific upload.
    
    Returns recommendation record with jobs array.
    """
    try:
        logger.info("Fetching recommendations for upload_id=%s", upload_id)
        recommendation = await recommendation_service.get_recommendations_by_upload(upload_id)
        
        if not recommendation:
            raise HTTPException(status_code=404, detail=f"No recommendations found for upload_id={upload_id}")
        
        logger.info("Found recommendations for upload_id=%s", upload_id)
        return recommendation
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error fetching recommendations for upload_id=%s err=%s", upload_id, e)
        raise HTTPException(status_code=500, detail=f"Failed to fetch recommendations: {str(e)}")


@router.delete("/item/{recommendation_id}", response_model=Dict[str, Any])
async def delete_recommendation(recommendation_id: str):
    try:
        logger.info("Deleting recommendation_id=%s", recommendation_id)
        deleted = await recommendation_service.delete_recommendation_by_id(recommendation_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Recommendation not found")
        return {"message": "Recommendation deleted successfully", "recommendation_id": recommendation_id}
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid recommendation id")
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error deleting recommendation_id=%s err=%s", recommendation_id, e)
        raise HTTPException(status_code=500, detail=f"Failed to delete recommendation: {str(e)}")




