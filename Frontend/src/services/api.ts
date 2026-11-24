// =====================================================
// ARCHIVO: Frontend/src/services/api.ts
// SERVICIO DE CONEXIÓN CON EL BACKEND DJANGO
// =====================================================


// Importamos AsyncStorage para guardar el token
// de inicio de sesión en el teléfono.
import AsyncStorage from '@react-native-async-storage/async-storage';

import { File } from 'expo-file-system';

// =====================================================
// DIRECCIÓN DEL BACKEND
// =====================================================

// Esta es la dirección de tu computadora en la red Wi-Fi.
// Si cambia la IP, debes actualizarla aquí.
//
// No usamos localhost porque Expo Go se ejecuta
// en el teléfono y necesita acceder a la computadora.

const API_URL = 'http://172.20.10.4:8000/api';


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

        // Mostramos la respuesta completa de Django.
        console.log('ERROR DEVUELTO POR DJANGO:', datos);

        // Convertimos el error de Django en un mensaje fácil de leer.
        let mensajeError = 'No se pudo registrar el libro.';

        // Si Django devuelve un texto directamente.
        if (typeof datos === 'string') {
            mensajeError = datos;
        } else if (datos && typeof datos === 'object') {

            // Si Django devuelve errores por campo, los reunimos.
            const errores = Object.values(datos).flat();

            if (errores.length > 0) {
                mensajeError = errores.join('\n');
            }
        }

        // Lanzamos el mensaje para mostrarlo en la pantalla.
        throw new Error(mensajeError);
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

        // Convertimos el error de Django en un mensaje fácil de leer.
        let mensajeError = 'No se pudo editar el libro.';

        if (typeof datos === 'string') {
            mensajeError = datos;
        } else if (datos && typeof datos === 'object') {

            // Reunimos los errores que devuelve Django.
            const errores = Object.values(datos).flat();

            if (errores.length > 0) {
                mensajeError = errores.join('\n');
            }
        }

        // Lanzamos el mensaje para mostrarlo en la pantalla.
        throw new Error(mensajeError);
    }

    return datos;
}

// =====================================================
// FUNCIONES PARA REGISTRAR Y EDITAR LIBROS CON IMAGEN
// =====================================================

// Envía los datos del libro y una imagen opcional.
// FormData permite enviar archivos a Django.

