import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import fsp from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import handleSocketEvents from './socket.js';

// ------------------------
// Resolve current dir (ESM)
// ------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------
// Client directories
// ------------------------
const usuarioRoot = path.resolve(__dirname, '../usuario');
const baristaRoot = path.resolve(__dirname, '../barista');
const assetsRoot = path.resolve(__dirname, '../Assets'); // <— NUEVO

// ------------------------
// Helpers
// ------------------------
const contentTypes = {
	'.html': 'text/html; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.js': 'application/javascript; charset=utf-8',
	'.mjs': 'application/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.svg': 'image/svg+xml',
	'.ico': 'image/x-icon',
	'.webp': 'image/webp', // <— útil si usas webp
	'.avif': 'image/avif', // <— por si acaso
	'.map': 'application/octet-stream',
};

function getContentType(filePath) {
	const ext = path.extname(filePath).toLowerCase();
	return contentTypes[ext] || 'application/octet-stream';
}

/** Ensures the resolved path stays inside the root (prevents path traversal). */
function safeJoin(root, requestPath) {
	const rel = requestPath.replace(/^\/+/, '');
	const resolved = path.resolve(root, rel);
	if (!resolved.startsWith(root)) return null;
	return resolved;
}

/** Serves a file (async). */
async function serveFile(filePath, res) {
	try {
		const data = await fsp.readFile(filePath);
		res.writeHead(200, {
			'Content-Type': getContentType(filePath),
			'Cache-Control': 'no-cache',
		});
		res.end(data);
	} catch {
		res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
		res.end('Archivo no encontrado.');
	}
}

/** For SPA routes (no extension), serve index.html */
async function serveSpa(root, reqPath, res) {
	if (!path.extname(reqPath)) {
		return serveFile(path.join(root, 'index.html'), res);
	}
	const safe = safeJoin(root, reqPath);
	if (!safe) {
		res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
		return res.end('Ruta inválida.');
	}
	return serveFile(safe, res);
}

// ------------------------
// HTTP server
// ------------------------
const server = http.createServer(async (req, res) => {
	try {
		const url = req.url || '/';

		// Security headers (light)
		res.setHeader('X-Content-Type-Options', 'nosniff');
		res.setHeader('X-Frame-Options', 'SAMEORIGIN');

		// Root redirect => /usuario
		if (url === '/' || url === '') {
			res.writeHead(302, { Location: '/usuario' });
			return res.end();
		}

		// /usuario (SPA + estáticos bajo /usuario)
		if (url.startsWith('/usuario')) {
			const subpath = url === '/usuario' || url === '/usuario/' ? 'index.html' : url.replace(/^\/usuario\/?/, '');
			return await serveSpa(usuarioRoot, subpath, res);
		}

		// /barista (SPA + estáticos bajo /barista)
		if (url.startsWith('/barista')) {
			const subpath = url === '/barista' || url === '/barista/' ? 'index.html' : url.replace(/^\/barista\/?/, '');
			return await serveSpa(baristaRoot, subpath, res);
		}

		// /Assets (archivos estáticos globales)  <— NUEVO
		if (url.startsWith('/Assets')) {
			const subpath = url.replace(/^\/Assets\/?/, '');
			const safe = safeJoin(assetsRoot, subpath);
			if (!safe) {
				res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
				return res.end('Ruta inválida.');
			}
			return await serveFile(safe, res);
		}

		// 404
		res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
		res.end('Ruta no encontrada.');
	} catch (err) {
		console.error('HTTP error:', err);
		res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
		res.end('Error interno del servidor.');
	}
});

// ------------------------
// Socket.IO
// ------------------------
const io = new Server(server, { cors: { origin: '*' } });
handleSocketEvents(io);

// ------------------------
// Start
// ------------------------
const PORT = process.env.PORT || 3000;
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;

server.listen(PORT, () => {
	console.log(`Servidor escuchando en el puerto ${PORT}`);
	console.log(`Usuario: ${PUBLIC_URL}/usuario`);
	console.log(`Barista: ${PUBLIC_URL}/barista`);
	console.log(`Assets:  ${PUBLIC_URL}/Assets/...`);
});
