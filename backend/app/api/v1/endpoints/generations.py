from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.schemas import GenerationJobCreate, GenerationJob
from app.services.services import GenerationJobService
from app.core.dependencies import get_current_user
from app.models.models import User
from app.services.ai_providers import NovitaAIProvider, PiAPIProvider

router = APIRouter(prefix="/generations", tags=["generations"])


@router.post("", response_model=GenerationJob)
async def create_job(
    job: GenerationJobCreate,
    db: AsyncSession = Depends(get_db),
    authorization: str = Header(None),
):
    """Create a new generation job"""
    token = authorization.replace("Bearer ", "") if authorization else ""
    user = await get_current_user(token, db)
    service = GenerationJobService(db)
    
    # Create the job in DB first as pending
    db_job = await service.create_job(job, user.id)
    
    provider_job_id = None
    try:
        # Submit to appropriate provider
        if job.provider == "piapi":
            if job.model_used in ["zimage-turbo", "nanobanana-2"]:
                provider_job_id = await PiAPIProvider.submit_job(prompt=job.prompt or "", task_type="text2image", model=job.model_used, extra_inputs=job.extra_inputs)
            elif job.model_used == "kling3":
                kling_task = "text2video"
                if job.extra_inputs:
                    if job.extra_inputs.get("video_url"):
                        kling_task = "video2video"
                    elif job.extra_inputs.get("image_url"):
                        kling_task = "image2video"
                provider_job_id = await PiAPIProvider.submit_job(prompt=job.prompt or "", task_type=kling_task, model="kling-video-3.0", extra_inputs=job.extra_inputs)
            elif job.model_used == "faceswap":
                provider_job_id = await PiAPIProvider.submit_job(prompt="", task_type="faceswap", model="faceswap-video", extra_inputs=job.extra_inputs)
            elif job.model_used == "lipsync":
                provider_job_id = await PiAPIProvider.submit_job(prompt="", task_type="lipsync", model="lipsync-video", extra_inputs=job.extra_inputs)
            else: # Fallback
                provider_job_id = await PiAPIProvider.submit_job(prompt=job.prompt or "", extra_inputs=job.extra_inputs)
        elif job.provider == "novita":
            image_url = job.extra_inputs.get("image_url") if job.extra_inputs else None
            provider_job_id = await NovitaAIProvider.submit_job(prompt=job.prompt or "", model="wan-2.1", image_url=image_url)
        
        # Update job with the provider job ID and set to processing
        if provider_job_id:
            db_job = await service.update_job_status(db_job.id, "processing", provider_job_id=provider_job_id)
            
    except Exception as e:
        await service.update_job_status(db_job.id, "failed")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
        
    return db_job


@router.get("/{job_id}", response_model=GenerationJob)
async def get_job(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    authorization: str = Header(None),
):
    """Get generation job details and update status from provider"""
    token = authorization.replace("Bearer ", "") if authorization else ""
    user = await get_current_user(token, db)
    service = GenerationJobService(db)
    job = await service.get_job(job_id)
    
    if not job or job.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )
        
    # Check status dynamically if processing
    if job.status == "processing" and job.provider_job_id:
        status_data = {}
        try:
            if job.provider == "piapi":
                status_data = await PiAPIProvider.get_job_status(job.provider_job_id)
            elif job.provider == "novita":
                status_data = await NovitaAIProvider.get_job_status(job.provider_job_id)
                
            new_status = status_data.get("status", "processing")
            result_url = status_data.get("result_url")
            
            if new_status in ["completed", "failed"] and new_status != job.status:
                job = await service.update_job_status(
                    job.id, 
                    status=new_status, 
                    result_url=result_url
                )
        except Exception as e:
            # Non-fatal, just means we couldn't check status this time
            pass
    
    return job


@router.get("")
async def list_jobs(
    db: AsyncSession = Depends(get_db),
    authorization: str = Header(None),
):
    """List user's generation jobs"""
    token = authorization.replace("Bearer ", "") if authorization else ""
    user = await get_current_user(token, db)
    service = GenerationJobService(db)
    return await service.get_user_jobs(user.id)


@router.patch("/{job_id}/status")
async def update_job_status(
    job_id: int,
    status: str,
    result_url: str = None,
    provider_job_id: str = None,
    db: AsyncSession = Depends(get_db),
    authorization: str = Header(None),
):
    """Update job status (admin only)"""
    token = authorization.replace("Bearer ", "") if authorization else ""
    user = await get_current_user(token, db)
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    
    service = GenerationJobService(db)
    try:
        return await service.update_job_status(job_id, status, result_url, provider_job_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
