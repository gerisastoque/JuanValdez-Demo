const socket = io();

// Evento de conexión
socket.on("connect", () => {
  console.log("Conectado al servidor como Barista, ID:", socket.id);
});

// Recibir actualizaciones de pedidos
socket.on("newOrder", (order) => {
  console.log("Nuevo Pedido Recibido:", order);
  const ordersTableBody = document.querySelector("#ordersTable tbody");
  if (ordersTableBody) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${order.id}</td>
      <td>${order.producto}</td>
      <td>${order.tamano}</td>
      <td>${order.detalles}</td>
      <td>${order.estado}</td>
    `;
    ordersTableBody.appendChild(row);
  }
});

export default socket;
