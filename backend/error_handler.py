from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import traceback
import logging
import json
from typing import Dict, Any, Optional, Union

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("api_errors.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("tickrify-api")

class ErrorHandler:
    """
    Manipulador de erros centralizado para a API
    """
    
    @staticmethod
    async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        """
        Manipulador de exceções HTTP
        """
        # Log do erro
        logger.error(f"HTTP Exception: {exc.status_code} - {exc.detail}")
        logger.error(f"Request path: {request.url.path}")
        
        # Construir resposta de erro
        error_response = {
            "status": "error",
            "code": exc.status_code,
            "message": exc.detail,
            "path": request.url.path
        }
        
        # Adicionar detalhes específicos para certos códigos de erro
        if exc.status_code == 401:
            error_response["message"] = "Autenticação necessária para acessar este recurso"
            error_response["details"] = "Verifique se o token de acesso é válido"
        elif exc.status_code == 403:
            error_response["message"] = "Você não tem permissão para acessar este recurso"
            error_response["details"] = "Verifique se sua assinatura está ativa"
        elif exc.status_code == 429:
            error_response["message"] = "Limite de requisições excedido"
            error_response["details"] = "Aguarde um momento ou faça upgrade do seu plano"
        
        return JSONResponse(
            status_code=exc.status_code,
            content=error_response
        )
    
    @staticmethod
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        """
        Manipulador de exceções de validação de dados
        """
        # Log do erro
        logger.error(f"Validation Error: {exc}")
        logger.error(f"Request path: {request.url.path}")
        
        # Extrair erros de validação
        errors = []
        for error in exc.errors():
            error_detail = {
                "location": error["loc"],
                "message": error["msg"],
                "type": error["type"]
            }
            errors.append(error_detail)
        
        # Construir resposta de erro
        error_response = {
            "status": "error",
            "code": status.HTTP_422_UNPROCESSABLE_ENTITY,
            "message": "Erro de validação de dados",
            "path": request.url.path,
            "details": errors
        }
        
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=error_response
        )
    
    @staticmethod
    async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        """
        Manipulador de exceções gerais
        """
        # Log detalhado do erro
        logger.error(f"Unhandled Exception: {str(exc)}")
        logger.error(f"Request path: {request.url.path}")
        logger.error(traceback.format_exc())
        
        # Construir resposta de erro
        error_response = {
            "status": "error",
            "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
            "message": "Erro interno do servidor",
            "path": request.url.path
        }
        
        # Em ambiente de desenvolvimento, incluir detalhes do erro
        import os
        if os.getenv("ENVIRONMENT") == "development":
            error_response["details"] = str(exc)
            error_response["traceback"] = traceback.format_exc().split("\n")
        
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=error_response
        )

class APIException(Exception):
    """
    Exceção personalizada para erros de API
    """
    def __init__(
        self, 
        status_code: int, 
        message: str, 
        details: Optional[Union[str, Dict[str, Any]]] = None,
        error_code: Optional[str] = None
    ):
        self.status_code = status_code
        self.message = message
        self.details = details
        self.error_code = error_code
        super().__init__(self.message)

async def api_exception_handler(request: Request, exc: APIException) -> JSONResponse:
    """
    Manipulador de exceções personalizadas de API
    """
    # Log do erro
    logger.error(f"API Exception: {exc.status_code} - {exc.message}")
    logger.error(f"Request path: {request.url.path}")
    if exc.details:
        logger.error(f"Details: {exc.details}")
    
    # Construir resposta de erro
    error_response = {
        "status": "error",
        "code": exc.status_code,
        "message": exc.message,
        "path": request.url.path
    }
    
    # Adicionar detalhes se disponíveis
    if exc.details:
        error_response["details"] = exc.details
    
    # Adicionar código de erro se disponível
    if exc.error_code:
        error_response["error_code"] = exc.error_code
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response
    )

def register_exception_handlers(app):
    """
    Registra todos os manipuladores de exceções na aplicação
    """
    app.add_exception_handler(StarletteHTTPException, ErrorHandler.http_exception_handler)
    app.add_exception_handler(RequestValidationError, ErrorHandler.validation_exception_handler)
    app.add_exception_handler(Exception, ErrorHandler.general_exception_handler)
    app.add_exception_handler(APIException, api_exception_handler)