async function enviarLibroConImagen(
    url: string,
    metodo: 'POST' | 'PATCH',
    libro: Record<string, any>,
    imagen?: {
        uri: string;
        fileName?: string | null;
        mimeType?: string | null;
    } | null
) {
    const token = await obtenerToken();

    // Preparamos los datos para enviarlos como formulario.
    const formulario = new FormData();

    Object.entries(libro).forEach(([campo, valor]) => {
        if (valor !== undefined && valor !== null) {
            formulario.append(campo, String(valor));
        }
    });

    // Agregamos la imagen únicamente si fue seleccionada.
    // Agregamos la imagen seleccionada como un archivo compatible.
    if (imagen) {
        const archivoImagen = new File(imagen.uri);

        formulario.append('imagen', archivoImagen);
    }

    const respuesta = await fetch(url, {
        method: metodo,

        headers: {
            'Authorization': `Token ${token}`,
            // No agregamos Content-Type.
            // React Native lo configura automáticamente
            // para FormData, incluyendo el límite del archivo.
        },

        body: formulario,
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        console.log('ERROR DEVUELTO POR DJANGO:', datos);

        let mensajeError = 'No se pudo guardar el libro.';

        if (typeof datos === 'string') {
            mensajeError = datos;
        } else if (datos && typeof datos === 'object') {
            const errores = Object.values(datos).flat();

            if (errores.length > 0) {
                mensajeError = errores.join('\n');
            }
        }

        throw new Error(mensajeError);
    }

    return datos;
}


// Registrar un libro enviando también su imagen.
export async function registrarLibroConImagen(
    libro: Record<string, any>,
    imagen?: {
        uri: string;
        fileName?: string | null;
        mimeType?: string | null;
    } | null
) {
    return enviarLibroConImagen(
        `${API_URL}/libros/`,
        'POST',
        libro,
        imagen
    );
}


// Editar un libro enviando también su imagen.
export async function editarLibroConImagen(
    id: number,
    libro: Record<string, any>,
    imagen?: {
        uri: string;
        fileName?: string | null;
        mimeType?: string | null;
    } | null
) {
    return enviarLibroConImagen(
        `${API_URL}/libros/${id}/`,
        'PATCH',
        libro,
        imagen
    );
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
// Registra un autor nuevo en Django.

// Registra un autor nuevo en Django.
export async function registrarAutor(
    nombreAutor: string,
    Ap: string,
    Am: string,
    nacionalidad: string,
    fechaNacimiento: string
) {
    const token = await obtenerToken();

    const respuesta = await fetch(
        `${API_URL}/autores/`,
        {
            method: 'POST',

            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },

            body: JSON.stringify({
                nombreAutor: nombreAutor,
                Ap: Ap,
                Am: Am,
                nacionalidad: nacionalidad,
                fechaNacimiento: fechaNacimiento,
            }),
        }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        console.log('ERROR AL REGISTRAR AUTOR:', datos);

        const errores = Object.values(datos).flat();

        throw new Error(
            errores.join('\n') ||
            'No se pudo registrar el autor.'
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

// Registra una nueva categoría.
export async function crearCategoria(
    categoria: {
        nombreCategoria: string;
        orden: number;
        activo: boolean;
    }
) {
    const token = await obtenerToken();

    const respuesta = await fetch(
        `${API_URL}/categorias/`,
        {
            method: 'POST',

            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },

            body: JSON.stringify(categoria),
        }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(
            datos.detail || 'No se pudo registrar la categoría'
        );
    }

    return datos;
}
// Editar los datos de una categoría.
export async function editarCategoria(
    id: number,
    nombreCategoria: string,
    orden: number,
    activo: boolean
) {
    const token = await obtenerToken();

    const respuesta = await fetch(
        `${API_URL}/categorias/${id}/`,
        {
            method: 'PATCH',

            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },

            body: JSON.stringify({
                nombreCategoria,
                orden,
                activo,
            }),
        }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        const errores = Object.values(datos).flat();

        throw new Error(
            errores.join('\n') ||
            'No se pudo editar la categoría.'
        );
    }

    return datos;
}
// Eliminar una categoría.
export async function eliminarCategoria(id: number) {
    const token = await obtenerToken();

    const respuesta = await fetch(
        `${API_URL}/categorias/${id}/`,
        {
            method: 'DELETE',

            headers: {
                'Authorization': `Token ${token}`,
            },
        }
    );

    if (!respuesta.ok) {
        throw new Error(
            'No se pudo eliminar la categoría.'
        );
    }

    return true;
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

// Registrar una nueva editorial.
export async function crearEditorial(
    editorial: {
        nombreEditorial: string;
        nombreCalle: string;
        numeral: string;
        interior: string;
        colonia: string;
        activo: boolean;
    }
) {
    const token = await obtenerToken();

    const respuesta = await fetch(
        `${API_URL}/editoriales/`,
        {
            method: 'POST',

            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },

            body: JSON.stringify(editorial),
        }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        const errores = Object.values(datos).flat();

        throw new Error(
            errores.join('\n') ||
            'No se pudo registrar la editorial.'
        );
    }

    return datos;
}

// Editar los datos de una editorial.
// Editar los datos de una editorial.
export async function editarEditorial(
    id: number,
    nombreEditorial: string,
    nombreCalle: string,
    numeral: string,
    interior: string,
    colonia: string,
    activo: boolean
) {
    const token = await obtenerToken();

    const respuesta = await fetch(
        `${API_URL}/editoriales/${id}/`,
        {
            method: 'PATCH',

            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },

            body: JSON.stringify({
                nombreEditorial,
                nombreCalle,
                numeral,
                interior,
                colonia,
                activo,
            }),
        }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        const errores = Object.values(datos).flat();

        throw new Error(
            errores.join('\n') ||
            'No se pudo editar la editorial.'
        );
    }

    return datos;
}

// Editar los datos de un autor.
export async function editarAutor(
    id: number,
    nombreAutor: string,
    Ap: string,
    Am: string,
    nacionalidad: string,
    fechaNacimiento: string
) {
    const token = await obtenerToken();

    const respuesta = await fetch(`${API_URL}/autores/${id}/`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            nombreAutor,
            Ap,
            Am,
            nacionalidad,
            fechaNacimiento,
        }),
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        const errores = Object.values(datos).flat();
        throw new Error(errores.join('\n') || 'No se pudo editar el autor.');
    }

    return datos;
}

// Eliminar una editorial.
export async function eliminarEditorial(id: number) {
    const token = await obtenerToken();

    const respuesta = await fetch(
        `${API_URL}/editoriales/${id}/`,
        {
            method: 'DELETE',

            headers: {
                'Authorization': `Token ${token}`,
            },
        }
    );

    if (!respuesta.ok) {
        throw new Error(
            'No se pudo eliminar la editorial.'
        );
    }

    return true;
}


// Eliminar un autor.
export async function eliminarAutor(id: number) {
    const token = await obtenerToken();

    const respuesta = await fetch(`${API_URL}/autores/${id}/`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Token ${token}`,
        },
    });

    if (!respuesta.ok) {
        throw new Error('No se pudo eliminar el autor.');
    }
}