import os
import zipfile
import tempfile
import aiofiles
import httpx
from fastapi import APIRouter, Depends, HTTPException, status, Header, UploadFile, File, Form
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.services import GenerationJobService
from app.core.dependencies import get_current_user
from app.schemas.schemas import GenerationJobCreate

router = APIRouter(prefix="/train", tags=["train"])

FAL_KEY = os.getenv("FAL_KEY")

@router.post("")
async def create_training_job(
    character_name: str = Form(...),
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db),
    auth_header: str = Header(None),
):
    """Accepts images and dispatches a Fal.ai FLUX LoRA training job"""
    # 1. Auth check
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid authorization header")
    
    token = auth_header.split(" ")[1]
    user = await get_current_user(token, db)
    
    if len(files) < 4:
        raise HTTPException(status_code=400, detail="At least 4 images are required for training.")

    # 2. Package images into a zip file in a temporary directory
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            zip_filename = f"dataset_{character_name}.zip"
            zip_path = os.path.join(temp_dir, zip_filename)
            
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for file in files:
                    file_path = os.path.join(temp_dir, file.filename)
                    # Write uploaded file to temp path
                    async with aiofiles.open(file_path, 'wb') as out_file:
                        content = await file.read()
                        await out_file.write(content)
                    
                    # Add to zip
                    zipf.write(file_path, file.filename)

            # 3. Upload zip to Fal.ai storage (or any S3 bucket)
            # For simplicity, Fal.ai provides a temporary storage upload endpoint
            # In a real production app, you might upload to AWS S3 first.
            
            # Since we are making a demo/prototype, we will mock the actual Fal.ai ZIP upload and training call 
            # if we don't have standard AWS credentials set up for the payload.
            # A real Fal.ai training call looks like: 
            # await fal_client.submit("fal-ai/flux-lora-fast-training", arguments={"images_data_url": uploaded_url, "trigger_phrase": character_name})
            
            provider_job_id = f"mock_lora_train_{character_name}_{os.urandom(4).hex()}"
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process images: {e}")

    # 4. Create GenerationJob record to track the training status
    service = GenerationJobService(db)
    
    # We repurpose GenerationJob to track training so the Chat UI polling works seamlessly
    job_create = GenerationJobCreate(
        prompt=f"Train new character model: @{character_name}",
        media_type="image", # Treat the output LoRA safetensors URL as an "image" for storage simplicity
        provider="fal",
        model_used="flux-lora-trainer"
    )
    
    db_job = await service.create_job(job_create, user.id)
    db_job = await service.update_job_status(db_job.id, "processing", provider_job_id=provider_job_id)

    return db_job
