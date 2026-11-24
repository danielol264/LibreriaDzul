// ==================================================
// LIBRERIADZUL - APLICACIÓN PRINCIPAL
// ==================================================

// Importamos React y los hooks necesarios.
import { useState, useEffect } from 'react';

import * as ImagePicker from 'expo-image-picker';

// Importamos la pantalla que desarrollará nuestro compañero.
import Cliente from './cliente';
// Importamos los componentes visuales de React Native.
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Modal,
  Image,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';


// Importamos las funciones de conexión con Django.
import {
  iniciarSesion,
  eliminarToken,
  obtenerLibros,
  registrarLibro,
  editarLibro,
  eliminarLibro,
  // Funciones para consultar los datos de los selectores
  obtenerAutores,
  obtenerCategorias,

  crearCategoria,
  editarCategoria,
  eliminarCategoria,

  obtenerEditoriales,
  crearEditorial,
  editarEditorial,
  eliminarEditorial,

  registrarAutor,
  editarAutor,
  eliminarAutor,

  registrarLibroConImagen,
  editarLibroConImagen,


} from '../services/api';


// ==================================================
// COMPONENTE PRINCIPAL
// ==================================================

export default function Index() {

  // --------------------------------------------------
  // ESTADOS DEL LOGIN
  // --------------------------------------------------

  // Usuario escrito en el formulario.
  const [usuario, setUsuario] = useState('');

  // Contraseña escrita en el formulario.
  const [password, setPassword] = useState('');

  // Indica si estamos iniciando sesión.
  const [cargando, setCargando] = useState(false);

  // Mensaje de error del login.
  const [error, setError] = useState('');

  const [autores, setAutores] = useState<any[]>([]);
  const [nuevoAutor, setNuevoAutor] = useState('');

  const [apellidoPaternoAutor, setApellidoPaternoAutor] = useState('');
  const [apellidoMaternoAutor, setApellidoMaternoAutor] = useState('');
  const [nacionalidadAutor, setNacionalidadAutor] = useState('');
  const [fechaNacimientoAutor, setFechaNacimientoAutor] = useState('');

  const [mostrarFormularioAutor, setMostrarFormularioAutor] = useState(false);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [nombreEditorial, setNombreEditorial] = useState('');
  const [nombreCalle, setNombreCalle] = useState('');
  const [numeral, setNumeral] = useState('');
  const [interior, setInterior] = useState('');
  const [colonia, setColonia] = useState('');
  const [editoriales, setEditoriales] = useState<any[]>([]);
  const [editorialEditando, setEditorialEditando] = useState<number | null>(null);

  // Estados para administrar categorías.

  const [nuevoNombreCategoria, setNuevoNombreCategoria] = useState('');

  const [nuevoOrdenCategoria, setNuevoOrdenCategoria] = useState('');

  const [categoriaEditando, setCategoriaEditando] = useState<number | null>(null);

  const [mostrarFormularioCategoria, setMostrarFormularioCategoria] = useState(false);

  // --------------------------------------------------
  // ESTADOS DE LOS ROLES
  // --------------------------------------------------

  // Indica si inició sesión un administrador.
  const [administrador, setAdministrador] = useState(false);

  // Indica si inició sesión un cliente.
  const [cliente, setCliente] = useState(false);


  // --------------------------------------------------
  // ESTADOS DEL MENÚ
  // --------------------------------------------------

  // Controla si el menú lateral está abierto.
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Guarda la sección seleccionada.
  const [seccion, setSeccion] = useState('Inicio');


  // --------------------------------------------------
  // ESTADOS DE LOS LIBROS
  // --------------------------------------------------

  // Lista de libros recibidos desde Django.
  const [libros, setLibros] = useState<any[]>([]);

  // Guarda la página que estamos mostrando.
  const [paginaActual, setPaginaActual] = useState(1);

  // Indica cuántos libros queremos mostrar por página.
  const [librosPorPagina, setLibrosPorPagina] = useState(5);

  // Guarda el libro que el administrador selecciona.
  const [libroSeleccionado, setLibroSeleccionado] = useState<any | null>(null);
  // Indica si estamos editando un libro.
  const [modoEdicion, setModoEdicion] = useState(false);

  // Guarda el ID del libro que estamos editando.
  const [idLibroEditando, setIdLibroEditando] = useState<number | null>(null);

  // Guarda el texto que escribe el administrador para buscar libros.
  const [busquedaLibro, setBusquedaLibro] = useState("");

  // Indica si estamos cargando libros.
  const [cargandoLibros, setCargandoLibros] = useState(false);

  // Mensaje de error al consultar libros.
  const [errorLibros, setErrorLibros] = useState('');


  // ID del autor que estamos editando.
  const [autorEditando, setAutorEditando] = useState<number | null>(null);

  // Cargar los datos de un autor en el formulario para editarlo.
  const seleccionarAutorParaEditar = (autor: any) => {
    setAutorEditando(autor.id);

    setNuevoAutor(autor.nombreAutor ?? '');
    setApellidoPaternoAutor(autor.Ap ?? '');
    setApellidoMaternoAutor(autor.Am ?? '');
    setNacionalidadAutor(autor.nacionalidad ?? '');
    setFechaNacimientoAutor(autor.fechaNacimiento ?? '');

    setMostrarFormularioAutor(true);
  };

  // Cargar una categoría en el formulario para editarla.

  const seleccionarCategoriaParaEditar = (categoria: any) => {
    setCategoriaEditando(categoria.id);

    setNuevoNombreCategoria(
      categoria.nombreCategoria ?? ''
    );

    setNuevoOrdenCategoria(
      String(categoria.orden ?? '')
    );

    setMostrarFormularioCategoria(true);
  };

  // Eliminar una categoría con confirmación.

  const eliminarCategoriaSeleccionada = (id: number) => {
    Alert.alert(
      'Eliminar categoría',
      '¿Estás seguro de que deseas eliminar esta categoría?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarCategoria(id);

              Alert.alert(
                'Éxito',
                'Categoría eliminada correctamente.'
              );

              await cargarDatosFormulario();
            } catch (error) {
              Alert.alert(
                'Error',
                'No se pudo eliminar la categoría.'
              );
            }
          },
        },
      ]
    );
  };

  const seleccionarEditorialParaEditar = (editorial: any) => {
    setEditorialEditando(editorial.id);

    setNombreEditorial(editorial.nombreEditorial ?? '');
    setNombreCalle(editorial.nombreCalle ?? '');
    setNumeral(String(editorial.numeral ?? ''));
    setInterior(editorial.interior ?? '');
    setColonia(editorial.colonia ?? '');
  };

  const confirmarEliminarEditorial = (id: number) => {
    Alert.alert(
      'Eliminar editorial',
      '¿Estás seguro de que deseas eliminar esta editorial?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarEditorial(id);

              Alert.alert(
                'Éxito',
                'Editorial eliminada correctamente.'
              );

              await cargarDatosFormulario();
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.message || 'No se pudo eliminar la editorial.'
              );
            }
          },
        },
      ]
    );
  };

  const guardarEditorial = async () => {
    try {
      if (editorialEditando !== null) {
        await editarEditorial(
          editorialEditando,
          nombreEditorial,
          nombreCalle,
          numeral,
          interior,
          colonia,
          true
        );

        setEditorialEditando(null);

        Alert.alert('Éxito', 'Editorial actualizada correctamente.');
      } else {
        await crearEditorial({
          nombreEditorial,
          nombreCalle,
          numeral,
          interior,
          colonia,
          activo: true,
        });
      }

      setNombreEditorial('');
      setNombreCalle('');
      setNumeral('');
      setInterior('');
      setColonia('');

      await cargarDatosFormulario();
    } catch (error) {
      console.error('Error al guardar editorial:', error);
    }
  };

  // Guardar una categoría nueva o editar una existente.

  const guardarCategoria = async () => {
    // Guardar una nueva editorial

    if (!nuevoNombreCategoria.trim()) {
      Alert.alert(
        'Aviso',
        'Escribe el nombre de la categoría.'
      );
      return;
    }

    if (nuevoOrdenCategoria.trim() === '') {
      Alert.alert(
        'Aviso',
        'Escribe el orden de la categoría.'
      );
      return;
    }

    try {
      const datosCategoria = {
        nombreCategoria: nuevoNombreCategoria.trim(),
        orden: Number(nuevoOrdenCategoria),
        activo: true,
      };

      if (categoriaEditando !== null) {
        await editarCategoria(
          categoriaEditando,
          datosCategoria.nombreCategoria,
          datosCategoria.orden,
          datosCategoria.activo
        );

        Alert.alert(
          'Éxito',
          'Categoría actualizada correctamente.'
        );
      } else {
        await crearCategoria(datosCategoria);

        Alert.alert(
          'Éxito',
          'Categoría registrada correctamente.'
        );
      }

      setNuevoNombreCategoria('');
      setNuevoOrdenCategoria('');
      setCategoriaEditando(null);
      setMostrarFormularioCategoria(false);

      await cargarDatosFormulario();
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudo guardar la categoría. Verifica los datos.'
      );
    }
  };

  // Eliminar un autor de la base de datos.
  const eliminarAutorSeleccionado = (id: number) => {
    Alert.alert(
      'Eliminar autor',
      '¿Estás seguro de que deseas eliminar este autor?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarAutor(id);

              Alert.alert(
                'Éxito',
                'El autor se eliminó correctamente.'
              );

              await cargarDatosFormulario();
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.message || 'No se pudo eliminar el autor.'
              );
            }
          },
        },
      ]
    );
  };
  // --------------------------------------------------
  // ESTADOS DEL FORMULARIO DE REGISTRO
  // --------------------------------------------------

  // Datos del libro que estamos registrando.
  const [nuevoLibro, setNuevoLibro] = useState({
    ISBN: '',
    nombreLibro: '',
    existencias: '',
    paginas: '',
    urlImagen: '',
    editorial: '',
    categoria: '',
    autor: '',
  });

  // Guarda la imagen seleccionada desde la galería.
  const [imagenSeleccionada, setImagenSeleccionada] =
    useState<ImagePicker.ImagePickerAsset | null>(null);

  // Indica si estamos guardando un libro.
  const [guardandoLibro, setGuardandoLibro] = useState(false);

  // Mensaje de registro.
  const [mensajeRegistro, setMensajeRegistro] = useState('');

  // Controla si mostramos el formulario.
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Registra un autor nuevo.
  const guardarAutor = async () => {

    if (!nuevoAutor.trim()) {
      Alert.alert(
        'Campo obligatorio',
        'Escribe el nombre del autor.'
      );
      return;
    }
    // Si estamos editando, actualizamos el autor.
    if (autorEditando !== null) {
      await editarAutor(
        autorEditando,
        nuevoAutor.trim(),
        apellidoPaternoAutor.trim(),
        apellidoMaternoAutor.trim(),
        nacionalidadAutor.trim(),
        fechaNacimientoAutor.trim()
      );

      Alert.alert(
        'Éxito',
        'El autor se actualizó correctamente.'
      );

      setAutorEditando(null);
      setMostrarFormularioAutor(false);

      await cargarDatosFormulario();

      return;
    }

    try {

      const autorRegistrado = await registrarAutor(
        nuevoAutor.trim(),
        apellidoPaternoAutor.trim(),
        apellidoMaternoAutor.trim(),
        nacionalidadAutor.trim(),
        fechaNacimientoAutor.trim()
      );

      setAutores((autoresActuales) => [
        ...autoresActuales,
        autorRegistrado
      ]);

      setNuevoAutor('');
      setApellidoPaternoAutor('');
      setApellidoMaternoAutor('');
      setNacionalidadAutor('');
      setFechaNacimientoAutor('');
      setMostrarFormularioAutor(false);

      Alert.alert(
        'Éxito',
        'El autor se registró correctamente.'
      );

    } catch (error) {

      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : 'No se pudo registrar el autor.'
      );

    }
  };

  // ==================================================
  // SELECCIONAR IMAGEN DEL LIBRO
  // ==================================================

  async function seleccionarImagen() {
    // Abrimos la galería del dispositivo.
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    // Si el usuario seleccionó una imagen,
    // la guardamos en el estado.
    if (!resultado.canceled) {
      setImagenSeleccionada(resultado.assets[0]);
    }
  }

  // ==================================================
  // CONSULTAR LIBROS
  // ==================================================

  async function cargarLibros() {
    // Limpiamos el error anterior.
    setErrorLibros('');

    // Activamos el indicador de carga.
    setCargandoLibros(true);

    try {
      // Consultamos los libros en Django.
      const datos = await obtenerLibros();

      // Si Django devuelve una lista directamente.
      if (Array.isArray(datos)) {
        setLibros(datos);
      }

      // Si Django devuelve una respuesta paginada.
      else if (Array.isArray(datos.results)) {
        setLibros(datos.results);
      }

      // Si la respuesta no tiene una lista.
      else {
        setLibros([]);
      }
    } catch (err: any) {
      // Mostramos el error.
      setErrorLibros(
        err.message || 'No se pudieron consultar los libros.'
      );
    } finally {
      // Terminamos la carga.
      setCargandoLibros(false);
    }
  }

  // ==================================================
  // CARGAR DATOS DEL FORMULARIO
  // ==================================================

  async function cargarDatosFormulario() {
    // Consultamos autores, categorías y editoriales.
    try {
      const [datosAutores, datosCategorias, datosEditoriales] =
        await Promise.all([
          obtenerAutores(),
          obtenerCategorias(),
          obtenerEditoriales(),
        ]);

      // Guardamos los autores.
      setAutores(
        Array.isArray(datosAutores)
          ? datosAutores
          : datosAutores.results ?? []
      );

      // Guardamos las categorías.
      setCategorias(
        Array.isArray(datosCategorias)
          ? datosCategorias
          : datosCategorias.results ?? []
      );

      // Guardamos las editoriales.
      setEditoriales(
        Array.isArray(datosEditoriales)
          ? datosEditoriales
          : datosEditoriales.results ?? []
      );
    } catch (error) {
      // Mostramos el error en la consola.
      console.log('Error al cargar datos del formulario:', error);
    }
  }


  // ==================================================
  // CARGAR LIBROS AL ENTRAR A LA SECCIÓN
  // ==================================================

  useEffect(() => {

    // Si entramos a Libros, cargamos los libros.
    if (administrador && seccion === 'Libros') {

      cargarLibros();

    }

    // Si entramos a Editoriales, cargamos los datos.
    if (administrador && seccion === 'Editoriales') {
      cargarDatosFormulario();
    }

    // Si entramos a Autores, consultamos los datos.
    if (administrador && seccion === 'Autores') {

      cargarDatosFormulario();

    }

  }, [administrador, seccion]);


  // ==================================================
  // INICIAR SESIÓN
  // ==================================================

  async function handleLogin() {

    // Limpiamos el error anterior.
    setError('');

    // Validamos que los campos estén completos.
    if (
      usuario.trim() === '' ||
      password.trim() === ''
    ) {

      setError('Escribe tu usuario y contraseña.');

      return;
    }

    // Activamos la carga.
    setCargando(true);

    try {

      // Enviamos los datos al backend.
      const datos = await iniciarSesion(usuario, password);

      // Revisamos el rol recibido.
      if (datos.rol === 'ADMIN') {

        // Activamos el panel ADMIN.
        setAdministrador(true);

        // Desactivamos CLIENT.
        setCliente(false);

        // Entramos a Inicio.
        setSeccion('Inicio');

      } else if (datos.rol === 'CLIENT') {

        // Activamos el panel CLIENT.
        setCliente(true);

        // Desactivamos ADMIN.
        setAdministrador(false);

      } else {

        // Eliminamos el token si el rol no es válido.
        await eliminarToken();

        setError('El rol del usuario no es válido.');

      }

    } catch (err: any) {

      // Mostramos el error.
      setError(
        err.message || 'No se pudo iniciar sesión.'
      );

    } finally {

      // Terminamos la carga.
      setCargando(false);

    }
  }


  // ==================================================
  // CERRAR SESIÓN
  // ==================================================

  async function handleCerrarSesion() {

    // Eliminamos el token guardado.
    await eliminarToken();

    // Limpiamos los campos.
    setUsuario('');
    setPassword('');

    // Desactivamos los roles.
    setAdministrador(false);
    setCliente(false);

    // Cerramos el menú.
    setMenuAbierto(false);

    // Regresamos al login.
    setSeccion('Inicio');

    // Limpiamos los libros.
    setLibros([]);

    // Limpiamos errores.
    setError('');
    setErrorLibros('');
    setMensajeRegistro('');
  }
  // ==================================================
  // PREPARAR LA EDICIÓN DE UN LIBRO
  // ==================================================

  // ==================================================
  // CONFIRMAR Y ELIMINAR UN LIBRO
  // ==================================================

  function confirmarEliminarLibro(libro: any) {

    // Mostramos una confirmación antes de eliminar.
    Alert.alert(
      'Eliminar libro',
      `¿Estás seguro de que deseas eliminar "${libro.nombreLibro}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',

          onPress: async () => {
            try {

              // Eliminamos el libro utilizando su ID.
              await eliminarLibro(Number(libro.id));

              // Cerramos la ventana de detalles.
              setLibroSeleccionado(null);

              // Actualizamos la lista de libros.
              await cargarLibros();

              // Mostramos un mensaje de éxito.
              Alert.alert(
                'Libro eliminado',
                'El libro se eliminó correctamente.'
              );

            } catch (error) {

              // Mostramos un mensaje si ocurre un error.
              Alert.alert(
                'Error',
                'No se pudo eliminar el libro.'
              );

            }
          },
        },
      ]
    );
  }

  async function iniciarEdicionLibro(libro: any) {

    // Cerramos la ventana de detalles del libro.
    setLibroSeleccionado(null);

    // Activamos el modo edición.
    setModoEdicion(true);

    // Guardamos el ID del libro.
    setIdLibroEditando(Number(libro.id));

    // Cargamos autores, categorías y editoriales.
    await cargarDatosFormulario();

    // Colocamos los datos del libro en el formulario.
    setNuevoLibro({
      ISBN: String(libro.ISBN ?? ''),
      nombreLibro: String(libro.nombreLibro ?? ''),
      existencias: String(libro.existencias ?? ''),
      paginas: String(libro.paginas ?? ''),
      urlImagen: String(libro.urlImagen ?? ''),
      editorial: String(libro.editorial ?? ''),
      categoria: String(libro.categoria ?? ''),
      autor: String(libro.autor ?? ''),
    });

    // Mostramos el formulario.
    setMostrarFormulario(true);
  }

  // ==================================================
  // REGISTRAR LIBRO
  // ==================================================

  async function handleRegistrarLibro() {

    // Limpiamos el mensaje anterior.
    setMensajeRegistro('');

    // Validamos los campos obligatorios.
    const camposFaltantes = [];

    if (!String(nuevoLibro.ISBN ?? '').trim()) {
      camposFaltantes.push('ISBN');
    }

    if (!String(nuevoLibro.nombreLibro ?? '').trim()) {
      camposFaltantes.push('Nombre del libro');
    }

    if (!String(nuevoLibro.existencias ?? '').trim()) {
      camposFaltantes.push('Existencias');
    }

    if (!String(nuevoLibro.paginas ?? '').trim()) {
      camposFaltantes.push('Páginas');
    }

    if (!String(nuevoLibro.editorial ?? '').trim()) {
      camposFaltantes.push('Editorial');
    }

    if (!String(nuevoLibro.categoria ?? '').trim()) {
      camposFaltantes.push('Categoría');
    }

    if (!String(nuevoLibro.autor ?? '').trim()) {
      camposFaltantes.push('Autor');
    }

    if (camposFaltantes.length > 0) {
      setMensajeRegistro(
        `Falta completar: ${camposFaltantes.join(', ')}`
      );

      return;
    }

    // Activamos el indicador de guardado.
    setGuardandoLibro(true);

    try {

      // Convertimos los números y preparamos los datos.
      const libroParaEnviar = {
        ISBN: nuevoLibro.ISBN.trim(),
        nombreLibro: nuevoLibro.nombreLibro.trim(),
        existencias: Number(nuevoLibro.existencias),
        paginas: Number(nuevoLibro.paginas),
        urlImagen: nuevoLibro.urlImagen.trim(),
        editorial: Number(nuevoLibro.editorial),
        categoria: Number(nuevoLibro.categoria),
        autor: Number(nuevoLibro.autor),
      };


      // Enviamos el libro a Django.
      if (modoEdicion && idLibroEditando !== null) {

        // Si seleccionamos una imagen nueva,
        // enviamos los datos y la imagen.
        if (imagenSeleccionada) {
          await editarLibroConImagen(
            idLibroEditando,
            libroParaEnviar,
            imagenSeleccionada
          );
        } else {
          // Si no seleccionamos imagen,
          // editamos normalmente.
          await editarLibro(
            idLibroEditando,
            libroParaEnviar
          );
        }

        setMensajeRegistro('¡Libro actualizado correctamente!');

      } else {

        // Si seleccionamos una imagen,
        // la enviamos junto con el libro.
        if (imagenSeleccionada) {
          await registrarLibroConImagen(
            libroParaEnviar,
            imagenSeleccionada
          );
        } else {
          // Si no seleccionamos imagen,
          // registramos el libro normalmente.
          await registrarLibro(libroParaEnviar);
        }

        setMensajeRegistro('¡Libro registrado correctamente!');
      }



      // Limpiamos el formulario.
      setNuevoLibro({
        ISBN: '',
        nombreLibro: '',
        existencias: '',
        paginas: '',
        urlImagen: '',
        editorial: '',
        categoria: '',
        autor: '',
      });

      // Limpiamos la imagen seleccionada.
      setImagenSeleccionada(null);

      // Ocultamos el formulario.
      setMostrarFormulario(false);

      // Regresamos al modo de registro normal.
      setModoEdicion(false);
      setIdLibroEditando(null);
      setLibroSeleccionado(null);

      // Actualizamos la lista.
      await cargarLibros();

    } catch (err: any) {

      // Mostramos el error en la consola.
      console.log('ERROR AL REGISTRAR LIBRO:', err);
      console.log('DETALLE DEL ERROR:', err?.response?.data);

      // Mostramos el mensaje en la aplicación.
      setMensajeRegistro(
        err.message || 'No se pudo registrar el libro.'
      );

    } finally {

      // Terminamos el indicador.
      setGuardandoLibro(false);

    }
  }


  // ==================================================
  // SELECCIONAR UNA SECCIÓN DEL MENÚ
  // ==================================================

  function seleccionarSeccion(nombre: string) {

    // Cambiamos la sección actual.
    setSeccion(nombre);

    // Cerramos el menú lateral.
    setMenuAbierto(false);

    // Si salimos de Libros, ocultamos el formulario.
    if (nombre !== 'Libros') {

      setMostrarFormulario(false);

    }
  }


  // ==================================================
  // PANTALLA CLIENT
  // ==================================================

  // Si el usuario inició sesión como CLIENT,
  // mostramos la pantalla de nuestro compañero.

  if (cliente) {
    return (
      <Cliente
        onCerrarSesion={handleCerrarSesion}
      />
    );
  }


  // ==================================================
  // PANTALLA LOGIN
  // ==================================================

  if (!administrador) {

    return (

      <View style={styles.contenedorLogin}>

        <Text style={styles.titulo}>
          LibreriaDzul
        </Text>

        <Text style={styles.subtitulo}>
          Bienvenido
        </Text>

        <View style={styles.tarjeta}>

          <Text style={styles.etiqueta}>
            Usuario
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Escribe tu usuario"
            placeholderTextColor="#777777"
            value={usuario}
            onChangeText={setUsuario}
            autoCapitalize="none"
          />

          <Text style={styles.etiqueta}>
            Contraseña
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Escribe tu contraseña"
            placeholderTextColor="#777777"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error !== '' && (

            <Text style={styles.error}>
              {error}
            </Text>

          )}

          <TouchableOpacity
            style={styles.boton}
            onPress={handleLogin}
            disabled={cargando}
          >

            {cargando ? (

              <ActivityIndicator color="#FFFFFF" />

            ) : (

              <Text style={styles.textoBoton}>
                Iniciar sesión
              </Text>

            )}

          </TouchableOpacity>

        </View>

        <Text style={styles.pie}>
          Sistema de administración de librería
        </Text>

      </View>

    );
  }


  // ==================================================
  // PANEL ADMINISTRADOR
  // ==================================================

  return (

    <View style={styles.contenedorPrincipal}>

      {/* ==========================================
          ENCABEZADO DE LA APLICACIÓN
      ========================================== */}

      <View style={styles.encabezado}>

        {/* Botón de hamburguesa. */}
        <TouchableOpacity
          style={styles.botonMenu}
          onPress={() => setMenuAbierto(!menuAbierto)}
        >

          <Text style={styles.iconoMenu}>
            ☰
          </Text>

        </TouchableOpacity>

        {/* Título de la aplicación. */}
        <Text style={styles.tituloEncabezado}>
          LibreriaDzul
        </Text>

      </View>


      {/* ==========================================
          CONTENIDO PRINCIPAL
      ========================================== */}

      <ScrollView
        style={styles.contenido}
        contentContainerStyle={styles.contenidoInterior}
      >

        {/* ==========================================
            SECCIÓN INICIO
        ========================================== */}

        {seccion === 'Inicio' && (

          <View>

            <Text style={styles.titulo}>
              Panel de administración
            </Text>

            <Text style={styles.subtitulo}>
              Bienvenido, administrador
            </Text>

            <View style={styles.tarjeta}>

              <Text style={styles.tituloSeccion}>
                Resumen
              </Text>

              <Text style={styles.textoTarjeta}>
                Bienvenido al sistema administrativo
                de LibreriaDzul.
              </Text>

              <Text style={styles.textoTarjeta}>
                Desde el menú puedes acceder a las
                diferentes secciones.
              </Text>

              <TouchableOpacity
                style={styles.boton}
                onPress={() => seleccionarSeccion('Libros')}
              >

                <Text style={styles.textoBoton}>
                  Administrar libros
                </Text>

              </TouchableOpacity>

            </View>

          </View>

        )}


        {/* ==========================================
            SECCIÓN LIBROS
        ========================================== */}

        {seccion === 'Libros' && (

          <View>

            <Text style={styles.titulo}>
              Administración de libros
            </Text>

            <Text style={styles.subtitulo}>
              Consulta y registra libros
            </Text>


            {/* Botón para mostrar u ocultar formulario. */}
            <TouchableOpacity
              style={styles.boton}
              onPress={() => {
                const abrirFormulario = !mostrarFormulario;

                setMostrarFormulario(abrirFormulario);

                // Si abrimos el formulario, cargamos los datos de los selectores.
                if (abrirFormulario) {
                  cargarDatosFormulario();
                } else {
                  // Si ocultamos el formulario, limpiamos los campos.
                  setNuevoLibro({
                    ISBN: '',
                    nombreLibro: '',
                    existencias: '',
                    paginas: '',
                    urlImagen: '',
                    editorial: '',
                    categoria: '',
                    autor: '',
                  });

                  // Cancelamos el modo edición.
                  setModoEdicion(false);
                  setIdLibroEditando(null);
                  setLibroSeleccionado(null);

                  // Limpiamos el mensaje anterior.
                  setMensajeRegistro('');
                }
              }}
            >

              <Text style={styles.textoBoton}>
                {mostrarFormulario
                  ? 'Ocultar formulario'
                  : '+ Registrar nuevo libro'}
              </Text>

            </TouchableOpacity>


            {/* ======================================
                FORMULARIO DE REGISTRO
            ====================================== */}

            {mostrarFormulario && (

              <View style={styles.tarjeta}>

                <Text style={styles.tituloSeccion}>
                  {modoEdicion ? 'Editar libro' : 'Registrar nuevo libro'}
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="ISBN"
                  placeholderTextColor="#777777"
                  value={nuevoLibro.ISBN}
                  onChangeText={(texto) =>
                    setNuevoLibro({
                      ...nuevoLibro,
                      ISBN: texto,
                    })
                  }
                />

                <TextInput
                  style={styles.input}
                  placeholder="Nombre del libro"
                  placeholderTextColor="#777777"
                  value={nuevoLibro.nombreLibro}
                  onChangeText={(texto) =>
                    setNuevoLibro({
                      ...nuevoLibro,
                      nombreLibro: texto,
                    })
                  }
                />

                {/* Selector de autor. */}
                <Text style={styles.etiqueta}>
                  Autor
                </Text>

                <View
                  style={{
                    height: 180,
                    borderWidth: 1,
                    borderColor: '#BFC5CE',
                    borderRadius: 10,
                    marginBottom: 18,
                    backgroundColor: '#FFFFFF',
                    overflow: 'hidden',
                  }}
                >
                  <Picker

                    style={{
                      height: 180,
                      width: '100%',
                    }}
                    itemStyle={{
                      color: '#222222',
                      fontSize: 16,
                    }}
                    selectedValue={nuevoLibro.autor}
                    onValueChange={(valor) =>
                      setNuevoLibro({
                        ...nuevoLibro,
                        autor: valor,
                      })
                    }
                  >
                    <Picker.Item
                      label="Selecciona un autor"
                      value=""
                    />

                    {autores.map((autor) => (
                      <Picker.Item
                        key={autor.id}
                        label={
                          autor.nombreAutor ??
                          autor.nombre ??
                          `Autor ${autor.id}`
                        }
                        value={String(autor.id)}
                      />
                    ))}
                  </Picker>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Número de páginas"
                  placeholderTextColor="#777777"
                  keyboardType="numeric"
                  value={nuevoLibro.paginas}
                  onChangeText={(texto) =>
                    setNuevoLibro({
                      ...nuevoLibro,
                      paginas: texto,
                    })
                  }
                />

                <TextInput
                  style={styles.input}
                  placeholder="Existencias"
                  placeholderTextColor="#777777"
                  keyboardType="numeric"
                  value={nuevoLibro.existencias}
                  onChangeText={(texto) =>
                    setNuevoLibro({
                      ...nuevoLibro,
                      existencias: texto,
                    })
                  }
                />

                <TextInput
                  style={styles.input}
                  placeholder="URL de imagen (opcional)"
                  placeholderTextColor="#777777"
                  value={nuevoLibro.urlImagen}
                  onChangeText={(texto) =>
                    setNuevoLibro({
                      ...nuevoLibro,
                      urlImagen: texto,
                    })
                  }
                />


                {/* Botón para seleccionar una imagen desde la galería. */}
                <TouchableOpacity
                  style={styles.boton}
                  onPress={seleccionarImagen}
                >
                  <Text style={styles.textoBoton}>
                    Seleccionar imagen desde galería
                  </Text>
                </TouchableOpacity>

                {/* Vista previa de la imagen seleccionada. */}
                {imagenSeleccionada && (
                  <View style={{ marginBottom: 18 }}>
                    <Text style={styles.etiqueta}>
                      Imagen seleccionada:
                    </Text>

                    <Image
                      source={{ uri: imagenSeleccionada.uri }}
                      style={{
                        width: 150,
                        height: 200,
                        borderRadius: 10,
                        alignSelf: 'center',
                        marginBottom: 10,
                      }}
                      resizeMode="cover"
                    />

                    <TouchableOpacity
                      style={styles.boton}
                      onPress={() => setImagenSeleccionada(null)}
                    >
                      <Text style={styles.textoBoton}>
                        Quitar imagen seleccionada
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Selector de editorial. */}
                <Text style={styles.etiqueta}>
                  Editorial
                </Text>

                <View
                  style={{
                    height: 180,
                    borderWidth: 1,
                    borderColor: '#BFC5CE',
                    borderRadius: 10,
                    marginBottom: 18,
                    backgroundColor: '#FFFFFF',
                    overflow: 'hidden',
                  }}
                >
                  <Picker
                    style={{
                      height: 180,
                      width: '100%',
                    }}
                    itemStyle={{
                      color: '#222222',
                      fontSize: 16,
                    }}
                    selectedValue={nuevoLibro.editorial}
                    onValueChange={(valor) =>
                      setNuevoLibro({
                        ...nuevoLibro,
                        editorial: valor,
                      })
                    }
                  >

                    <Picker.Item
                      label="Selecciona una editorial"
                      value=""
                    />

                    {editoriales.map((editorial) => (
                      <Picker.Item
                        key={editorial.id}
                        label={
                          editorial.nombreEditorial ??
                          editorial.nombre ??
                          `Editorial ${editorial.id}`
                        }
                        value={String(editorial.id)}
                      />
                    ))}
                  </Picker>

                </View>

                {/* Selector de categoría. */}
                <Text style={styles.etiqueta}>
                  Categoría
                </Text>

                <View
                  style={{
                    height: 180,
                    borderWidth: 1,
                    borderColor: '#BFC5CE',
                    borderRadius: 10,
                    marginBottom: 18,
                    backgroundColor: '#FFFFFF',
                    overflow: 'hidden',
                  }}
                >
                  <Picker
                    style={{
                      height: 180,
                      width: '100%',
                    }}
                    itemStyle={{
                      color: '#222222',
                      fontSize: 16,
                    }}
                    selectedValue={nuevoLibro.categoria}
                    onValueChange={(valor) =>
                      setNuevoLibro({
                        ...nuevoLibro,
                        categoria: valor,
                      })
                    }
                  >
                    <Picker.Item
                      label="Selecciona una categoría"
                      value=""
                    />

                    {categorias.map((categoria) => (
                      <Picker.Item
                        key={categoria.id}
                        label={
                          categoria.nombreCategoria ??
                          categoria.nombre ??
                          `Categoría ${categoria.id}`
                        }
                        value={String(categoria.id)}
                      />
                    ))}
                  </Picker>
                </View>





                <TouchableOpacity
                  style={styles.boton}
                  onPress={handleRegistrarLibro}
                  disabled={guardandoLibro}
                >

                  {guardandoLibro ? (

                    <ActivityIndicator color="#FFFFFF" />

                  ) : (

                    <Text style={styles.textoBoton}>
                      {modoEdicion ? 'Actualizar libro' : 'Guardar libro'}
                    </Text>

                  )}

                </TouchableOpacity>

              </View>

            )}

            {mensajeRegistro !== '' && (

              <Text style={styles.mensaje}>
                {mensajeRegistro}
              </Text>

            )}


            {/* ======================================
                LISTA DE LIBROS
            ====================================== */}

            <View style={styles.tarjeta}>

              <Text style={styles.tituloSeccion}>
                Libros registrados
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Buscar por nombre o ISBN"
                placeholderTextColor="#777777"
                value={busquedaLibro}
                onChangeText={setBusquedaLibro}
              />

              <TouchableOpacity
                style={styles.botonActualizar}
                onPress={cargarLibros}
                disabled={cargandoLibros}
              >

                <Text style={styles.textoBoton}>
                  Actualizar libros
                </Text>

              </TouchableOpacity>


              {/* Indicador de carga. */}
              {cargandoLibros && (

                <ActivityIndicator
                  size="large"
                  color="#1E3A8A"
                />

              )}


              {/* Error al consultar. */}
              {errorLibros !== '' && (

                <Text style={styles.error}>
                  {errorLibros}
                </Text>

              )}


              {/* Mensaje cuando no hay libros. */}
              {!cargandoLibros &&
                errorLibros === '' &&
                libros.length === 0 && (

                  <Text style={styles.textoInformativo}>
                    No hay libros registrados.
                  </Text>

                )}


              {/* Mostramos cada libro. */}
              {/* Filtramos los libros por nombre o ISBN. */}
              {libros
                .filter((libro) => {
                  const texto = busquedaLibro.trim().toLowerCase();

                  return (
                    String(libro.nombreLibro ?? "").toLowerCase().includes(texto) ||
                    String(libro.ISBN ?? "").toLowerCase().includes(texto)
                  );
                })
                .slice(
                  (paginaActual - 1) * librosPorPagina,
                  paginaActual * librosPorPagina
                )

                .map((libro, index) => (

                  <TouchableOpacity
                    style={styles.tarjetaLibro}
                    key={libro.id ?? index}
                    onPress={() => setLibroSeleccionado(libro)}
                    activeOpacity={0.7}
                  >

                    <Text style={styles.nombreLibro}>
                      {libro.nombreLibro}
                    </Text>

                    <Text style={styles.datoLibro}>
                      ISBN: {libro.ISBN}
                    </Text>

                    <Text style={styles.datoLibro}>
                      Existencias: {libro.existencias}
                    </Text>

                    <Text style={styles.datoLibro}>
                      Páginas: {libro.paginas}
                    </Text>

                  </TouchableOpacity>

                ))}
              {/* Selector de libros por página */}
              <View style={{ marginTop: 15, alignItems: 'center' }}>
                <Text style={{ marginBottom: 10 }}>
                  Libros por página:
                </Text>

                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity
                    style={styles.boton}
                    onPress={() => {
                      setLibrosPorPagina(5);
                      setPaginaActual(1);
                    }}
                  >
                    <Text style={styles.textoBoton}>5</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.boton}
                    onPress={() => {
                      setLibrosPorPagina(10);
                      setPaginaActual(1);
                    }}
                  >
                    <Text style={styles.textoBoton}>10</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.boton}
                    onPress={() => {
                      setLibrosPorPagina(20);
                      setPaginaActual(1);
                    }}
                  >
                    <Text style={styles.textoBoton}>20</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {/* Botones para cambiar de página */}
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 15 }}>

                <TouchableOpacity
                  style={styles.boton}
                  onPress={() => setPaginaActual(paginaActual - 1)}
                  disabled={paginaActual === 1}
                >
                  <Text style={styles.textoBoton}>Anterior</Text>
                </TouchableOpacity>

                <Text style={{ marginHorizontal: 15, alignSelf: 'center' }}>
                  Página {paginaActual}
                </Text>

                <TouchableOpacity
                  style={styles.boton}
                  onPress={() => setPaginaActual(paginaActual + 1)}
                >
                  <Text style={styles.textoBoton}>Siguiente</Text>
                </TouchableOpacity>

              </View>

            </View>

          </View>

        )
        }


        {/* ==========================================
            SECCIONES PREPARADAS
        ========================================== */}

        {/* ==========================================
     SECCIÓN AUTORES
========================================== */}

        {seccion === 'Autores' && (

          <View style={styles.tarjeta}>

            <Text style={styles.tituloSeccion}>
              Autores registrados
            </Text>
            <TouchableOpacity
              style={styles.boton}
              onPress={() => {
                if (mostrarFormularioAutor) {
                  setMostrarFormularioAutor(false);
                } else {
                  setMostrarFormularioAutor(true);
                }
              }}
            >
              <Text style={styles.textoBoton}>
                {mostrarFormularioAutor ? 'Cancelar' : 'Registrar autor'}
              </Text>
            </TouchableOpacity>

            {mostrarFormularioAutor && (
              <View style={styles.tarjeta}>

                <TextInput
                  placeholder="Nombre del autor"
                  value={nuevoAutor}
                  onChangeText={setNuevoAutor}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Apellido paterno"
                  value={apellidoPaternoAutor}
                  onChangeText={setApellidoPaternoAutor}
                  style={styles.input}
                />

                <TextInput
                  placeholder="Apellido materno"
                  value={apellidoMaternoAutor}
                  onChangeText={setApellidoMaternoAutor}
                  style={styles.input}
                />

                <TextInput
                  placeholder="Nacionalidad"
                  value={nacionalidadAutor}
                  onChangeText={setNacionalidadAutor}
                  style={styles.input}
                />

                <TextInput
                  placeholder="Fecha de nacimiento (AAAA-MM-DD)"
                  value={fechaNacimientoAutor}
                  onChangeText={setFechaNacimientoAutor}
                  style={styles.input}
                />

                <TouchableOpacity
                  style={styles.boton}
                  onPress={guardarAutor}
                >
                  <Text style={styles.textoBoton}>
                    Guardar autor
                  </Text>
                </TouchableOpacity>

              </View>
            )}



            {autores.length === 0 ? (

              <Text style={styles.textoTarjeta}>
                No hay autores registrados todavía.
              </Text>

            ) : (

              autores.map((autor) => (


                <View
                  key={autor.id}
                  style={styles.tarjeta}
                >

                  <Text style={styles.textoTarjeta}>
                    {autor.nombreAutor ??
                      autor.nombre ??
                      `Autor ${autor.id}`}
                  </Text>

                  <Text style={styles.textoInformativo}>
                    ID: {autor.id}
                  </Text>
                  <TouchableOpacity
                    style={styles.boton}
                    onPress={() => seleccionarAutorParaEditar(autor)}
                  >
                    <Text style={styles.textoBoton}>
                      Editar autor
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.boton}
                    onPress={() => eliminarAutorSeleccionado(autor.id)}
                  >
                    <Text style={styles.textoBoton}>
                      Eliminar autor
                    </Text>
                  </TouchableOpacity>

                </View>

              ))

            )}

          </View>

        )}


        {/* ==========================================
     SECCIONES CATEGORÍAS Y EDITORIALES
========================================== */}

        {seccion === 'Categorías' && (

          <View style={styles.tarjeta}>

            <Text style={styles.tituloSeccion}>
              Categorías registradas
            </Text>

            <TouchableOpacity
              style={styles.boton}
              onPress={() => {
                if (mostrarFormularioCategoria) {
                  setMostrarFormularioCategoria(false);
                  setCategoriaEditando(null);
                  setNuevoNombreCategoria('');
                  setNuevoOrdenCategoria('');
                } else {
                  setMostrarFormularioCategoria(true);
                }
              }}
            >
              <Text style={styles.textoBoton}>
                {mostrarFormularioCategoria
                  ? 'Cancelar'
                  : 'Registrar categoría'}
              </Text>
            </TouchableOpacity>

            {mostrarFormularioCategoria && (

              <View style={styles.tarjeta}>

                <TextInput
                  placeholder="Nombre de la categoría"
                  value={nuevoNombreCategoria}
                  onChangeText={setNuevoNombreCategoria}
                  style={styles.input}
                />

                <TextInput
                  placeholder="Orden de la categoría"
                  value={nuevoOrdenCategoria}
                  onChangeText={setNuevoOrdenCategoria}
                  keyboardType="numeric"
                  style={styles.input}
                />

                <TouchableOpacity
                  style={styles.boton}
                  onPress={guardarCategoria}
                >
                  <Text style={styles.textoBoton}>
                    Guardar categoría
                  </Text>
                </TouchableOpacity>

              </View>

            )}

            {categorias.length === 0 ? (

              <Text style={styles.textoInformativo}>
                No hay categorías registradas.
              </Text>

            ) : (

              categorias.map((categoria) => (

                <View
                  key={categoria.id}
                  style={styles.tarjeta}
                >

                  <Text style={styles.textoTarjeta}>
                    {categoria.nombreCategoria}
                  </Text>

                  <Text style={styles.textoInformativo}>
                    Orden: {categoria.orden}
                  </Text>

                  <Text style={styles.textoInformativo}>
                    Estado: {categoria.activo ? 'Activa' : 'Inactiva'}
                  </Text>

                  <TouchableOpacity
                    style={styles.boton}
                    onPress={() =>
                      seleccionarCategoriaParaEditar(categoria)
                    }
                  >
                    <Text style={styles.textoBoton}>
                      Editar categoría
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.boton}
                    onPress={() =>
                      eliminarCategoriaSeleccionada(categoria.id)
                    }
                  >
                    <Text style={styles.textoBoton}>
                      Eliminar categoría
                    </Text>
                  </TouchableOpacity>

                </View>

              ))

            )}

          </View>

        )}

        {/* ==========================================
            SECCIÓN EDITORIALES
        ========================================== */}

        {seccion === 'Editoriales' && (

          <View style={styles.tarjeta}>

            <Text style={styles.tituloSeccion}>
              Editoriales registradas
            </Text>

            <TextInput
              placeholder="Nombre de la editorial"
              value={nombreEditorial}
              onChangeText={setNombreEditorial}
              style={styles.input}
            />

            <TextInput
              placeholder="Calle"
              value={nombreCalle}
              onChangeText={setNombreCalle}
              style={styles.input}
            />

            <TextInput
              placeholder="Número"
              value={numeral}
              onChangeText={setNumeral}
              style={styles.input}
            />

            <TextInput
              placeholder="Interior"
              value={interior}
              onChangeText={setInterior}
              style={styles.input}
            />

            <TextInput
              placeholder="Colonia"
              value={colonia}
              onChangeText={setColonia}
              style={styles.input}
            />

            <TouchableOpacity
              style={styles.boton}
              onPress={guardarEditorial}
            >
              <Text style={styles.textoBoton}>
                Guardar editorial
              </Text>
            </TouchableOpacity>

            {editoriales.length === 0 ? (

              <Text style={styles.textoInformativo}>
                No hay editoriales registradas.
              </Text>

            ) : (

              editoriales.map((editorial) => (

                <View
                  key={editorial.id}
                  style={styles.tarjeta}
                >

                  <Text style={styles.textoTarjeta}>
                    {editorial.nombreEditorial}
                  </Text>

                  <Text style={styles.textoInformativo}>
                    Calle: {editorial.nombreCalle}
                  </Text>

                  <Text style={styles.textoInformativo}>
                    Número: {editorial.numeral}
                  </Text>

                  <Text style={styles.textoInformativo}>
                    Interior: {editorial.interior}
                  </Text>

                  <Text style={styles.textoInformativo}>
                    Colonia: {editorial.colonia}
                  </Text>

                  <TouchableOpacity
                    onPress={() => seleccionarEditorialParaEditar(editorial)}
                    style={{
                      backgroundColor: '#2196F3',
                      padding: 10,
                      borderRadius: 6,
                      marginTop: 8,
                    }}
                  >
                    <Text style={{ color: 'white', textAlign: 'center' }}>
                      Editar editorial
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => confirmarEliminarEditorial(editorial.id)}
                    style={{
                      backgroundColor: '#C62828',
                      padding: 10,
                      borderRadius: 6,
                      marginTop: 8,
                    }}
                  >
                    <Text style={{ color: 'white', textAlign: 'center' }}>
                      Eliminar editorial
                    </Text>
                  </TouchableOpacity>

                </View>

              ))

            )}

          </View>

        )}




      </ScrollView >

      {/* Ventana con los detalles del libro seleccionado. */}
      <Modal
        visible={libroSeleccionado !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setLibroSeleccionado(null)}
      >
        {/* Fondo oscuro detrás de la ventana. */}
        <View style={styles.fondoModal} >

          {/* Contenedor blanco de los detalles. */}
          < View style={styles.contenedorModal} >
            <ScrollView>

              {/* Portada del libro, si tiene imagen. */}
              {(libroSeleccionado?.imagen || libroSeleccionado?.urlImagen) ? (

                <Image
                  source={{
                    uri: libroSeleccionado.imagen || libroSeleccionado.urlImagen
                  }}
                  style={styles.imagenLibroModal}
                  resizeMode="contain"
                />

              ) : null}
              {/* Nombre del libro. */}
              <Text style={styles.nombreLibroModal}>
                {libroSeleccionado?.nombreLibro}
              </Text>

              {/* Información del libro. */}
              <Text style={styles.datoLibro}>
                ISBN: {libroSeleccionado?.ISBN}
              </Text>

              <Text style={styles.datoLibro}>
                Existencias: {libroSeleccionado?.existencias}
              </Text>

              <Text style={styles.datoLibro}>
                Páginas: {libroSeleccionado?.paginas}
              </Text>

              <Text style={styles.datoLibro}>
                Autor: {libroSeleccionado?.autor}
              </Text>

              <Text style={styles.datoLibro}>
                Editorial: {libroSeleccionado?.editorial}
              </Text>

              <Text style={styles.datoLibro}>
                Categoría: {libroSeleccionado?.categoria}
              </Text>

              {/* Botón para editar el libro. */}
              <TouchableOpacity
                style={styles.botonCerrarModal}
                onPress={() => iniciarEdicionLibro(libroSeleccionado)}
              >
                <Text style={styles.textoBoton}>
                  Editar
                </Text>
              </TouchableOpacity>

              {/* Botón para eliminar el libro. */}
              <TouchableOpacity
                style={styles.botonCerrarModal}
                onPress={() => confirmarEliminarLibro(libroSeleccionado)}
              >
                <Text style={styles.textoBoton}>
                  Eliminar
                </Text>
              </TouchableOpacity>

              {/* Botón para cerrar la ventana. */}
              <TouchableOpacity
                style={styles.botonCerrarModal}
                onPress={() => setLibroSeleccionado(null)}
              >
                <Text style={styles.textoBoton}>
                  Cerrar
                </Text>
              </TouchableOpacity>

            </ScrollView>
          </View >
        </View >
      </Modal >
      {/* ==========================================
    SECCIÓN CONFIGURACIÓN
========================================== */}

      {seccion === 'Configuración' && (

        <View style={styles.tarjeta}>

          <Text style={styles.tituloSeccion}>
            Configuración
          </Text>

          <Text style={styles.textoTarjeta}>
            Información general de LibreriaDzul.
          </Text>

          <View style={{ marginTop: 20 }}>

            <Text style={styles.etiqueta}>
              Nombre de la aplicación
            </Text>

            <Text style={styles.textoInformativo}>
              LibreriaDzul
            </Text>

          </View>

          <View style={{ marginTop: 15 }}>

            <Text style={styles.etiqueta}>
              Versión
            </Text>

            <Text style={styles.textoInformativo}>
              1.0
            </Text>

          </View>

          <View style={{ marginTop: 15 }}>

            <Text style={styles.etiqueta}>
              Tipo de usuario
            </Text>

            <Text style={styles.textoInformativo}>
              Administrador
            </Text>

          </View>

          <View style={{ marginTop: 20 }}>

            <Text style={styles.textoTarjeta}>
              Sistema de administración y consulta
              de libros.
            </Text>

          </View>

          <TouchableOpacity
            style={styles.botonCerrar}
            onPress={handleCerrarSesion}
          >

            <Text style={styles.textoBoton}>
              Cerrar sesión
            </Text>

          </TouchableOpacity>

        </View>

      )}

      {/* ==========================================
          MENÚ LATERAL
      ========================================== */}

      {
        menuAbierto && (

          <View style={styles.fondoMenu}>

            {/* Área exterior para cerrar el menú. */}
            <TouchableOpacity
              style={styles.fondoOscuro}
              onPress={() => setMenuAbierto(false)}
            />

            {/* Panel lateral. */}
            <View style={styles.menuLateral}>

              <Text style={styles.tituloMenu}>
                LibreriaDzul
              </Text>

              <Text style={styles.subtituloMenu}>
                Administración
              </Text>


              {/* Opción Inicio. */}
              <TouchableOpacity
                style={styles.opcionMenu}
                onPress={() => seleccionarSeccion('Inicio')}
              >

                <Text style={styles.textoMenu}>
                  Inicio
                </Text>

              </TouchableOpacity>


              {/* Opción Libros. */}
              <TouchableOpacity
                style={styles.opcionMenu}
                onPress={() => seleccionarSeccion('Libros')}
              >

                <Text style={styles.textoMenu}>
                  Libros
                </Text>

              </TouchableOpacity>


              {/* Opción Autores. */}
              <TouchableOpacity
                style={styles.opcionMenu}
                onPress={() => seleccionarSeccion('Autores')}
              >

                <Text style={styles.textoMenu}>
                  Autores
                </Text>

              </TouchableOpacity>


              {/* Opción Categorías. */}
              <TouchableOpacity
                style={styles.opcionMenu}
                onPress={() => seleccionarSeccion('Categorías')}
              >

                <Text style={styles.textoMenu}>
                  Categorías
                </Text>

              </TouchableOpacity>


              {/* Opción Editoriales. */}
              <TouchableOpacity
                style={styles.opcionMenu}
                onPress={() => seleccionarSeccion('Editoriales')}
              >

                <Text style={styles.textoMenu}>
                  Editoriales
                </Text>

              </TouchableOpacity>

              {/* Opción Configuración. */}
              <TouchableOpacity
                style={styles.opcionMenu}
                onPress={() => seleccionarSeccion('Configuración')}
              >
                <Text style={styles.textoMenu}>
                  Configuración
                </Text>
              </TouchableOpacity>


              {/* Separador visual. */}
              <View style={styles.separador} />


              {/* Opción cerrar sesión. */}
              <TouchableOpacity
                style={styles.opcionCerrar}
                onPress={handleCerrarSesion}
              >

                <Text style={styles.textoCerrarMenu}>
                  Cerrar sesión
                </Text>

              </TouchableOpacity>

            </View>

          </View>

        )
      }

    </View >

  );
}


// ==================================================
// ESTILOS DE LA APLICACIÓN
// ==================================================

const styles = StyleSheet.create({

  // Contenedor del login.
  contenedorLogin: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  // Contenedor principal del ADMIN.
  contenedorPrincipal: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },

  // Encabezado superior.
  encabezado: {
    height: 90,
    paddingTop: 25,
    backgroundColor: '#1E3A8A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },

  // Botón de hamburguesa.
  botonMenu: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Icono del menú.
  iconoMenu: {
    fontSize: 28,
    color: '#FFFFFF',
  },

  // Título del encabezado.
  tituloEncabezado: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 10,
  },

  // Área desplazable.
  contenido: {
    flex: 1,
  },

  // Espaciado interior.
  contenidoInterior: {
    padding: 20,
    paddingBottom: 120,
  },

  // Contenedor general de pantallas.
  contenedor: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  // Título principal.
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 10,
    textAlign: 'center',
  },

  // Subtítulo.
  subtitulo: {
    fontSize: 17,
    color: '#555555',
    marginBottom: 25,
    textAlign: 'center',
  },

  // Tarjeta general.
  tarjeta: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    marginBottom: 20,
  },

  // Etiquetas.
  etiqueta: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },

  // Campos de texto.
  input: {
    height: 55,
    borderWidth: 1,
    borderColor: '#BFC5CE',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 18,
    backgroundColor: '#FFFFFF',
    color: '#222222',
    fontSize: 16,
  },

  // Botón principal.
  boton: {
    backgroundColor: '#1E3A8A',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },

  // Botón de actualizar.
  botonActualizar: {
    backgroundColor: '#2563EB',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },

  // Texto de botones.
  textoBoton: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Texto de las tarjetas.
  textoTarjeta: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 15,
    textAlign: 'center',
  },

  // Título de sección.
  tituloSeccion: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 20,
    textAlign: 'center',
  },

  // Tarjeta de cada libro.
  tarjetaLibro: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
  },

  // Nombre del libro.
  nombreLibro: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 10,
  },

  // Datos del libro.
  datoLibro: {
    fontSize: 14,
    color: '#444444',
    marginBottom: 5,
  },
  // Fondo oscuro detrás de la ventana.
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  // Contenedor blanco de los detalles.
  contenedorModal: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    elevation: 10,
  },

  // Imagen de portada del libro.
  imagenLibroModal: {
    width: '100%',
    height: 220,
    marginBottom: 15,
  },

  // Nombre del libro dentro de la ventana.
  nombreLibroModal: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E3A8A',
    textAlign: 'center',
    marginBottom: 15,
  },

  // Botón para cerrar la ventana.
  botonCerrarModal: {
    backgroundColor: '#1E3A8A',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },

  // Mensajes de error.
  error: {
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
  },

  // Mensajes de registro.
  mensaje: {
    color: '#15803D',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 15,
  },

  // Texto informativo.
  textoInformativo: {
    fontSize: 15,
    color: '#222222',
    textAlign: 'center',
    marginVertical: 10,
  },

  // Texto inferior del login.
  pie: {
    fontSize: 12,
    color: '#777777',
    textAlign: 'center',
    marginTop: 20,
  },

  // Fondo que cubre la pantalla al abrir el menú.
  fondoMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    zIndex: 100,
  },

  // Fondo oscuro detrás del menú.
  fondoOscuro: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  // Panel lateral.
  menuLateral: {
    width: 280,
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 20,
    elevation: 10,
  },

  // Título del menú.
  tituloMenu: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 5,
  },

  // Subtítulo del menú.
  subtituloMenu: {
    fontSize: 14,
    color: '#777777',
    marginBottom: 30,
  },

  // Opción del menú.
  opcionMenu: {
    paddingVertical: 17,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 5,
  },

  // Texto de las opciones.
  textoMenu: {
    fontSize: 17,
    color: '#333333',
  },

  // Separador del menú.
  separador: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 20,
  },

  // Opción cerrar sesión.
  opcionCerrar: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },

  // Texto de cerrar sesión.
  textoCerrarMenu: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  botonCerrar: {
    backgroundColor: '#DC2626', // Fondo rojo
    padding: 15,                // Espacio interior
    borderRadius: 10,           // Esquinas redondeadas
    alignItems: 'center',       // Centra el contenido
    marginTop: 20,              // Separación superior
    marginBottom: 15,           // Separación inferior
  },

  // Texto del botón cerrar sesión
  textoBotonCerrar: {
    color: '#FFFFFF',           // Texto blanco
    fontSize: 16,               // Tamaño del texto
    fontWeight: 'bold',         // Texto en negrita
  },

});