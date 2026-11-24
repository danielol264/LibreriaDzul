// =====================================================
// ARCHIVO: Frontend/src/services/api.ts
// SERVICIO DE CONEXIÓN CON EL BACKEND DJANGO
// =====================================================


// Importamos AsyncStorage para guardar el token
// de inicio de sesión en el teléfono.
import AsyncStorage from '@react-native-async-storage/async-storage';


// =====================================================
// DIRECCIÓN DEL BACKEND
// =====================================================

// Esta es la dirección de tu computadora en la red Wi-Fi.
// Si cambia la IP, debes actualizarla aquí.
//
// No usamos localhost porque Expo Go se ejecuta
// en el teléfono y necesita acceder a la computadora.

const API_URL = 'http://10.167.8.242:8000/api';


// =====================================================
// FUNCIONES PARA MANEJAR EL TOKEN
// =====================================================


// Guardar el token después de iniciar sesión.
export async function guardarToken(token: string) {
    await AsyncStorage.setItem('token', token);
}


// Obtener el token guardado.
export async function obtenerToken() {
    return await AsyncStorage.getItem('token');
}


// Eliminar el token al cerrar sesión.
export async function eliminarToken() {
    await AsyncStorage.removeItem('token');
}


// =====================================================
// FUNCIÓN PARA INICIAR SESIÓN
// =====================================================


// Envía el usuario y contraseña al backend.
// Si el inicio de sesión es correcto, guarda el token.

export async function iniciarSesion(
    user: string,
    password: string
) {
    const respuesta = await fetch(`${API_URL}/login/`, {
        method: 'POST',

        headers: {
            'Content-Type': 'application/json',
        },

        body: JSON.stringify({
            user: user,
            password: password,
        }),
    });

    const datos = await respuesta.json();

    // Si Django devuelve un error, lo mostramos.
    if (!respuesta.ok) {
        throw new Error(
            datos.detail || 'No se pudo iniciar sesión'
        );
    }

    // Guardamos el token que devuelve Django.
    if (datos.token) {
        await guardarToken(datos.token);
    }

    // Regresamos los datos del usuario.
    return datos;
}


// =====================================================
// FUNCIÓN PARA CONSULTAR LIBROS
// =====================================================


// Obtiene los libros registrados en Django.
// Necesita el token de autenticación.

export async function obtenerLibros() {
    const token = await obtenerToken();

    const respuesta = await fetch(`${API_URL}/libros/`, {
        method: 'GET',

        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        },
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(
            datos.detail || 'No se pudieron consultar los libros'
        );
    }

    return datos;
}


// =====================================================
// FUNCIÓN PARA REGISTRAR UN LIBRO
// =====================================================


// Envía los datos del formulario para registrar
// un nuevo libro en la base de datos.

export async function registrarLibro(
    libro: Record<string, any>
) {
    const token = await obtenerToken();

    const respuesta = await fetch(`${API_URL}/libros/`, {
        method: 'POST',

        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        },

        body: JSON.stringify(libro),
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(
            datos.detail || 'No se pudo registrar el libro'
        );
    }

    return datos;
}


// =====================================================
// FUNCIÓN PARA EDITAR UN LIBRO
// =====================================================


// Modifica un libro utilizando su ID.
// PATCH permite actualizar solamente los campos enviados.

export async function editarLibro(
    id: number,
    libro: Record<string, any>
) {
    const token = await obtenerToken();

    const respuesta = await fetch(
        `${API_URL}/libros/${id}/`,
        {
            method: 'PATCH',

            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },

            body: JSON.stringify(libro),
        }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(
            datos.detail || 'No se pudo editar el libro'
        );
    }

    return datos;
}


// =====================================================
// FUNCIÓN PARA ELIMINAR UN LIBRO
// =====================================================


// Elimina un libro utilizando su ID.

export async function eliminarLibro(id: number) {
    const token = await obtenerToken();

    const respuesta = await fetch(
        `${API_URL}/libros/${id}/`,
        {
            method: 'DELETE',

            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
        }
    );

    if (!respuesta.ok) {
        throw new Error(
            'No se pudo eliminar el libro'
        );
    }

    // DELETE normalmente no devuelve contenido.
    return true;
}


// =====================================================
// FUNCIÓN PARA CONSULTAR AUTORES
// =====================================================


// Obtiene la lista de autores registrados.

export async function obtenerAutores() {
    const token = await obtenerToken();

    const respuesta = await fetch(
        `${API_URL}/autores/`,
        {
            method: 'GET',

            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
        }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(
            datos.detail || 'No se pudieron consultar los autores'
        );
    }

    return datos;
}


// =====================================================
// FUNCIÓN PARA CONSULTAR CATEGORÍAS
// =====================================================


// Obtiene la lista de categorías registradas.

export async function obtenerCategorias() {
    const token = await obtenerToken();

    const respuesta = await fetch(
        `${API_URL}/categorias/`,
        {
            method: 'GET',

            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
        }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(
            datos.detail || 'No se pudieron consultar las categorías'
        );
    }

    return datos;
}


// =====================================================
// FUNCIÓN PARA CONSULTAR EDITORIALES
// =====================================================


// Obtiene la lista de editoriales registradas.

export async function obtenerEditoriales() {
    const token = await obtenerToken();

    const respuesta = await fetch(
        `${API_URL}/editoriales/`,
        {
            method: 'GET',

            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
        }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(
            datos.detail || 'No se pudieron consultar las editoriales'
        );
    }

    return datos;
}