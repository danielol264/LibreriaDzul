// =====================================================
// PANTALLA PRINCIPAL DEL CLIENTE
// Proyecto: LibreriaDzul
// Responsable: Apartado CLIENT
// =====================================================
import React, { useEffect, useMemo, useState } from 'react';

import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Image,
    Modal,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';

// Márgenes seguros del celular (notch, barra de estado, barra de gestos)
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Iconos de la barra de estado en blanco sobre el encabezado café
import { StatusBar } from 'expo-status-bar';
// Almacenamiento local del celular (ya está instalado en el proyecto)
import AsyncStorage from '@react-native-async-storage/async-storage';

// Funciones de consulta que ya existen en api.ts (no se modifica ese archivo)
import {
    obtenerLibros,
    obtenerAutores,
    obtenerCategorias,
    obtenerEditoriales,
    obtenerToken,
} from '../services/api';


// =====================================================
// TIPOS DE DATOS (iguales a los modelos de Django)
// =====================================================

type Libro = {
    id: number;
    ISBN: string;
    nombreLibro: string;
    existencias: number;
    paginas: number;
    urlImagen: string;
    editorial: number; // Django devuelve solo el id
    categoria: number;
    autor: number;
};

type Autor = {
    id: number;
    nombreAutor: string;
    Ap: string;
    Am: string;
    nacionalidad: string;
    fechaNacimiento: string;
};

type Categoria = {
    id: number;
    nombreCategoria: string;
    orden: number;
    activo: boolean | null;
};

type Editorial = {
    id: number;
    nombreEditorial: string;
    activo: boolean | null;
};


// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

