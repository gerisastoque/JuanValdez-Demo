import socket from '../socket.js';

export default function renderRecommendation() {
	const app = document.getElementById('app');
	// NO tocar el body aquí (el router se encarga)
	// document.body.className = 'recommendation';

	app.innerHTML = `
    <section class="screen recommendation-screen">
      <header class="brand-bar">
        <img class="brand-bar__logo" src="../Assets/logo-menu.png" alt="Juan Valdez Café" />
      </header>

      <main class="rec-panel container">
        <div class="rec-card">
          <div class="rec-image-wrapper">
            <img id="imagen-bebida" class="rec-image" src="" alt="Bebida recomendada" />
          </div>

          <div class="rec-texts">
            <h2 id="mensaje-personalizado" class="rec-title">
              ¡Tu bebida ideal es <strong id="producto-nombre">…</strong>!
            </h2>

            <p id="descripcion-bebida" class="rec-desc">Estamos generando tu recomendación…</p>
            <p id="tamano-bebida" class="rec-size">Tamaño <strong>Mediana</strong></p>
          </div>

          <div class="rec-actions">
            <button id="confirmOrderBtn" class="btn btn-light" disabled>Continua para facturar</button>
            <button id="cancelOrderBtn" class="btn btn-ghost-rose">Cancelar</button>
          </div>
        </div>
      </main>
    </section>
  `;

	const $img = document.getElementById('imagen-bebida');
	const $title = document.getElementById('mensaje-personalizado');
	const $desc = document.getElementById('descripcion-bebida');
	const $size = document.getElementById('tamano-bebida');
	const $go = document.getElementById('confirmOrderBtn');
	const $cancel = document.getElementById('cancelOrderBtn');

	$go.addEventListener('click', () => {
		window.location.hash = '/billing';
	});
	$cancel.addEventListener('click', () => {
		window.location.hash = '/';
	});

	socket.off('recomendacion');
	socket.on('recomendacion', (recommendation) => {
		const expected = ['img', 'mensaje', 'descripcion', 'tamano'];
		if (!expected.every((k) => k in recommendation)) return;

		// 1) Carga robusta de imagen con fallback
		const fallbackSrc = '/usuario/Assets/placeholder-product.png'; // crea/usa este asset
		$img.onload = () => {
			// no-op: imagen ok
		};
		$img.onerror = () => {
			// si falla, usa placeholder y limpia alt (para que no aparezca texto)
			$img.src = fallbackSrc;
			$img.alt = 'Producto';
		};

		// Seteamos la imagen al final, para que onerror/onload estén listos
		$img.alt = recommendation.mensaje || 'Producto'; // solo el nombre, NO la frase “¡Tu bebida ideal es…”
		$img.src = recommendation.img || fallbackSrc;

		// 2) Título y textos
		$title.innerHTML = `¡Tu bebida ideal es <strong id="producto-nombre">${recommendation.mensaje}</strong>!`;
		$desc.textContent = recommendation.descripcion || '';
		$size.innerHTML = `Tamaño <strong>${recommendation.tamano || 'Mediana'}</strong>`;

		localStorage.setItem('selectedProduct', JSON.stringify(recommendation));
		$go.disabled = false;
	});
}
