// ==================================================
// LIBRERIADZUL - APLICACIÓN PRINCIPAL
// ==================================================

// Importamos React y los hooks necesarios.
import { useState, useEffect } from 'react';
// Importamos la pantalla que desarrollará nuestro compañero.
import Cliente from './cliente';
// Importamos los componentes visuales de React Native.
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

// Importamos las funciones de conexión con Django.
import {
  iniciarSesion,
  eliminarToken,
  obtenerLibros,
  registrarLibro,
  // Funciones para consultar los datos de los selectores
  obtenerAutores,
  obtenerCategorias,
  obtenerEditoriales,
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

  // Indica si estamos cargando libros.
  const [cargandoLibros, setCargandoLibros] = useState(false);

  // Mensaje de error al consultar libros.
  const [errorLibros, setErrorLibros] = useState('');


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

  // Indica si estamos guardando un libro.
  const [guardandoLibro, setGuardandoLibro] = useState(false);

  // Mensaje de registro.
  const [mensajeRegistro, setMensajeRegistro] = useState('');

  // Controla si mostramos el formulario.
  const [mostrarFormulario, setMostrarFormulario] = useState(false);


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
  // CARGAR LIBROS AL ENTRAR A LA SECCIÓN
  // ==================================================

  useEffect(() => {

    // Si el administrador entra a Libros,
    // consultamos automáticamente la base de datos.
    if (administrador && seccion === 'Libros') {

      cargarLibros();

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
  // REGISTRAR LIBRO
  // ==================================================

  async function handleRegistrarLibro() {

    // Limpiamos el mensaje anterior.
    setMensajeRegistro('');

    // Validamos los campos obligatorios.
    if (
      nuevoLibro.ISBN.trim() === '' ||
      nuevoLibro.nombreLibro.trim() === '' ||
      nuevoLibro.existencias.trim() === '' ||
      nuevoLibro.paginas.trim() === '' ||
      nuevoLibro.editorial.trim() === '' ||
      nuevoLibro.categoria.trim() === '' ||
      nuevoLibro.autor.trim() === ''
    ) {

      setMensajeRegistro(
        'Completa todos los campos obligatorios.'
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
      await registrarLibro(libroParaEnviar);

      // Mostramos el mensaje de éxito.
      setMensajeRegistro('¡Libro registrado correctamente!');

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

      // Ocultamos el formulario.
      setMostrarFormulario(false);

      // Actualizamos la lista.
      await cargarLibros();

    } catch (err: any) {

      // Mostramos el error.
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
              onPress={() =>
                setMostrarFormulario(!mostrarFormulario)
              }
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
                  Registrar nuevo libro
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

                <TextInput
                  style={styles.input}
                  placeholder="ID de editorial"
                  placeholderTextColor="#777777"
                  keyboardType="numeric"
                  value={nuevoLibro.editorial}
                  onChangeText={(texto) =>
                    setNuevoLibro({
                      ...nuevoLibro,
                      editorial: texto,
                    })
                  }
                />

                <TextInput
                  style={styles.input}
                  placeholder="ID de categoría"
                  placeholderTextColor="#777777"
                  keyboardType="numeric"
                  value={nuevoLibro.categoria}
                  onChangeText={(texto) =>
                    setNuevoLibro({
                      ...nuevoLibro,
                      categoria: texto,
                    })
                  }
                />

                <TextInput
                  style={styles.input}
                  placeholder="ID de autor"
                  placeholderTextColor="#777777"
                  keyboardType="numeric"
                  value={nuevoLibro.autor}
                  onChangeText={(texto) =>
                    setNuevoLibro({
                      ...nuevoLibro,
                      autor: texto,
                    })
                  }
                />

                {mensajeRegistro !== '' && (

                  <Text style={styles.mensaje}>
                    {mensajeRegistro}
                  </Text>

                )}

                <TouchableOpacity
                  style={styles.boton}
                  onPress={handleRegistrarLibro}
                  disabled={guardandoLibro}
                >

                  {guardandoLibro ? (

                    <ActivityIndicator color="#FFFFFF" />

                  ) : (

                    <Text style={styles.textoBoton}>
                      Guardar libro
                    </Text>

                  )}

                </TouchableOpacity>

              </View>

            )}


            {/* ======================================
                LISTA DE LIBROS
            ====================================== */}

            <View style={styles.tarjeta}>

              <Text style={styles.tituloSeccion}>
                Libros registrados
              </Text>

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
              {libros.map((libro, index) => (

                <View
                  style={styles.tarjetaLibro}
                  key={libro.id ?? index}
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

                </View>

              ))}

            </View>

          </View>

        )}


        {/* ==========================================
            SECCIONES PREPARADAS
        ========================================== */}

        {(
          seccion === 'Autores' ||
          seccion === 'Categorías' ||
          seccion === 'Editoriales'
        ) && (

            <View style={styles.tarjeta}>

              <Text style={styles.tituloSeccion}>
                {seccion}
              </Text>

              <Text style={styles.textoTarjeta}>
                Esta sección estará disponible
                próximamente.
              </Text>

              <Text style={styles.textoInformativo}>
                Aquí agregaremos las funciones
                para administrar {seccion.toLowerCase()}.
              </Text>

            </View>

          )}

      </ScrollView>


      {/* ==========================================
          MENÚ LATERAL
      ========================================== */}

      {menuAbierto && (

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
                🏠  Inicio
              </Text>

            </TouchableOpacity>


            {/* Opción Libros. */}
            <TouchableOpacity
              style={styles.opcionMenu}
              onPress={() => seleccionarSeccion('Libros')}
            >

              <Text style={styles.textoMenu}>
                📚  Libros
              </Text>

            </TouchableOpacity>


            {/* Opción Autores. */}
            <TouchableOpacity
              style={styles.opcionMenu}
              onPress={() => seleccionarSeccion('Autores')}
            >

              <Text style={styles.textoMenu}>
                ✍️  Autores
              </Text>

            </TouchableOpacity>


            {/* Opción Categorías. */}
            <TouchableOpacity
              style={styles.opcionMenu}
              onPress={() => seleccionarSeccion('Categorías')}
            >

              <Text style={styles.textoMenu}>
                🏷️  Categorías
              </Text>

            </TouchableOpacity>


            {/* Opción Editoriales. */}
            <TouchableOpacity
              style={styles.opcionMenu}
              onPress={() => seleccionarSeccion('Editoriales')}
            >

              <Text style={styles.textoMenu}>
                🏢  Editoriales
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
                🚪  Cerrar sesión
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      )}

    </View>

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
    height: 65,
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
    paddingBottom: 40,
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
    color: '#666666',
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