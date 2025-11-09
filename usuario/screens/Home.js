export default function renderHome() {
	const app = document.getElementById('app');
	document.body.className = 'home';

	app.innerHTML = `
    <section class="screen home-screen">
      <!-- Barra roja con logo -->
      <header class="brand-bar">
        <img
          class="brand-bar__logo"
          src="../Assets/logo-menu.png"
          alt="Juan Valdez Café"
        />
      </header>

      <!-- Contenido principal -->
      <main class="home-hero container">
       <img
          class="home-heading"
          src="../Assets/bienvenida-usuario.png"
          alt="Bienvenido a Entre Amigos de Juan Valdez"
          loading="eager"
        />

        <p class="home-copy">
          ¿No sabes qué pedir hoy? Entre amigos nos recomendamos.
          <strong>Responde algunas preguntas para recomendarte la bebida perfecta.</strong>
        </p>

        <button id="startBtn" class="btn btn-primary btn-cta">Comenzar</button>
 <div class="home-spacer" aria-hidden="true"></div>
        <img
          class="home-cup"
          src="../Assets/producto-bienvenida.png"
          alt="Vaso de café Juan Valdez"
          loading="lazy"
        />
      </main>
    </section>
  `;

	document.getElementById('startBtn').addEventListener('click', () => {
		window.location.hash = '/form';
	});
}
