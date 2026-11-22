from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from .models import UserToken


class CustomTokenAuthentication(BaseAuthentication):

    def authenticate(self, request):

        # Obtenemos el token enviado en la petición
        auth = request.headers.get("Authorization")

        # Si no se envió token, dejamos que DRF continúe
        if not auth:
            return None

        # Verificamos que tenga el formato correcto
        partes = auth.split()

        if len(partes) != 2 or partes[0] != "Token":
            raise AuthenticationFailed(
                "Formato de token inválido"
            )

        key = partes[1]

        # Buscamos el token en nuestra base de datos
        try:
            token = UserToken.objects.select_related(
                "usuario"
            ).get(key=key)

        except UserToken.DoesNotExist:
            raise AuthenticationFailed(
                "Token inválido"
            )

        # Verificamos que el usuario esté activo
        if not token.usuario.activo:
            raise AuthenticationFailed(
                "La cuenta está desactivada"
            )

        # Devolvemos el usuario y el token
        return (token.usuario, token)