const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./src/config/database');
const mongoose = require('mongoose');

const authRoutes        = require('./src/routes/auth.routes');
const comparendosRoutes = require('./src/routes/comparendos.routes');
const citasRoutes       = require('./src/routes/citas.routes');
const horariosRoutes    = require('./src/routes/horarios.routes');
const sedesRoutes       = require('./src/routes/sedes.routes');
const logsRoutes        = require('./src/routes/logs.routes');
const adminRoutes       = require('./src/routes/admin.routes');
const cursoRoutes       = require('./src/routes/curso.routes');
const chatbotRoutes     = require('./src/routes/chatbot.routes');
const pqrRoutes         = require('./src/routes/pqr.routes');
const multasRoutes      = require('./src/routes/multas.routes');

const app = express();

// ── Ensure DB connection on every request ──────────────────────────────────────
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// ── CORS ───────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/comparendos', comparendosRoutes);
app.use('/api/citas',       citasRoutes);
app.use('/api/horarios',    horariosRoutes);
app.use('/api/sedes',       sedesRoutes);
app.use('/api/logs',        logsRoutes);
app.use('/api/admin',       adminRoutes);
app.use('/api/curso',       cursoRoutes);
app.use('/api/chatbot',     chatbotRoutes);
app.use('/api/pqr',         pqrRoutes);
app.use('/api/multas',      multasRoutes);

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/', async (req, res) => {
  await connectDB();
  res.json({
    message: 'API Secretaría de Movilidad de Cali — v2.0',
    status: 'running',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// ── 404 handler ────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: `Ruta no encontrada: ${req.method} ${req.path}` });
});

// ── Global Error Handler ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.path}:`, err.message);
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Error interno del servidor.',
    ...(isDev && { stack: err.stack })
  });
});

// ── Uncaught Exception Safety Net ─────────────────────────────────────────────
process.on('unhandledRejection', (reason) => {
  console.error('⚠️  Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err.message);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📡 Entorno: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;