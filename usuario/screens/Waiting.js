import socket from '../socket.js';

export default function renderWaiting() {
	const app = document.getElementById('app');

	// Traer datos guardados
	const selectedProduct = JSON.parse(localStorage.getItem('selectedProduct') || 'null');
	const orderId = localStorage.getItem('lastOrderId') || ''; // si ya lo guardas al confirmar

	// HTML
	app.innerHTML = `
    <section class="screen waiting-screen">
      <header class="brand-bar">
        <img class="brand-bar__logo" src="../Assets/logo-menu.png" alt="Juan Valdez Café" />
      </header>

      <main class="container wait-panel">
        <h1 class="wait-title">¡Tu pedido ha sido<br/>confirmado!</h1>
        <p class="wait-subtitle">
          Número de confirmación <strong id="orderNumber">${orderId || '—'}</strong>
        </p>

        <div class="wait-image-wrapper">
          <img id="waitProductImage" class="wait-image" src="" alt="Bebida" />
        </div>

        <div class="wait-status">
          <p class="wait-status-label">Estado de tu bebida</p>
          <button id="statusPill" class="status-pill is-received" type="button" disabled>
            Orden recibida
          </button>
        </div>
      </main>
    </section>
  `;

	// Imagen del producto (con fallback)
	const $img = document.getElementById('waitProductImage');
	const fallbackSrc = '/usuario/Assets/placeholder-product.png'; // agrega este asset
	$img.onerror = () => {
		$img.src = fallbackSrc;
		$img.alt = 'Producto';
	};
	if (selectedProduct?.img) {
		$img.src = selectedProduct.img;
		$img.alt = selectedProduct?.mensaje || 'Producto';
	} else {
		$img.src = fallbackSrc;
		$img.alt = 'Producto';
	}

	const $pill = document.getElementById('statusPill');
	const $orderNumber = document.getElementById('orderNumber');

	// Si el backend te vuelve a mandar el id en cada actualización, lo reflejamos
	function maybeSetOrderId(id) {
		if (id && id !== $orderNumber.textContent) {
			$orderNumber.textContent = id;
			localStorage.setItem('lastOrderId', id);
		}
	}

	// Normalización de estados
	function setStatus(estadoRaw) {
		const estado = String(estadoRaw || '')
			.toLowerCase()
			.trim();
		$pill.classList.remove('is-received', 'is-processing', 'is-ready');

		if (estado.includes('listo')) {
			$pill.classList.add('is-ready');
			$pill.textContent = 'Listo';
			return;
		}
		if (estado.includes('proceso') || estado.includes('prepar') || estado.includes('haciendo')) {
			$pill.classList.add('is-processing');
			$pill.textContent = 'En proceso';
			return;
		}
		// default
		$pill.classList.add('is-received');
		$pill.textContent = 'Orden recibida';
	}

	// Limpia listeners previos para no duplicar
	socket.off('actualizarEstado');
	socket.off('pedidoNoEncontrado');

	// Escuchar cambios desde el panel del barista
	socket.on('actualizarEstado', (payload) => {
		// payload esperado: { estado: "Orden recibida" | "En proceso" | "Listo", orderId? }
		try {
			if (payload?.orderId) maybeSetOrderId(payload.orderId);
			setStatus(payload?.estado);
		} catch (e) {
			console.warn('Payload inesperado en actualizarEstado:', payload);
		}
	});

	// Caso de pedido no encontrado
	socket.once('pedidoNoEncontrado', () => {
		setStatus('Orden recibida'); // vuelve al estado inicial
		$orderNumber.textContent = '—';
	});
}
