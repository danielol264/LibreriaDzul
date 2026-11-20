from django.db import models


class User(models.Model):
    ROL = (
        ('ADMIN', 'Administrador'),
        ('CLIENT', 'Cliente'),
    )
    user = models.CharField(max_length=30, unique=True)
    password = models.CharField(max_length=128)
    rol = models.CharField(max_length=20, choices=ROL)
    modificationDate = models.DateTimeField(auto_now=True)
    activo = models.BooleanField(default=True)


class Autor(models.Model):
    nombreAutor = models.CharField(max_length=30)
    Ap = models.CharField(max_length=30)
    Am = models.CharField(max_length=30)
    nacionalidad = models.CharField(max_length=30)
    fechaNacimiento = models.DateField()


class Editorial(models.Model):
    nombreEditorial = models.CharField(max_length=30)
    nombreCalle = models.CharField(max_length=30)
    numeral = models.CharField(max_length=10)
    interior = models.CharField(max_length=10)
    colonia = models.CharField(max_length=50)
    activo = models.BooleanField(default=True)


class Categoria(models.Model):
    nombreCategoria = models.CharField(max_length=30)
    orden = models.IntegerField()
    activo = models.BooleanField(default=True)


class Libro(models.Model):
    ISBN = models.CharField(max_length=30)
    nombreLibro = models.CharField(max_length=40)
    existencias = models.IntegerField()
    paginas = models.IntegerField()
    urlImagen=models.CharField(max_length=100)
    editorial = models.ForeignKey(Editorial, on_delete=models.CASCADE)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    autor = models.ForeignKey(Autor, on_delete=models.CASCADE)


class LibroOperacion(models.Model):
    OPERACIONES = (
        ('VENTA', 'Venta'),
        ('RENTA', 'Renta'),
    )
    libro = models.ForeignKey(Libro, on_delete=models.CASCADE)
    solicitante = models.ForeignKey(User, on_delete=models.CASCADE, related_name='operaciones_solicitadas')
    prestador = models.ForeignKey(User, on_delete=models.CASCADE, related_name='operaciones_prestadas')
    fechaInicio = models.DateTimeField(auto_now_add=True)
    fechaTermino = models.DateTimeField(null=True, blank=True)
    operacion = models.CharField(max_length=30, choices=OPERACIONES)