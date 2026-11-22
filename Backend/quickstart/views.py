from rest_framework import viewsets, mixins

from rest_framework.permissions import AllowAny, IsAuthenticated

import secrets

from django.contrib.auth.hashers import check_password
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

# Importamos los modelos de nuestra aplicación
from .models import User, Editorial, Autor, Categoria, Libro, LibroOperacion, UserToken

# Importamos los serializers
from .serializers import (
    UserSerializer,
    EditorialSerializer,
    AutorSerializer,
    CategoriaSerializer,
    LibroSerializer,
    LibroOperacionSerializer,
)
from .permissions import IsAdminOrReadOnly

# Vista para administrar usuarios
# Vista para registrar clientes
class UserViewSet(
    mixins.CreateModelMixin,
    viewsets.GenericViewSet
):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    # Permite registrar una cuenta sin iniciar sesión
    permission_classes = [AllowAny]

# Vista para administrar editoriales
class EditorialViewSet(viewsets.ModelViewSet):
    queryset = Editorial.objects.all()
    serializer_class = EditorialSerializer
    permission_classes = [IsAdminOrReadOnly]


# Vista para administrar autores
class AutorViewSet(viewsets.ModelViewSet):
    queryset = Autor.objects.all()
    serializer_class = AutorSerializer
    permission_classes = [IsAdminOrReadOnly]


# Vista para administrar categorías
class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsAdminOrReadOnly]


# Vista para administrar libros
class LibroViewSet(viewsets.ModelViewSet):
    queryset = Libro.objects.all()
    serializer_class = LibroSerializer
    permission_classes = [IsAdminOrReadOnly]


# Vista para administrar operaciones de libros
class LibroOperacionViewSet(viewsets.ModelViewSet):
    queryset = LibroOperacion.objects.all()
    serializer_class = LibroOperacionSerializer
    permission_classes = [IsAdminOrReadOnly]

# Vista para iniciar sesión con usuarios personalizados
class LoginView(APIView):

    # El inicio de sesión es público
    permission_classes = [AllowAny]

    def post(self, request):

        # Recibimos el usuario y la contraseña
        nombre_usuario = request.data.get("user")
        password = request.data.get("password")

        # Verificamos que ambos campos estén presentes
        if not nombre_usuario or not password:
            return Response(
                {"error": "Debes ingresar usuario y contraseña"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Buscamos la cuenta en nuestro modelo personalizado
        try:
            usuario = User.objects.get(user=nombre_usuario)
        except User.DoesNotExist:
            return Response(
                {"error": "Usuario o contraseña incorrectos"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Comprobamos que la cuenta esté activa
        if not usuario.activo:
            return Response(
                {"error": "La cuenta está desactivada"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Verificamos la contraseña protegida con hash
        if not check_password(password, usuario.password):
            return Response(
                {"error": "Usuario o contraseña incorrectos"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Generamos un token si el usuario no tiene uno
        token, creado = UserToken.objects.get_or_create(
            usuario=usuario,
            defaults={"key": secrets.token_hex(32)}
        )

        # Respondemos sin incluir la contraseña
        return Response(
            {
                "message": "Inicio de sesión exitoso",
                "user": usuario.user,
                "rol": usuario.rol,
                "token": token.key
            },
            status=status.HTTP_200_OK
        )