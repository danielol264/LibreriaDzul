from django.contrib.auth.models import User,Editorial,Autor,Categoria,Libro,LibroOperaciones
from rest_framework import serializers


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields="__all__" 


class EditorialSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Editorial
        fields="__all__" 
    
class AutorSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Autor
        fields ="__all__"

class CategoriaSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Categoria
        fields="__all__" 

class LibroSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Libro
        fields="__all__" 

class LibroOperacionesSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = LibroOperaciones
        fields="__all__" 