from django.contrib import admin
from django.urls import path, include

# Importamos las herramientas para crear rutas de la API
from rest_framework.routers import DefaultRouter

# Importamos las vistas de nuestra aplicación
from quickstart import views


# Creamos un router para registrar automáticamente las rutas
router = DefaultRouter()

# Registramos las vistas y sus direcciones
router.register(r'usuarios', views.UserViewSet)
router.register(r'editoriales', views.EditorialViewSet)
router.register(r'autores', views.AutorViewSet)
router.register(r'categorias', views.CategoriaViewSet)
router.register(r'libros', views.LibroViewSet)
router.register(r'operaciones', views.LibroOperacionViewSet)


urlpatterns = [
    # Panel administrativo de Django
    path('admin/', admin.site.urls),

    path('api/login/', views.LoginView.as_view(), name='login'),

    # Rutas de nuestra API
    path('api/', include(router.urls)),

]