// =====================================================
// PANTALLA PRINCIPAL DEL CLIENTE
// Proyecto: LibreriaDzul
// Responsable: Apartado CLIENT
// =====================================================
import { useRouter } from 'expo-router';
import React from 'react';

import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
// Función para eliminar el token guardado
import { eliminarToken } from '../services/api';


// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

// Recibimos la función de cierre de sesión desde index.tsx.
export default function Cliente({
    onCerrarSesion,
}: {
    onCerrarSesion: () => void;
}) {
    // Permite navegar entre pantallas
    const router = useRouter();

    return (

        <ScrollView style={styles.contenedor}>

            {/* Encabezado de la pantalla */}
            <View style={styles.encabezado}>

                <Text style={styles.titulo}>
                    Librería Dzul
                </Text>

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
                            {
                                text: 'Cancelar',
                                style: 'cancel',
                            },
                            {
                                text: 'Sí, salir',
                                onPress: onCerrarSesion,
                            },
                        ]
                    );
                }}
            >
                <Text style={styles.textoBoton}>
                    Cerrar sesión
                </Text>
            </TouchableOpacity>


            {/* Sección donde comenzará el catálogo */}
            <View style={styles.seccion}>

                <Text style={styles.tituloSeccion}>
                    Catálogo de libros
                </Text>

                <Text style={styles.texto}>
                    Aquí podrás consultar los libros disponibles.
                </Text>

            </View>


            {/* Espacio reservado para futuras funciones */}
            <View style={styles.seccion}>

                <Text style={styles.tituloSeccion}>
                    Mis libros
                </Text>

                <Text style={styles.texto}>
                    Aquí se podrán mostrar las funciones del cliente.
                </Text>

            </View>

        </ScrollView>

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

    // Encabezado
    encabezado: {
        backgroundColor: '#4B2E2B',
        padding: 25,
        paddingTop: 45,
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

    // Secciones
    seccion: {
        backgroundColor: '#FFFFFF',
        margin: 15,
        padding: 20,
        borderRadius: 12,
    },

    tituloSeccion: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4B2E2B',
        marginBottom: 10,
    },

    texto: {
        fontSize: 15,
        color: '#555555',
    },
    // Estilo del botón para cerrar sesión
    botonCerrar: {
        backgroundColor: '#8B4513',
        padding: 12,
        marginHorizontal: 15,
        marginTop: 10,
        borderRadius: 8,
        alignItems: 'center',
    },

    // Estilo del texto del botón
    textoBoton: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },

});