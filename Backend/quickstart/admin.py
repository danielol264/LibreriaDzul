from django.contrib import admin

# Importamos los modelos que creamos en models.py
from .models import (
    Autor,
    Editorial,
    Categoria,
    Libro,
    LibroOperacion
)


# Registramos el modelo Autor en el administrador
@admin.register(Autor)
class AutorAdmin(admin.ModelAdmin):

    # Columnas que aparecerán en la lista de autores
    list_display = (
        'nombreAutor',
        'Ap',
        'Am',
        'nacionalidad',
        'fechaNacimiento'
    )

    # Permite buscar autores por nombre o apellidos
    search_fields = (
        'nombreAutor',
        'Ap',
        'Am'
    )


# Registramos el modelo Editorial
@admin.register(Editorial)
class EditorialAdmin(admin.ModelAdmin):

    # Columnas que aparecerán en la lista de editoriales
    list_display = (
        'nombreEditorial',
        'nombreCalle',
        'numeral',
        'colonia',
        'activo'
    )

    # Permite buscar editoriales por su nombre
    search_fields = ('nombreEditorial',)

    # Permite filtrar editoriales activas o inactivas
    list_filter = ('activo',)


# Registramos el modelo Categoria
@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):

    # Columnas que aparecerán en la lista de categorías
    list_display = (
        'nombreCategoria',
        'orden',
        'activo'
    )

    # Permite buscar categorías por nombre
    search_fields = ('nombreCategoria',)

    # Permite filtrar categorías por estado
    list_filter = ('activo',)


# Registramos el modelo Libro
@admin.register(Libro)
class LibroAdmin(admin.ModelAdmin):

    # Columnas que aparecerán en la lista de libros
    list_display = (
        'ISBN',
        'nombreLibro',
        'existencias',
        'paginas',
        'editorial',
        'categoria',
        'autor'
    )

    # Permite buscar libros por ISBN o nombre
    search_fields = (
        'ISBN',
        'nombreLibro'
    )

    # Permite filtrar libros por editorial y categoría
    list_filter = (
        'editorial',
        'categoria'
    )


# Registramos el modelo LibroOperacion
@admin.register(LibroOperacion)
class LibroOperacionAdmin(admin.ModelAdmin):

    # Columnas que aparecerán en la lista de operaciones
    list_display = (
        'libro',
        'solicitante',
        'prestador',
        'fechaInicio',
        'fechaTermino',
        'operacion'
    )

    # Permite buscar operaciones por libro o usuario
    search_fields = (
        'libro__nombreLibro',
        'solicitante__user',
        'prestador__user'
    )

    # Permite filtrar operaciones por tipo
    list_filter = ('operacion',)