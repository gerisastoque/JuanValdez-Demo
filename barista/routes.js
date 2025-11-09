import renderDashboard from "./screens/Dashboard.js";
import renderOrderDetails from "./screens/OrderDetails.js";
import socket from "./socket.js";

const router = new Router({
  mode: "hash", // Navegación basada en hash
  page404: (path) => {
    const app = document.getElementById("app");
    app.innerHTML = `<h1>404 - Página No Encontrada</h1><p>La página ${path} no existe.</p>`;
  },
});

// Función para limpiar contenido previo
function clearScripts() {
  document.getElementById("app").innerHTML = "";
}

// Definición de rutas
router.add("/", async () => {
  clearScripts();
  renderDashboard();
});

router.add("/orderDetails/:id", async (params) => {
  clearScripts();
  renderOrderDetails(params.id);
});

// Inicializar el router
router.check().addUriListener();

// Escuchar eventos de navegación en el navegador
window.addEventListener("popstate", () => {
  router.check();
});

document.addEventListener("DOMContentLoaded", () => {
  router.check();
});

export { router, socket };
