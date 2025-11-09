import { supabase } from '../utils/database.js';
import { obtenerRecomendacionDeOpenAI } from './openaiController.js';
import { obtenerUsuarioId } from '../utils/userUtils.js';

/**
 * Procesa el formulario, guarda las respuestas y genera una recomendación.
 * @param {Object} data - Respuestas del formulario.
 * @returns {Object} - Recomendación generada.
 */
export async function processForm(data) {
	try {
		// Guardar las respuestas del formulario en Supabase
		const { data: formularioData, error: errorFormulario } = await supabase
			.from('formularios')
			.insert([{ respuesta: data }]);

		if (errorFormulario) {
			console.error('Error al guardar el formulario en Supabase:', errorFormulario);
			throw new Error('Error al guardar las respuestas del formulario.');
		}

		// Generar la recomendación de OpenAI
		const recomendacion = await obtenerRecomendacionDeOpenAI(data);
		return recomendacion;
	} catch (error) {
		console.error('Error en processForm:', error.message);
		throw error;
	}
}

/**
 * Crea un pedido en la base de datos Supabase y retorna el pedido completo.
 * @param {Object} data - Información del pedido.
 * @returns {Object} - Pedido completo con estado.
 */
export async function createOrder(data) {
	try {
		const usuarioId = await obtenerUsuarioId(data);

		// Insertar el pedido en Supabase
		const { data: pedidoCreado, error: errorPedido } = await supabase
			.from('pedidos')
			.insert([
				{
					usuario_id: usuarioId,
					producto: data.producto,
					tamaño: data.tamano || 'Mediano',
					detalles: `${data.nombre} ${data.apellido}`,
					estado_id: 1, // Estado inicial: "Orden recibida"
				},
			])
			.select('id');

		if (errorPedido || !pedidoCreado || pedidoCreado.length === 0) {
			throw new Error('Error al guardar el pedido.');
		}

		const pedidoId = pedidoCreado[0].id;

		// Obtener el pedido completo con su estado
		const { data: pedidoCompleto, error: errorPedidoCompleto } = await supabase
			.from('pedidos')
			.select(
				`
        id,
        producto,
        tamaño,
        detalles,
        estado_id,
        estados (nombre)
      `
			)
			.eq('id', pedidoId)
			.single();

		if (errorPedidoCompleto || !pedidoCompleto) {
			throw new Error('Error al cargar el pedido completo.');
		}

		return {
			...pedidoCompleto,
			estado: pedidoCompleto.estados.nombre,
		};
	} catch (error) {
		console.error('Error en createOrder:', error.message);
		throw error;
	}
}

/**
 * Obtiene todos los pedidos de la base de datos.
 * @returns {Array} - Lista de pedidos.
 */
export async function obtenerPedidos() {
	try {
		const { data: pedidos, error } = await supabase.from('pedidos').select(`
        id,
        producto,
        tamaño,
        detalles,
        estado_id,
        estados (nombre)
      `);

		if (error) throw new Error('Error al cargar los pedidos.');
		return pedidos;
	} catch (error) {
		console.error('Error en obtenerPedidos:', error.message);
		throw error;
	}
}

/**
 * Actualiza el estado de un pedido.
 * @param {Number} id - ID del pedido.
 * @param {Number} estado - Nuevo estado.
 * @returns {Object} - Pedido actualizado.
 */
export async function updateOrderStatus(id, estado) {
	try {
		const { data, error } = await supabase
			.from('pedidos')
			.update({ estado_id: estado })
			.eq('id', id)
			.select('id, estado_id');

		if (error) throw new Error('Error al actualizar el estado del pedido.');

		const { data: estadoData, error: errorEstado } = await supabase
			.from('estados')
			.select('nombre')
			.eq('id', estado)
			.single();

		if (errorEstado) throw new Error('Error al obtener el nombre del estado actualizado.');

		return {
			id,
			estado: estadoData.nombre,
			estado_id: estado,
		};
	} catch (error) {
		console.error('Error en updateOrderStatus:', error.message);
		throw error;
	}
}

/**
 * Verifica si hay un pedido en curso.
 * @param {String} cedula - Cédula del cliente.
 * @returns {Object|null} - Pedido en curso.
 */
export async function verificarPedidoEnCurso(cedula) {
	try {
		const { data: pedidoData, error } = await supabase
			.from('pedidos')
			.select('id, estado_id, estados (nombre)')
			.eq('cedula', cedula)
			.order('fecha_pedido', { ascending: false })
			.limit(1)
			.single();

		if (error || !pedidoData) return null;

		return {
			id: pedidoData.id,
			estado: pedidoData.estados.nombre,
			estado_id: pedidoData.estado_id,
		};
	} catch (error) {
		console.error('Error en verificarPedidoEnCurso:', error.message);
		throw error;
	}
}
