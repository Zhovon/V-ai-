import os
import httpx
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

NOVITA_KEY = os.getenv("NOVITA_KEY")
PIAPI_KEY = os.getenv("PIAPI_KEY")

class NovitaAIProvider:
    """Provider for Novita AI (Wan 2.1)"""
    BASE_URL = "https://api.novita.ai/v3/async"

    @staticmethod
    async def submit_job(prompt: str, model: str = "wan-2.1", image_url: Optional[str] = None) -> str:
        if not NOVITA_KEY:
            logger.warning("NOVITA_KEY is not set. Mocking Novita AI job submission.")
            return "mock_novita_job_id"
        
        endpoint = f"{NovitaAIProvider.BASE_URL}/video-generation"
        headers = {
            "Authorization": f"Bearer {NOVITA_KEY}",
            "Content-Type": "application/json"
        }
        
        # Base payload for Novita's Wan API
        payload = {
            "model_name": "wan-video-1.3b", # Placeholder actual model name per docs
            "prompt": prompt,
            "width": 1280,
            "height": 720,
            "frames": 81 # ~5 seconds at 16fps
        }
        
        if image_url:
            payload["image"] = image_url
            payload["model_name"] = "wan-image-to-video-1.3b"
            
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(endpoint, headers=headers, json=payload, timeout=10.0)
                response.raise_for_status()
                data = response.json()
                return data.get("task_id", "")
            except Exception as e:
                logger.error(f"Novita AI submission failed: {e}")
                raise ValueError(f"Failed to submit to Novita AI: {e}")

    @staticmethod
    async def submit_chat(messages: list, model: str = "meta/meta-llama-3-8b-instruct") -> str:
        if not NOVITA_KEY:
            logger.info("NOVITA_KEY is not set. Falling back to Pollinations AI (Free) for LLM testing.")
            endpoint = "https://text.pollinations.ai/"
            payload = {
                "messages": messages,
                "model": "openai" # Pollinations uses openai compatible format and will auto-route to a free model
            }
            async with httpx.AsyncClient() as client:
                try:
                    response = await client.post(endpoint, json=payload, timeout=20.0)
                    response.raise_for_status()
                    return response.text
                except Exception as e:
                    logger.error(f"Pollinations AI fallback failed: {e}")
                    return f"Fallback LLM failed: {e}"
        
        endpoint = "https://api.novita.ai/v3/openai/chat/completions"
        headers = {
            "Authorization": f"Bearer {NOVITA_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": 512,
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(endpoint, headers=headers, json=payload, timeout=20.0)
                response.raise_for_status()
                data = response.json()
                return data.get("choices", [])[0].get("message", {}).get("content", "")
            except Exception as e:
                logger.error(f"Novita LLM submission failed: {e}")
                raise ValueError(f"Failed to submit to Novita LLM: {e}")

    @staticmethod
    async def get_job_status(task_id: str) -> dict:
        if not NOVITA_KEY or task_id.startswith("mock_"):
            return {"status": "completed", "result_url": "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4"}
            
        endpoint = f"https://api.novita.ai/v3/async/task-result?task_id={task_id}"
        headers = {
            "Authorization": f"Bearer {NOVITA_KEY}",
        }
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(endpoint, headers=headers, timeout=10.0)
                response.raise_for_status()
                data = response.json()
                
                status_raw = data.get("task", {}).get("status", "")
                normalized_status = "processing"
                result_url = None
                
                if status_raw == "TASK_STATUS_SUCCEED":
                    normalized_status = "completed"
                    videos = data.get("images", []) # Novita often returns videos in an 'images' or 'videos' array
                    if videos:
                        result_url = videos[0].get("image_url") or videos[0].get("video_url")
                elif status_raw in ["TASK_STATUS_FAILED", "TASK_STATUS_CANCELED"]:
                    normalized_status = "failed"
                    
                return {"status": normalized_status, "result_url": result_url}
            except Exception as e:
                logger.error(f"Novita AI status check failed: {e}")
                return {"status": "failed", "result_url": None}


class PiAPIProvider:
    """Aggregator Provider for ZImage, Kling 3.0, Face Swap, and Lip Sync"""
    BASE_URL = "https://api.piapi.ai/api/v1"

    @staticmethod
    async def submit_job(
        prompt: str, 
        task_type: str = "text2image", 
        model: str = "zimage-turbo", 
        extra_inputs: Dict[str, Any] = None
    ) -> str:
        if not PIAPI_KEY:
            logger.warning("PIAPI_KEY is not set. Mocking PiAPI job submission.")
            return "mock_piapi_job_id"
            
        endpoint = f"{PiAPIProvider.BASE_URL}/task"
        headers = {
            "x-api-key": PIAPI_KEY,
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": model,
            "task_type": task_type,
            "input": {
                "prompt": prompt
            }
        }
        
        if extra_inputs:
            payload["input"].update(extra_inputs)
            
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(endpoint, headers=headers, json=payload, timeout=15.0)
                response.raise_for_status()
                data = response.json()
                return data.get("data", {}).get("task_id", "")
            except Exception as e:
                logger.error(f"PiAPI submission failed: {e}")
                raise ValueError(f"Failed to submit to PiAPI: {e}")

    @staticmethod
    async def get_job_status(task_id: str) -> dict:
        if not PIAPI_KEY or task_id.startswith("mock_"):
            return {"status": "completed", "result_url": "https://picsum.photos/seed/zimage/800/600"}
            
        endpoint = f"{PiAPIProvider.BASE_URL}/task/{task_id}"
        headers = {
            "x-api-key": PIAPI_KEY,
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(endpoint, headers=headers, timeout=10.0)
                response.raise_for_status()
                data = response.json()
                
                status_raw = data.get("data", {}).get("status", "").lower()
                normalized_status = status_raw
                if status_raw == "success":
                   normalized_status = "completed"
                
                result_url = None
                if normalized_status == "completed":
                    outputs = data.get("data", {}).get("output", [])
                    if outputs and isinstance(outputs, list):
                        result_url = outputs[0]
                    elif isinstance(outputs, dict):
                        result_url = outputs.get("image_url") or outputs.get("video_url")
                
                return {"status": normalized_status, "result_url": result_url}
            except Exception as e:
                logger.error(f"PiAPI status check failed: {e}")
                return {"status": "failed", "result_url": None}
