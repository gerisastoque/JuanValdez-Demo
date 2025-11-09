// server/controllers/openaiController.js
import axios from 'axios';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

if (!OPENAI_API_KEY) {
	throw new Error('Falta OPENAI_API_KEY en .env');
}

export async function generarPromptDeCafe(respuestas) {
	return `
Eres un asistente virtual especializado en bebidas personalizadas de Juan Valdez Café.
Tu tarea es recomendar la bebida ideal basada en las preferencias del usuario,
seleccionando de las opciones del menú de Juan Valdez. Devuelve SOLO JSON con este esquema:
{
  "img": "https://... (url de imagen)",
  "Mensaje personalizado": "¡Tu bebida ideal es {nombre} Juan Valdez!",
  "Descripción de la bebida": "{Descripción (40-60 palabras)}",
  "Tamaño": "{Pequeña|Mediana|Grande}"
}

### Información del usuario:
- Tipo de día: ${respuestas.tipo_dia}
- Tipo de experiencia: ${respuestas.tipo_experiencia}
- Intensidad del café: ${respuestas.intensidad_cafe}
- Tipo de leche: ${respuestas.tipo_leche}
- Temperatura de la bebida: ${respuestas.temperatura_bebida}
- Nivel de dulzor: ${respuestas.nivel_dulzor}
- Sabor adicional: ${respuestas.sabor_adicional}
- Con crema: ${respuestas.crema}
- Tamaño de la bebida: ${respuestas.tamano_bebida}
- Baja en calorías: ${respuestas.baja_calorias}
- Restricción alimentaria: ${respuestas.restriccion_alimentaria}

### Menú (con imágenes):
Malteadas:
- Malteada de Chocolate — img: https://images.getduna.com/9a8b0c9a-2062-4829-9500-4bda799b66ff/45e316ce53f3d4a4_domicilio_58996_1240x1240_1707512366_1707577172.png?d=600x600&format=webp
- Malteada Red Velvet — img: https://images.getduna.com/9a8b0c9a-2062-4829-9500-4bda799b66ff/45e316ce53f3d4a4_domicilio_58994_1240x1240_1707512281_1707579272.png?d=600x600&format=webp
- Malteada de Oreo — (agrega url si la tienes)

Nevados:
- Nevado Smores — img: https://images.getduna.com/9a8b0c9a-2062-4829-9500-4bda799b66ff/45e316ce53f3d4a4_domicilio_46367_744x744_1701100952.png?d=600x600&format=webp
- Nevado Chai — img: https://images.getduna.com/9a8b0c9a-2062-4829-9500-4bda799b66ff/45e316ce53f3d4a4_domicilio_33156_744x744_1701101102.jpeg?d=600x600&format=webp
- Nevado de Café — img: https://images.getduna.com/9a8b0c9a-2062-4829-9500-4bda799b66ff/45e316ce53f3d4a4_domicilio_33113_744x744_1701102363.jpeg?d=600x600&format=webp
- Nevado Mocachip — img: https://tofuu.getjusto.com/orioneat-local/resized2/gJcwPCbbEzDZ7waGA-800-x.webp
- Nevado Brownie — img: https://tofuu.getjusto.com/orioneat-local/resized2/rndBDbSjRFteRQrP3-800-x.webp

Bebidas Calientes:
- Té Chai Caliente — img: https://images.getduna.com/9a8b0c9a-2062-4829-9500-4bda799b66ff/45e316ce53f3d4a4_domicilio_35672_744x744_1701100862.jpeg?d=600x600&format=webp
- Mocca — img: https://images.getduna.com/9a8b0c9a-2062-4829-9500-4bda799b66ff/45e316ce53f3d4a4_domicilio_35449_744x744_1701100862.jpeg?d=600x600&format=webp
- Latte — img: https://images.getduna.com/9a8b0c9a-2062-4829-9500-4bda799b66ff/45e316ce53f3d4a4_domicilio_35666_744x744_1701101492.jpeg?d=600x600&format=webp
- Chocolate Caliente — img: https://images.getduna.com/9a8b0c9a-2062-4829-9500-4bda799b66ff/45e316ce53f3d4a4_domicilio_35670_744x744_1701101132.jpeg?d=600x600&format=webp
- Americano — img: https://images.getduna.com/9a8b0c9a-2062-4829-9500-4bda799b66ff/45e316ce53f3d4a4_domicilio_33104_744x744_1701100472.jpeg?d=600x600&format=webp

Bebidas Frías:
- Matcha Latte Frío — img: https://images.getduna.com/9a8b0c9a-2062-4829-9500-4bda799b66ff/45e316ce53f3d4a4_domicilio_33154_744x744_1701101462.jpeg?d=600x600&format=webp
- Cold Brew Original — img: https://tofuu.getjusto.com/orioneat-local/resized2/JNWHFP8PEWLpGn4zK-800-x.webp
- Limonada Coco Café — img: https://images.getduna.com/9a8b0c9a-2062-4829-9500-4bda799b66ff/45e316ce53f3d4a4_domicilio_56056_744x744_1688583685_1701102122.png?d=600x600&format=webp
- Latte Cold Brew Choco Avellana — img: https://images.getduna.com/9a8b0c9a-2062-4829-9500-4bda799b66ff/280a57fbff746e0f_domicilio_57707_745x744_1699637778_1701102482.png?d=600x600&format=webp

Granizados / Frappés / Jugos:
- Fruppe Maracuyá — img: https://images.getduna.com/9a8b0c9a-2062-4829-9500-4bda799b66ff/45e316ce53f3d4a4_domicilio_33150_744x744_1701102363.jpeg?d=600x600&format=webp
- Fruppe Mango — img: https://images.getduna.com/9a8b0c9a-2062-4829-9500-4bda799b66ff/45e316ce53f3d4a4_domicilio_33146_744x744_1701101102.jpeg?d=600x600&format=webp
- Jugo de Naranja — img: https://images.getduna.com/9a8b0c9a-2062-4829-9500-4bda799b66ff/45e316ce53f3d4a4_domicilio_33152_744x744_1701101702.jpeg?d=600x600&format=webp

### Tarea:
Devuelve SOLO JSON válido (sin texto extra ni bloques de \`\`\`).
Usa las URLs provistas. Si falta la URL exacta, usa el placeholder: "https://picsum.photos/seed/{slug}/600/400".
`.trim();
}

