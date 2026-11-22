from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrReadOnly(BasePermission):
    """
    Permite consultar información a usuarios autenticados.
    Solo permite modificar información a usuarios ADMIN.
    """

    def has_permission(self, request, view):

        # Consultas: GET, HEAD y OPTIONS
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated

        # Crear, editar o eliminar requiere rol ADMIN
        return (
            request.user.is_authenticated
            and request.user.rol == "ADMIN"
        )