// Recibimos la función de cierre de sesión desde index.tsx.
export default function Cliente({
    onCerrarSesion,
}: {
    onCerrarSesion: () => void;
}) {
    // Espacio que ocupan el notch y la barra de gestos del celular
    const insets = useSafeAreaInsets();

    // ---------- Datos que vienen del backend ----------
    const [libros, setLibros] = useState<Libro[]>([]);
    const [autores, setAutores] = useState<Autor[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [editoriales, setEditoriales] = useState<Editorial[]>([]);

    // ---------- Estados de la pantalla ----------
    const [cargando, setCargando] = useState(true);
    const [refrescando, setRefrescando] = useState(false);
    const [error, setError] = useState('');

    // Texto escrito en el buscador
    const [busqueda, setBusqueda] = useState('');

    // Categoría seleccionada (null = todas)
    const [categoriaSeleccionada, setCategoriaSeleccionada] =
        useState<number | null>(null);

    // Libro que se muestra en el modal de detalles
    const [libroDetalle, setLibroDetalle] = useState<Libro | null>(null);

    // ---------- Favoritos ----------
    // Lista con los id de los libros favoritos
    const [favoritos, setFavoritos] = useState<number[]>([]);

    // true = mostrar solo favoritos
    const [soloFavoritos, setSoloFavoritos] = useState(false);

    // Llave con la que se guardan en el celular.
    // Usa el token para que cada cliente tenga sus propios favoritos.
    const [llaveFavoritos, setLlaveFavoritos] = useState('');


    // =====================================================
    // CARGA DE DATOS
    // =====================================================

    // Pedimos las 4 listas al mismo tiempo con Promise.all
    async function cargarDatos() {
        try {
            setError('');

            const [datosLibros, datosAutores, datosCategorias, datosEditoriales] =
                await Promise.all([
                    obtenerLibros(),
                    obtenerAutores(),
                    obtenerCategorias(),
                    obtenerEditoriales(),
                ]);

            setLibros(datosLibros);
            setAutores(datosAutores);
            setCategorias(datosCategorias);
            setEditoriales(datosEditoriales);
        } catch (e: any) {
            setError(e.message || 'No se pudo cargar el catálogo');
        } finally {
            setCargando(false);
            setRefrescando(false);
        }
    }

    // Se ejecuta una sola vez al abrir la pantalla
    useEffect(() => {
        cargarDatos();
        cargarFavoritos();
    }, []);

    // =====================================================
    // FAVORITOS (guardados en el celular)
    // =====================================================

    // Lee los favoritos guardados en AsyncStorage
    async function cargarFavoritos() {
        try {
            const token = await obtenerToken();
            const llave = `favoritos_${token}`;
            setLlaveFavoritos(llave);

            const guardados = await AsyncStorage.getItem(llave);

            // AsyncStorage solo guarda texto; lo convertimos a lista
            if (guardados) {
                setFavoritos(JSON.parse(guardados));
            }
        } catch {
            // Si falla, simplemente empezamos sin favoritos
            setFavoritos([]);
        }
    }

    // Agrega o quita un libro de favoritos
    async function alternarFavorito(id: number) {
        const nuevos = favoritos.includes(id)
            ? favoritos.filter((f) => f !== id) // ya estaba: lo quitamos
            : [...favoritos, id];               // no estaba: lo agregamos

        setFavoritos(nuevos);

        try {
            // Guardamos la lista como texto
            await AsyncStorage.setItem(llaveFavoritos, JSON.stringify(nuevos));
        } catch {
            Alert.alert('Error', 'No se pudo guardar el favorito');
        }
    }

    function esFavorito(id: number) {
        return favoritos.includes(id);
    }

    // Al deslizar hacia abajo la lista
    function refrescar() {
        setRefrescando(true);
        cargarDatos();
    }


    // =====================================================
    // FUNCIONES DE APOYO
    // =====================================================

    // Convierte el id del autor en su nombre completo
    function nombreAutor(id: number) {
        const autor = autores.find((a) => a.id === id);
        if (!autor) return 'Autor desconocido';
        return `${autor.nombreAutor} ${autor.Ap} ${autor.Am}`.trim();
    }

    function nombreCategoria(id: number) {
        const categoria = categorias.find((c) => c.id === id);
        return categoria ? categoria.nombreCategoria : 'Sin categoría';
    }

    function nombreEditorial(id: number) {
        const editorial = editoriales.find((e) => e.id === id);
        return editorial ? editorial.nombreEditorial : 'Sin editorial';
    }

    // Categorías activas ordenadas por el campo "orden"
    const categoriasVisibles = useMemo(
        () =>
            categorias
                .filter((c) => c.activo !== false)
                .sort((a, b) => a.orden - b.orden),
        [categorias]
    );

    // Lista filtrada por búsqueda y categoría.
    // useMemo evita recalcular si nada cambió.
    const librosFiltrados = useMemo(() => {
        const texto = busqueda.trim().toLowerCase();

        return libros.filter((libro) => {
            // Filtro de favoritos
            if (soloFavoritos && !favoritos.includes(libro.id)) {
                return false;
            }

            // Filtro por categoría
            if (
                categoriaSeleccionada !== null &&
                libro.categoria !== categoriaSeleccionada
            ) {
                return false;
            }

            // Sin texto, pasan todos
            if (texto === '') return true;

            // Buscamos por título, ISBN o autor
            return (
                libro.nombreLibro.toLowerCase().includes(texto) ||
                libro.ISBN.toLowerCase().includes(texto) ||
                nombreAutor(libro.autor).toLowerCase().includes(texto)
            );
        });
    }, [libros, autores, busqueda, categoriaSeleccionada, soloFavoritos, favoritos]);


    // =====================================================
    // PIEZAS DE LA PANTALLA
    // =====================================================

    // Encabezado, botón de salir, buscador y categorías.
    // Va como ListHeaderComponent para que todo haga scroll junto.
    const encabezado = (
        <View>
            {/* Encabezado de la pantalla */}
            <View style={[styles.encabezado, { paddingTop: insets.top + 20 }]}>
                <Text style={styles.titulo}>Librería Dzul</Text>
                <Text style={styles.subtitulo}>
                    Bienvenido a nuestra librería
                </Text>
            </View>

            {/* Botón para cerrar sesión */}
            <TouchableOpacity
                style={styles.botonCerrar}
                onPress={() => {
                    Alert.alert(
                        'Cerrar sesión',
                        '¿Deseas salir de tu cuenta?',
                        [
                            { text: 'Cancelar', style: 'cancel' },
                            { text: 'Sí, salir', onPress: onCerrarSesion },
                        ]
                    );
                }}
            >
                <Text style={styles.textoBoton}>Cerrar sesión</Text>
            </TouchableOpacity>

            {/* Buscador */}
            <TextInput
                style={styles.buscador}
                placeholder="Buscar por título, autor o ISBN"
                placeholderTextColor="#999999"
                value={busqueda}
                onChangeText={setBusqueda}
                autoCorrect={false}
            />

            {/* Filtro de categorías (scroll horizontal) */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filaCategorias}
            >
                {/* Botón para ver solo favoritos */}
                <TouchableOpacity
                    style={[
                        styles.chip,
                        soloFavoritos && styles.chipActivo,
                    ]}
                    onPress={() => setSoloFavoritos(!soloFavoritos)}
                >
                    <Text
                        style={[
                            styles.textoChip,
                            soloFavoritos && styles.textoChipActivo,
                        ]}
                    >
                        ♥ Favoritos ({favoritos.length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.chip,
                        categoriaSeleccionada === null && styles.chipActivo,
                    ]}
                    onPress={() => setCategoriaSeleccionada(null)}
                >
                    <Text
                        style={[
                            styles.textoChip,
                            categoriaSeleccionada === null && styles.textoChipActivo,
                        ]}
                    >
                        Todas
                    </Text>
                </TouchableOpacity>

                {categoriasVisibles.map((c) => (
                    <TouchableOpacity
                        key={c.id}
                        style={[
                            styles.chip,
                            categoriaSeleccionada === c.id && styles.chipActivo,
                        ]}
                        onPress={() => setCategoriaSeleccionada(c.id)}
                    >
                        <Text
                            style={[
                                styles.textoChip,
                                categoriaSeleccionada === c.id && styles.textoChipActivo,
                            ]}
                        >
                            {c.nombreCategoria}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Text style={styles.tituloSeccion}>
                Catálogo de libros ({librosFiltrados.length})
            </Text>

            {error !== '' && <Text style={styles.error}>{error}</Text>}
        </View>
    );

    // Tarjeta de cada libro en la lista
    function tarjetaLibro({ item }: { item: Libro }) {
        const disponible = item.existencias > 0;

        return (
            <TouchableOpacity
                style={styles.tarjeta}
                onPress={() => setLibroDetalle(item)}
            >
                <Portada url={item.urlImagen} estilo={styles.portadaChica} />

                <View style={styles.infoTarjeta}>
                    <Text style={styles.nombreLibro} numberOfLines={2}>
                        {item.nombreLibro}
                    </Text>
                    <Text style={styles.texto} numberOfLines={1}>
                        {nombreAutor(item.autor)}
                    </Text>
                    <Text style={styles.textoChico}>
                        {nombreCategoria(item.categoria)}
                    </Text>
                    <Text
                        style={[
                            styles.disponibilidad,
                            { color: disponible ? '#2E7D32' : '#C62828' },
                        ]}
                    >
                        {disponible
                            ? `Disponibles: ${item.existencias}`
                            : 'Agotado'}
                    </Text>
                </View>

                {/* Corazón para agregar o quitar de favoritos */}
                <TouchableOpacity
                    style={styles.botonCorazon}
                    onPress={() => alternarFavorito(item.id)}
                    hitSlop={10}
                >
                    <Text style={styles.corazon}>
                        {esFavorito(item.id) ? '♥' : '♡'}
                    </Text>
                </TouchableOpacity>
            </TouchableOpacity>
        );
    }


    // =====================================================
    // RENDER
    // =====================================================

    // Pantalla de carga inicial
    if (cargando) {
        return (
            <View style={styles.centrado}>
                <ActivityIndicator size="large" color="#4B2E2B" />
                <Text style={styles.texto}>Cargando catálogo...</Text>
            </View>
        );
    }

    return (
        <View style={styles.contenedor}>
            <StatusBar style="light" />

            <FlatList
                data={librosFiltrados}
                keyExtractor={(libro) => String(libro.id)}
                renderItem={tarjetaLibro}
                ListHeaderComponent={encabezado}
                ListEmptyComponent={
                    <Text style={styles.vacio}>
                        {soloFavoritos
                            ? 'Aún no tienes libros favoritos.'
                            : 'No se encontraron libros.'}
                    </Text>
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refrescando}
                        onRefresh={refrescar}
                    />
                }
                keyboardShouldPersistTaps="handled"
                // Oculta el teclado al deslizar la lista
                keyboardDismissMode="on-drag"
                contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
            />

            {/* Modal con los detalles del libro */}
            <Modal
                visible={libroDetalle !== null}
                animationType="slide"
                transparent
                // En Android, el fondo oscuro cubre también la barra de estado
                statusBarTranslucent
                // En Android, el botón "atrás" cierra el modal
                onRequestClose={() => setLibroDetalle(null)}
            >
                <View style={styles.fondoModal}>
                    <View style={[styles.modal, { paddingBottom: insets.bottom + 20 }]}>
                        {libroDetalle && (
                            <ScrollView>
                                <Portada
                                    url={libroDetalle.urlImagen}
                                    estilo={styles.portadaGrande}
                                />

                                <Text style={styles.tituloDetalle}>
                                    {libroDetalle.nombreLibro}
                                </Text>

                                <Dato etiqueta="Autor" valor={nombreAutor(libroDetalle.autor)} />
                                <Dato etiqueta="Categoría" valor={nombreCategoria(libroDetalle.categoria)} />
                                <Dato etiqueta="Editorial" valor={nombreEditorial(libroDetalle.editorial)} />
                                <Dato etiqueta="ISBN" valor={libroDetalle.ISBN} />
                                <Dato etiqueta="Páginas" valor={String(libroDetalle.paginas)} />
                                <Dato
                                    etiqueta="Existencias"
                                    valor={
                                        libroDetalle.existencias > 0
                                            ? String(libroDetalle.existencias)
                                            : 'Agotado'
                                    }
                                />

                                {/* Botón de favoritos en el detalle */}
                                <TouchableOpacity
                                    style={[
                                        styles.botonFavorito,
                                        esFavorito(libroDetalle.id) && styles.botonFavoritoActivo,
                                    ]}
                                    onPress={() => alternarFavorito(libroDetalle.id)}
                                >
                                    <Text
                                        style={[
                                            styles.textoFavorito,
                                            esFavorito(libroDetalle.id) && styles.textoFavoritoActivo,
                                        ]}
                                    >
                                        {esFavorito(libroDetalle.id)
                                            ? '♥ Quitar de favoritos'
                                            : '♡ Agregar a favoritos'}
                                    </Text>
                                </TouchableOpacity>
                            </ScrollView>
                        )}

                        <TouchableOpacity
                            style={styles.botonCerrarModal}
                            onPress={() => setLibroDetalle(null)}
                        >
                            <Text style={styles.textoBoton}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}


// =====================================================
// COMPONENTES PEQUEÑOS
// =====================================================

// Muestra la portada; si no hay URL o falla, muestra un recuadro.
function Portada({ url, estilo }: { url: string; estilo: any }) {
    const [fallo, setFallo] = useState(false);

    if (!url || fallo) {
        return (
            <View style={[estilo, styles.sinPortada]}>
                <Text style={styles.textoSinPortada}>Sin portada</Text>
            </View>
        );
    }

    return (
        <Image
            source={{ uri: url }}
            style={estilo}
            resizeMode="cover"
            onError={() => setFallo(true)}
        />
    );
}

// Una fila "Etiqueta: valor" del detalle
function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
    return (
        <View style={styles.filaDato}>
            <Text style={styles.etiqueta}>{etiqueta}</Text>
            <Text style={styles.valor}>{valor}</Text>
        </View>
    );
}


// =====================================================
// ESTILOS DE LA PANTALLA
// =====================================================

const styles = StyleSheet.create({

    // Fondo general
    contenedor: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },

    centrado: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#F5F5F5',
    },

    // Encabezado
    encabezado: {
        backgroundColor: '#4B2E2B',
        padding: 25,
    },

    titulo: {
        color: '#FFFFFF',
        fontSize: 26,
        fontWeight: 'bold',
    },

    subtitulo: {
        color: '#E8D9C5',
        fontSize: 16,
        marginTop: 8,
    },

    // Botón para cerrar sesión
    botonCerrar: {
        backgroundColor: '#8B4513',
        padding: 12,
        marginHorizontal: 15,
        marginTop: 10,
        borderRadius: 8,
        alignItems: 'center',
    },

    textoBoton: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },

    // Buscador
    buscador: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 15,
        marginTop: 15,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#DDDDDD',
        color: '#333333',
    },

    // Categorías
    filaCategorias: {
        paddingHorizontal: 15,
        paddingVertical: 12,
        gap: 8,
    },

    chip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#4B2E2B',
    },

    chipActivo: {
        backgroundColor: '#4B2E2B',
    },

    textoChip: {
        color: '#4B2E2B',
        fontSize: 14,
    },

    textoChipActivo: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },

    tituloSeccion: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4B2E2B',
        marginHorizontal: 15,
        marginBottom: 5,
    },

    error: {
        color: '#C62828',
        marginHorizontal: 15,
        marginBottom: 10,
    },

    // Tarjeta de libro
    tarjeta: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 15,
        marginTop: 10,
        padding: 12,
        borderRadius: 12,
    },

    portadaChica: {
        width: 70,
        height: 100,
        borderRadius: 6,
    },

    infoTarjeta: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
        gap: 3,
    },

    nombreLibro: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
    },

    texto: {
        fontSize: 15,
        color: '#555555',
    },

    textoChico: {
        fontSize: 13,
        color: '#888888',
    },

    disponibilidad: {
        fontSize: 13,
        fontWeight: 'bold',
        marginTop: 2,
    },

    vacio: {
        textAlign: 'center',
        color: '#888888',
        marginTop: 30,
    },

    // Portada vacía
    sinPortada: {
        backgroundColor: '#E8D9C5',
        justifyContent: 'center',
        alignItems: 'center',
    },

    textoSinPortada: {
        color: '#4B2E2B',
        fontSize: 11,
        textAlign: 'center',
    },

    // Modal de detalles
    fondoModal: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },

    modal: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '85%',
    },

    portadaGrande: {
        width: 150,
        height: 220,
        borderRadius: 8,
        alignSelf: 'center',
        marginBottom: 15,
    },

    tituloDetalle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#4B2E2B',
        textAlign: 'center',
        marginBottom: 15,
    },

    filaDato: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },

    etiqueta: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#4B2E2B',
    },

    valor: {
        fontSize: 15,
        color: '#555555',
        flexShrink: 1,
        textAlign: 'right',
        marginLeft: 10,
    },

    // Favoritos
    botonCorazon: {
        justifyContent: 'center',
        paddingHorizontal: 8,
    },

    corazon: {
        fontSize: 26,
        color: '#C62828',
    },

    botonFavorito: {
        borderWidth: 1,
        borderColor: '#C62828',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 15,
    },

    botonFavoritoActivo: {
        backgroundColor: '#C62828',
    },

    textoFavorito: {
        color: '#C62828',
        fontSize: 16,
        fontWeight: 'bold',
    },

    textoFavoritoActivo: {
        color: '#FFFFFF',
    },

    botonCerrarModal: {
        backgroundColor: '#8B4513',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 15,
    },

});
