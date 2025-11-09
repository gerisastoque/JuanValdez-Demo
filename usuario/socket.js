const socket = io();

// Evento de conexión
socket.on("connect", () => {
  console.log("Conectado al servidor como Usuario, ID:", socket.id);
});

// Recibir actualizaciones desde el servidor
socket.on("updateOrderStatus", (status) => {
  const orderStatusText = document.getElementById("orderStatusText");
  if (orderStatusText) {
    orderStatusText.textContent = status;
  }
});

export default socket;
