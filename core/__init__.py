from typing import Any, Optional
from fastapi import status


def success(data: Any = None, message: str = "Success") -> dict:
    return {
        "status": "success",
        "message": message,
        "data": data
    }


def error(message: str = "Error", code: int = status.HTTP_400_BAD_REQUEST) -> dict:
    return {
        "status": "error",
        "message": message,
        "code": code
    }
