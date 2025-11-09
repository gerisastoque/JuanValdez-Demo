import socket from '../socket.js';

export default function renderForm() {
	const app = document.getElementById('app');
	document.body.className = 'form';

	app.innerHTML = `
    <section class="screen form-screen">
      <!-- Barra roja con logo -->
      <header class="brand-bar">
        <img class="brand-bar__logo" src="../Assets/logo-menu.png" alt="Juan Valdez Café" />
      </header>

      <main class="form-panel container">
        <!-- Usamos grid: fila 1 (contenido con scroll), fila 2 (footer fijo) -->
        <form id="formQuestions" class="form-layout" novalidate>
          <div class="form-content">
            <div class="form-progress" id="progressText">Pregunta 1 de 11</div>
            <h1 class="form-title" id="questionTitle"></h1>
            <div id="questionsContainer" class="options-list"></div>
          </div>

          <div class="navigation-bar">
            <button type="button" id="prevBtn" class="btn btn-ghost">Anterior</button>

            <div class="nav-right">
              <button type="button" id="nextBtn" class="btn btn-primary">Siguiente</button>
              <button type="submit" id="submitBtn" class="btn btn-primary is-hidden">Siguiente</button>
            </div>
          </div>
        </form>
      </main>
    </section>
  `;

	const questions = [
		{
			id: 'tipo_dia',
			text: '¿Qué tipo de día estás teniendo hoy?',
			options: ['Energético', 'Relajado', 'Necesito motivación'],
		},
		{
			id: 'tipo_experiencia',
			text: '¿Qué tipo de experiencia buscas?',
			options: ['Refrescante', 'Reconfortante', 'Energizante'],
		},
		{
			id: 'intensidad_cafe',
			text: '¿Cómo te gusta la intensidad del café?',
			options: ['Suave', 'Medio', 'Fuerte', 'No me gusta el café'],
		},
		{
			id: 'tipo_leche',
			text: '¿Qué tipo de leche prefieres?',
			options: ['Entera', 'Descremada', 'Almendra', 'Soya', 'Sin leche'],
		},
		{
			id: 'temperatura_bebida',
			text: '¿Te gustaría una bebida caliente o fría?',
			options: ['Caliente', 'Fría (con hielo)', 'Frape'],
		},
		{
			id: 'nivel_dulzor',
			text: '¿Qué nivel de dulzor prefieres en tu bebida?',
			options: ['Sin azúcar', 'Poco dulce', 'Dulce', 'Muy dulce'],
		},
		{
			id: 'sabor_adicional',
			text: '¿Te gustaría añadir algún sabor adicional?',
			options: ['Vainilla', 'Caramelo', 'Chocolate', 'No, gracias'],
		},
		{ id: 'crema', text: '¿Prefieres una bebida con crema o sin crema?', options: ['Con crema batida', 'Sin crema'] },
		{ id: 'tamano_bebida', text: '¿Qué tan grande prefieres tu bebida?', options: ['Pequeña', 'Mediana', 'Grande'] },
		{ id: 'baja_calorias', text: '¿Te interesa una opción baja en calorías?', options: ['Sí', 'No'] },
		{
			id: 'restriccion_alimentaria',
			text: '¿Tienes alguna restricción alimentaria?',
			options: ['Vegano', 'Sin lactosa', 'Sin gluten', 'Ninguna'],
		},
	];

	let currentStep = 0;
	const answers = {};

	const $progress = document.getElementById('progressText');
	const $title = document.getElementById('questionTitle');
	const $list = document.getElementById('questionsContainer');
	const $prev = document.getElementById('prevBtn');
	const $next = document.getElementById('nextBtn');
	const $submit = document.getElementById('submitBtn');
	const $form = document.getElementById('formQuestions');
	const $content = document.querySelector('.form-content');

	function setHidden(el, hidden) {
		if (!el) return;
		if (hidden) el.classList.add('is-hidden');
		else el.classList.remove('is-hidden');
	}

	function updateProgress() {
		$progress.textContent = `Pregunta ${currentStep + 1} de ${questions.length}`;
	}

	function renderOptions(q) {
		const saved = answers[q.id];
		$list.innerHTML = q.options
			.map((opt, i) => {
				const id = `${q.id}-${i}`;
				const checked = saved === opt ? 'checked' : '';
				return `
        <label class="option ${checked ? 'is-selected' : ''}" for="${id}">
          <input class="option__input" type="radio" id="${id}" name="answer" value="${opt}" ${checked} required />
          <span class="option__icon" aria-hidden="true"></span>
          <span class="option__label">${opt}</span>
        </label>
      `;
			})
			.join('');
	}

	function renderQuestion(step, withAnim = true) {
		const q = questions[step];
		updateProgress();
		$title.textContent = q.text;
		renderOptions(q);

		if (withAnim) {
			$title.classList.remove('fadein');
			$list.classList.remove('fadein');
			void $title.offsetWidth;
			$title.classList.add('fadein');
			$list.classList.add('fadein');
		}

		// Footer estable: mismo espacio siempre
		setHidden($prev, step === 0); // Oculta/enseña sin colapsar
		setHidden($next, step === questions.length - 1);
		setHidden($submit, step !== questions.length - 1);

		// Control habilitado
		const anyChecked = $form.querySelector('input[name="answer"]:checked');
		const actionBtn = step === questions.length - 1 ? $submit : $next;
		actionBtn.disabled = !anyChecked;

		// Llevar scroll del contenido al tope en cada cambio de pregunta
		$content?.scrollTo({ top: 0, behavior: 'instant' });
	}

	function saveAnswer(step) {
		const selected = $form.querySelector('input[name="answer"]:checked');
		if (selected) answers[questions[step].id] = selected.value;
	}

	$form.addEventListener('change', (e) => {
		if (e.target && e.target.matches('input[name="answer"]')) {
			$form.querySelectorAll('.option').forEach(($o) => $o.classList.remove('is-selected'));
			e.target.closest('.option')?.classList.add('is-selected');
			const actionBtn = currentStep === questions.length - 1 ? $submit : $next;
			actionBtn.disabled = false;
		}
	});

	$prev.addEventListener('click', () => {
		saveAnswer(currentStep);
		currentStep = Math.max(0, currentStep - 1);
		renderQuestion(currentStep);
	});

	$next.addEventListener('click', () => {
		saveAnswer(currentStep);
		currentStep = Math.min(questions.length - 1, currentStep + 1);
		renderQuestion(currentStep);
	});

	$form.addEventListener('submit', (e) => {
		e.preventDefault();
		saveAnswer(currentStep);
		socket.emit('enviarFormulario', answers);
		window.location.hash = '/recommendation';
	});

	renderQuestion(currentStep, false);
}
