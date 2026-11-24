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

    # Permitimos que la imagen pueda enviarse vacía
    urlImagen = serializers.CharField(
        required=False,
        allow_blank=True
    )

    # Serializers anidados para mostrar información relacionada
    autorDetalle = AutorSerializer(
        source="autor",
        read_only=True
    )

    editorialDetalle = EditorialSerializer(
        source="editorial",
        read_only=True
    )

    categoriaDetalle = CategoriaSerializer(
        source="categoria",
        read_only=True
    )

    class Meta:
        model = Libro
        fields = "__all__"

    # Validamos que el ISBN no esté registrado en otro libro
    def validate_ISBN(self, value):

        libros_existentes = Libro.objects.filter(
            ISBN=value
        )

        # Si estamos editando, excluimos el libro actual
        if self.instance:
            libros_existentes = libros_existentes.exclude(
                id=self.instance.id
            )

        if libros_existentes.exists():
            raise serializers.ValidationError(
                "Ya existe un libro registrado con este ISBN."
            )

        return value

    # Validamos que las existencias no sean negativas
    def validate_existencias(self, value):

        if value < 0:
            raise serializers.ValidationError(
                "Las existencias no pueden ser negativas."
            )

        return value

    # Validamos que el libro tenga al menos una página
    def validate_paginas(self, value):

        if value <= 0:
            raise serializers.ValidationError(
                "El número de páginas debe ser mayor que cero."
            )

        return value

# Serializer para operaciones de venta o renta
class LibroOperacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LibroOperacion
        fields = "__all__"