import {
  processForm,
  createOrder,
  updateOrderStatus,
  verificarPedidoEnCurso,
  obtenerPedidos,
} from "./controllers/orderController.js";

export default function configurarSockets(io) {
  io.on("connection", (socket) => {
    console.log("Usuario conectado:", socket.id);

    // Escuchar el envío del formulario
    socket.on("enviarFormulario", async (data) => {
      try {
        const recomendacion = await processForm(data);
        socket.emit("recomendacion", recomendacion);
      } catch (error) {
        console.error("Error en enviarFormulario:", error.message);
        socket.emit("error", "Error al procesar el formulario y generar la recomendación.");
      }
    });

    // Crear un pedido y notificar a los baristas
    socket.on("crearPedido", async (data) => {
      try {
        const nuevoPedido = await createOrder(data);
        io.emit("nuevoPedido", nuevoPedido);
        socket.emit("pedidoConfirmado", nuevoPedido);
      } catch (error) {
        console.error("Error en crearPedido:", error.message);
        socket.emit("errorPedido", "Error al crear el pedido.");
      }
    });

    // Obtener todos los pedidos para el barista
    socket.on("obtenerPedidos", async () => {
      try {
        const pedidos = await obtenerPedidos();
        socket.emit("cargarPedidos", pedidos);
      } catch (error) {
        console.error("Error en obtenerPedidos:", error.message);
        socket.emit("errorPedidos", "No se pudieron cargar los pedidos.");
      }
    });

    // Actualizar el estado del pedido
    socket.on("actualizarEstadoPedido", async ({ id, nuevoEstado }) => {
      try {
        const pedidoActualizado = await updateOrderStatus(id, nuevoEstado);
        io.emit("actualizarEstado", pedidoActualizado);
      } catch (error) {
        console.error("Error en actualizarEstadoPedido:", error.message);
        socket.emit("errorActualizarEstado", "No se pudo actualizar el estado del pedido.");
      }
    });

    // Verificar pedido en curso
    socket.on("verificarPedidoEnCurso", async ({ cedula }) => {
      try {
        const pedidoEnCurso = await verificarPedidoEnCurso(cedula);
        if (!pedidoEnCurso) {
          socket.emit("pedidoNoEncontrado");
        } else {
          socket.emit("actualizarEstado", pedidoEnCurso);
        }
      } catch (error) {
        console.error("Error en verificarPedidoEnCurso:", error.message);
        socket.emit("error", "Error al verificar el pedido en curso.");
      }
    });
  });
}
