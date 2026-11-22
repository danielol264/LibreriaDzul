from rest_framework import serializers
from django.contrib.auth.hashers import make_password

# Importamos los modelos propios de nuestra aplicación
from .models import User, Editorial, Autor, Categoria, Libro, LibroOperacion


# Serializer para usuarios (administradores y clientes)
class UserSerializer(serializers.ModelSerializer):

    # La contraseña se puede recibir, pero nunca se devuelve
    password = serializers.CharField(
        write_only=True,
        required=True
    )

    class Meta:
        model = User
        fields = [
            "id",
            "user",
            "password",
            "rol",
            "modificationDate",
            "activo",
        ]

        # Estos campos son generados por Django
        read_only_fields = ["id", "modificationDate"]

    # Se ejecuta cuando se registra un usuario
    def create(self, validated_data):

        # Obtenemos la contraseña enviada
        password = validated_data.pop("password")

        # Creamos el usuario
        usuario = User(**validated_data)

        # Guardamos la contraseña mediante hash
        usuario.password = make_password(password)

        # Guardamos el registro en la base de datos
        usuario.save()

        return usuario

    # Se ejecuta cuando se modifica un usuario
    def update(self, instance, validated_data):

        # Si se envía una contraseña nueva, la protegemos
        password = validated_data.pop("password", None)

        # Actualizamos los demás campos
        for campo, valor in validated_data.items():
            setattr(instance, campo, valor)

        # Actualizamos la contraseña solo si se proporcionó
        if password:
            instance.password = make_password(password)

        instance.save()

        return instance

# Serializer para editoriales
class EditorialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Editorial
        fields = "__all__"


# Serializer para autores
class AutorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Autor
        fields = "__all__"


# Serializer para categorías
class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = "__all__"


# Serializer para libros
class LibroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Libro
        fields = "__all__"


# Serializer para operaciones de venta o renta
class LibroOperacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LibroOperacion
        fields = "__all__"