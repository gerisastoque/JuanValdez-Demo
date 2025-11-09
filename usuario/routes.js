import renderHome from './screens/Home.js';
import renderForm from './screens/Form.js';
import renderRecommendation from './screens/Recommendation.js';
import renderBilling from './screens/Billing.js';
import renderWaiting from './screens/Waiting.js';
import socket from './socket.js';

/**
 * Configuración del router principal
 */
const router = new Router({
	mode: 'hash', // Navegación basada en hash (#)
	page404: (path) => {
		const app = document.getElementById('app');
		app.innerHTML = `<h1>404 - Página No Encontrada</h1><p>La página ${path} no existe.</p>`;
	},
});

/**
 * Limpia el contenido del contenedor principal antes de renderizar una nueva pantalla
 */
function clearScripts() {
	document.getElementById('app').innerHTML = '';
}

/**
 * Asigna una clase al <body> según la pantalla actual.
 * Garantiza que las reglas CSS específicas (.recommendation, .form, etc.) se apliquen correctamente.
 * @param {string} name - Nombre base de la clase (ej: 'recommendation', 'home', etc.)
 */
function setBodyScreenClass(name) {
	document.body.className = ''; // Limpia clases previas
	document.body.classList.add(name);
}

/**
 * Definición de rutas principales de la app
 */
router.add('/', async () => {
	clearScripts();
	setBodyScreenClass('home');
	renderHome();
});

router.add('/form', async () => {
	clearScripts();
	setBodyScreenClass('form');
	renderForm();
});

router.add('/recommendation', async () => {
	clearScripts();
	setBodyScreenClass('recommendation');
	renderRecommendation();
});

router.add('/billing', async () => {
	clearScripts();
	setBodyScreenClass('billing');
	renderBilling();
});

router.add('/waiting', async () => {
	clearScripts();
	setBodyScreenClass('waiting');
	renderWaiting();
});

/**
 * Inicialización del router y listeners
 */
router.check().addUriListener();

// Detectar navegación del navegador (back/forward)
window.addEventListener('popstate', () => {
	router.check();
});

// Verifica la ruta al cargar la app
document.addEventListener('DOMContentLoaded', () => {
	router.check();
});

export { router, socket };
