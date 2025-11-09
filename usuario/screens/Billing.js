import socket from '../socket.js';

export default function renderBilling() {
	const app = document.getElementById('app');

	// Recuperar el producto seleccionado
	const selectedProduct = JSON.parse(localStorage.getItem('selectedProduct'));
	if (!selectedProduct) {
		alert('No se encontró un producto seleccionado. Por favor, regresa y elige uno.');
		window.location.hash = '/';
		return;
	}

	app.innerHTML = `
    <section class="screen billing-screen">
      <header class="brand-bar">
        <img class="brand-bar__logo" src="../Assets/logo-menu.png" alt="Juan Valdez Café" />
      </header>

      <main class="container bill-panel">
        <h1 class="bill-title">Tu bebida será facturada con los siguientes datos</h1>
        <p class="bill-subtitle">Por favor llena la siguiente información.</p>

        <form id="formBilling" class="bill-form" novalidate>
          <div class="field">
            <input id="nombre" name="nombre" type="text" class="input"
              placeholder="Escribe tu nombre*" autocomplete="given-name" required />
          </div>

          <div class="field">
            <input id="apellido" name="apellido" type="text" class="input"
              placeholder="Escribe tu apellido*" autocomplete="family-name" required />
          </div>

          <div class="field">
            <input id="cedula" name="cedula" type="text" inputmode="numeric" pattern="[0-9]{5,20}"
              class="input" placeholder="Escribe tu cédula*" autocomplete="off" required />
          </div>

          <div class="field">
            <input id="correo" name="correo" type="email" class="input"
              placeholder="Escribe tu correo electrónico*" autocomplete="email" required />
          </div>

          <div class="bill-actions">
            <button id="confirmBtn" type="submit" class="btn btn-primary btn-wide">Confirmar pedido</button>
            <button id="cancelBtn" type="button" class="btn btn-ghost-rose btn-wide">Cancel</button>
          </div>
        </form>
      </main>
    </section>
  `;

	const $form = document.getElementById('formBilling');
	const $confirm = document.getElementById('confirmBtn');
	const $cancel = document.getElementById('cancelBtn');

	// Navegación
	$cancel.addEventListener('click', () => {
		window.location.hash = '/recommendation';
	});

	// Validación mínima UX
	const validators = {
		nombre: (v) => v.trim().length >= 2,
		apellido: (v) => v.trim().length >= 2,
		cedula: (v) => /^[0-9]{5,20}$/.test(v.trim()),
		correo: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
	};

	function showError(input, msg) {
		const wrap = input.closest('.field');
		const span = wrap?.querySelector('.error-msg');
		if (span) span.textContent = msg || '';
		input.classList.toggle('is-invalid', !!msg);
	}

	$form.addEventListener('submit', (e) => {
		e.preventDefault();

		// Recolectar y validar
		const data = new FormData($form);
		const payload = Object.fromEntries(Array.from(data.entries()).map(([k, v]) => [k, String(v).trim()]));

		let ok = true;
		for (const [k, fn] of Object.entries(validators)) {
			const input = document.getElementById(k);
			const valid = fn(payload[k] || '');
			showError(input, valid ? '' : 'Revisa este campo');
			if (!valid) ok = false;
		}
		if (!ok) return;

		// Agregar producto seleccionado
		payload.producto = selectedProduct.mensaje;
		payload.descripcion = selectedProduct.descripcion;
		payload.tamano = selectedProduct.tamano;

		// Deshabilitar mientras enviamos
		$confirm.disabled = true;

		// Evitar múltiples listeners
		socket.off('pedidoConfirmado');
		socket.off('errorPedido');

		// Emitir al backend
		socket.emit('crearPedido', payload);

		socket.once('pedidoConfirmado', () => {
			window.location.hash = '/waiting';
		});

		socket.once('errorPedido', (error) => {
			console.error('Error al crear el pedido:', error);
			alert('Ocurrió un error al procesar tu pedido. Por favor, intenta nuevamente.');
			$confirm.disabled = false;
		});
	});
}
