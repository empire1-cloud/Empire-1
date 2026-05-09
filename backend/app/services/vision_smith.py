import uuid
import httpx
import logging
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


def _azure_client():
    from openai import AzureOpenAI
    return AzureOpenAI(
        api_key=settings.AZURE_OPENAI_KEY,
        azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
        api_version=settings.AZURE_OPENAI_API_VERSION,
    )


class VisionSmithCore:
    """
    Vision Smith — Azure DALL-E 3 image generation.
    Carbon/Glass UI aesthetic. SGV Backgrounds. Visual Asset Forging.
    """

    async def generate(self, prompt: str, size: str = "1024x1024", quality: str = "hd") -> dict:
        client = _azure_client()
        response = client.images.generate(
            model=settings.AZURE_DALLE_DEPLOYMENT,
            prompt=prompt,
            size=size,
            quality=quality,
            n=1,
        )
        image_url = response.data[0].url
        revised_prompt = response.data[0].revised_prompt or prompt
        image_id = str(uuid.uuid4())

        # Download and persist locally
        output_dir = Path("static/images")
        try:
            output_dir.mkdir(parents=True, exist_ok=True)
        except OSError as e:
            logger.warning(f"Could not create directory {output_dir}: {e}")
        output_path = output_dir / f"{image_id}.png"

        async with httpx.AsyncClient() as http:
            img_resp = await http.get(image_url, timeout=60)
            img_resp.raise_for_status()
            output_path.write_bytes(img_resp.content)

        return {
            "image_id": image_id,
            "path": str(output_path),
            "url": image_url,
            "revised_prompt": revised_prompt,
            "model": "dall-e-3",
            "size": size,
            "quality": quality,
        }

    async def upscale(self, file_path: str, scale: int) -> dict:
        """
        Azure DALL-E 3 does not support native upscale.
        Re-generates at 1792x1024 (highest available) using the original as prompt context.
        """
        upscaled_id = str(uuid.uuid4())
        output_dir = Path("static/images/upscaled")
        try:
            output_dir.mkdir(parents=True, exist_ok=True)
        except OSError as e:
            logger.warning(f"Could not create directory {output_dir}: {e}")

        client = _azure_client()
        response = client.images.generate(
            model=settings.AZURE_DALLE_DEPLOYMENT,
            prompt=f"High resolution upscaled version, ultra detailed: {file_path}",
            size="1792x1024",
            quality="hd",
            n=1,
        )
        image_url = response.data[0].url
        output_path = output_dir / f"{upscaled_id}.png"

        async with httpx.AsyncClient() as http:
            img_resp = await http.get(image_url, timeout=60)
            img_resp.raise_for_status()
            output_path.write_bytes(img_resp.content)

        return {
            "image_id": upscaled_id,
            "path": str(output_path),
            "url": image_url,
            "scale": scale,
        }

    async def get_metadata(self, image_id: str) -> dict:
        output_path = Path(f"static/images/{image_id}.png")
        return {
            "image_id": image_id,
            "model": "dall-e-3",
            "provider": "azure",
            "exists": output_path.exists(),
            "path": str(output_path),
            "status": "active",
        }


class VisionSmith:
    """Public service wrapper used by FastAPI routers."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.engine = VisionSmithCore()
        try:
            Path("static/images").mkdir(parents=True, exist_ok=True)
        except OSError as e:
            logger.warning(f"Could not create directory static/images: {e}")
        try:
            Path("static/images/upscaled").mkdir(parents=True, exist_ok=True)
        except OSError as e:
            logger.warning(f"Could not create directory static/images/upscaled: {e}")

    async def generate(self, prompt: str, size: str = "1024x1024", quality: str = "hd") -> dict:
        return await self.engine.generate(prompt, size, quality)

    async def upscale(self, file_path: str, scale: int) -> dict:
        return await self.engine.upscale(file_path, scale)

    async def get_metadata(self, image_id: str) -> dict:
        return await self.engine.get_metadata(image_id)

    # TEXT → IMAGE
    # -----------------------------------------------------
    async def generate(self, prompt: str) -> dict:
        return await self.engine.generate(prompt)

    # -----------------------------------------------------
    # UPSCALE
    # -----------------------------------------------------
    async def upscale(self, file, scale: int) -> dict:
        # Save uploaded file temporarily
        temp_id = str(uuid.uuid4())
        temp_path = f"static/images/{temp_id}_temp.png"

        with open(temp_path, "wb") as f:
            f.write(await file.read())

        return await self.engine.upscale(temp_path, scale)

    # -----------------------------------------------------
    # METADATA
    # -----------------------------------------------------
    async def get_metadata(self, image_id: str) -> dict:
        return await self.engine.get_metadata(image_id)