// Obtiene la recomendación desde OpenAI y valida el JSON
export async function obtenerRecomendacionDeOpenAI(respuestas) {
	try {
		const prompt = await generarPromptDeCafe(respuestas);

		const response = await axios.post(
			'https://api.openai.com/v1/chat/completions',
			{
				model: OPENAI_MODEL,
				messages: [
					{ role: 'system', content: 'Eres un experto en café. Responde solo JSON válido.' },
					{ role: 'user', content: prompt },
				],
				temperature: 0.6,
				// Si tu cuenta soporta response_format, descomenta:
				// response_format: { type: 'json_object' },
				max_tokens: 600,
			},
			{
				headers: {
					Authorization: `Bearer ${OPENAI_API_KEY}`,
					'Content-Type': 'application/json',
				},
				timeout: 30000,
			}
		);

		const raw = response.data?.choices?.[0]?.message?.content || '';
		// Limpia fences ```json ... ```
		const clean = raw.replace(/```json|```/g, '').trim();

		let parsed;
		try {
			parsed = JSON.parse(clean);
		} catch (e) {
			console.error('JSON parse error:', e.message, 'raw:', raw);
			throw new Error('La respuesta de OpenAI no es JSON válido.');
		}

		const img = parsed.img;
		const mensaje = parsed['Mensaje personalizado'];
		const descripcion = parsed['Descripción de la bebida'];
		const tamano = parsed['Tamaño'];

		if (!img || !mensaje || !descripcion || !tamano) {
			throw new Error('Faltan claves requeridas en la respuesta de OpenAI.');
		}

		return { img, mensaje, descripcion, tamano };
	} catch (error) {
		console.error('Error al consultar OpenAI:', error.response?.data || error.message);
		throw new Error('No se pudo obtener una recomendación.');
	}
}
