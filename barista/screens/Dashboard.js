import socket from '../socket.js';

export default function renderDashboard() {
	const app = document.getElementById('app');
	app.innerHTML = `
	<!-- Barra roja con logo -->
	<section>
      <header class="brand-bar">
        <img
          class="brand-bar__logo"
          src="../Assets/logo-menu.png"
          alt="Juan Valdez Café"
        />
      </header>
	  <section/>
	   <img
          class="welcome-image"
          src="../Assets/image-barista.png"
          alt="Juan Valdez Café"
        />
    <table id="ordersTable" class="table">
      <thead>
        <tr>
          <th># Pedido</th>
          <th>Producto</th>
          <th>Tamaño</th>
          <th>Nombre cliente</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  `;

	const ordersTableBody = document.querySelector('#ordersTable tbody');

	function addOrderToTable(order) {
		const row = document.createElement('tr');
		row.dataset.id = order.id;
		row.innerHTML = `
      <td>${order.id}</td>
      <td>${order.producto}</td>
      <td>${order.tamaño}</td>
      <td>${order.detalles}</td>
      <td>
        <select class="estado-select">
          <option value="1" ${order.estado_id === 1 ? 'selected' : ''}>Orden Recibida</option>
          <option value="2" ${order.estado_id === 2 ? 'selected' : ''}>En Preparación</option>
          <option value="3" ${order.estado_id === 3 ? 'selected' : ''}>Listo</option>
        </select>
      </td>
      <td>
        <button class="actualizar-estado-btn">Actualizar</button>
      </td>
    `;
		ordersTableBody.appendChild(row);
	}

	function cargarPedidos(pedidos) {
		ordersTableBody.innerHTML = '';
		pedidos.forEach(addOrderToTable);
	}

	socket.emit('obtenerPedidos');
	socket.on('cargarPedidos', cargarPedidos);
	socket.on('nuevoPedido', addOrderToTable);

	ordersTableBody.addEventListener('click', (e) => {
		if (e.target.classList.contains('actualizar-estado-btn')) {
			const row = e.target.closest('tr');
			const id = row.dataset.id;
			const nuevoEstado = row.querySelector('.estado-select').value;

			socket.emit('actualizarEstadoPedido', { id, nuevoEstado });
		}
	});

	socket.on('actualizarEstado', (updatedOrder) => {
		const row = ordersTableBody.querySelector(`tr[data-id="${updatedOrder.id}"]`);
		if (row) {
			const select = row.querySelector('.estado-select');
			select.value = updatedOrder.estado_id;
		}
	});
}
