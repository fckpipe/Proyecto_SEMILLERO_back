const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Ciudadano, Admin, ActivityLog, Comparendo, Sede, Cita } = require('../models');

exports.registerCiudadano = async (req, res) => {
  try {
    const { cedula, nombre, apellido, telefono, email, password } = req.body;
    
    // Validar cédula duplicada
    const existingCedula = await Ciudadano.findOne({ cedula });
    if (existingCedula) {
      return res.status(400).json({ success: false, message: 'La cédula ya se encuentra registrada.' });
    }

    // Validar email duplicado
    if (email) {
      const existingEmail = await Ciudadano.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'El email ya está registrado.' });
      }
    }

    const password_hash = await bcrypt.hash(password, 10);
    const ciudadano = await Ciudadano.create({ 
      cedula, nombre, apellido, telefono, email, password_hash
    });

    await ActivityLog.create({
      tipo_evento: 'registro_ciudadano',
      canal: 'sistema',
      descripcion: `Ciudadano con cédula ${cedula} se registró en el sistema.`,
      metadata: { ciudadano_id: ciudadano._id }
    });

    res.status(201).json({ 
      success: true, 
      message: 'Registro exitoso' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
};

// ENDPOINT UNIFICADO: POST /api/auth/login
// Acepta { identifier (o identificador), password }
// Busca primero en ciudadanos (por cédula o email), luego en admins (por username)
exports.loginUnificado = async (req, res) => {
  try {
    const identifier = req.body.identifier || req.body.identificador || req.body.username || req.body.cedula || req.body.email;
    const password = req.body.password || req.body.contrasena;
    
    console.log(`\n[DEBUG Login] Intentando login para: "${identifier}"`);

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Identificador y contraseña son requeridos.' });
    }

    // 1. Buscar en ciudadanos (por cédula o email)
    const ciudadano = await Ciudadano.findOne({ 
      $or: [{ cedula: identifier }, { email: identifier }] 
    });

    if (ciudadano) {
      console.log(`[DEBUG Login] Ciudadano encontrado: ${ciudadano.cedula}`);
      const isMatch = await bcrypt.compare(password, ciudadano.password_hash);
      
      if (!isMatch) {
        console.log(`[DEBUG Login] Password NO coincide para ciudadano ${ciudadano.cedula}`);
        return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos.' });
      }

      const token = jwt.sign(
        { id: ciudadano._id, role: 'ciudadano', cedula: ciudadano.cedula, nombre: ciudadano.nombre }, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      console.log(`[DEBUG Login] Login exitoso Ciudadano: ${ciudadano.cedula}`);

      await ActivityLog.create({
        tipo_evento: 'login_ciudadano',
        canal: 'sistema',
        descripcion: `El ciudadano ${ciudadano.cedula} inició sesión.`,
        metadata: { ciudadano_id: ciudadano._id }
      });

      return res.json({ 
        success: true, 
        data: { 
          token, 
          usuario: { 
            id: ciudadano._id,
            nombre: ciudadano.nombre, 
            apellido: ciudadano.apellido,
            email: ciudadano.email,
            cedula: ciudadano.cedula,
            rol: 'ciudadano',
            sede_id: null
          } 
        } 
      });
    }

    // 2. Buscar en admins (por username)
    const admin = await Admin.findOne({ username: identifier }).populate('sede_id');
    if (admin) {
      console.log(`[DEBUG Login] Admin encontrado: ${admin.username} (Rol: ${admin.rol})`);
      
      if (!admin.activo) {
        console.log(`[DEBUG Login] Admin ${admin.username} está desactivado.`);
        return res.status(403).json({ success: false, message: 'Cuenta de administrador desactivada.' });
      }

      const isMatch = await bcrypt.compare(password, admin.password_hash);
      if (!isMatch) {
        console.log(`[DEBUG Login] Password NO coincide para admin ${admin.username}`);
        return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos.' });
      }

      const token = jwt.sign(
        { id: admin._id, role: admin.rol, sede_id: admin.sede_id?._id, username: admin.username, nombre: admin.nombre }, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      console.log(`[DEBUG Login] Login exitoso Admin: ${admin.username}`);

      await ActivityLog.create({
        tipo_evento: 'login_admin',
        canal: 'admin',
        descripcion: `El administrador ${admin.username} (${admin.rol}) inició sesión.`,
        metadata: { admin_id: admin._id }
      });

      return res.json({ 
        success: true, 
        data: { 
          token, 
          usuario: { 
            id: admin._id,
            nombre: admin.nombre, 
            email: admin.email,
            username: admin.username,
            rol: admin.rol,
            sede_id: admin.sede_id?._id || null,
            sede: admin.sede_id ? { id: admin.sede_id._id, nombre: admin.sede_id.nombre } : null
          } 
        } 
      });
    }

    console.log(`[DEBUG Login] No se encontró usuario/admin con identificador: "${identifier}"`);
    return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos.' });

  } catch (error) {
    console.error('[EROR Login]', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
};

// ENDPOINT DE DIAGNÓSTICO (TEMPORAL)
exports.debugDatabase = async (req, res) => {
  try {
    const counts = {
      admins: await Admin.countDocuments(),
      ciudadanos: await Ciudadano.countDocuments(),
      sedes: await Sede.countDocuments(),
      comparendos: await Comparendo.countDocuments(),
      citas: await Cita.countDocuments()
    };
    
    const admins = await Admin.find({}, '-password_hash').populate('sede_id', 'nombre');
    const dbStatus = mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado';

    res.json({
      success: true,
      dbStatus,
      counts,
      admins
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── GET /api/auth/perfil ─────────────────────────────────────────────────────
exports.getPerfil = async (req, res) => {
  try {
    const ciudadanoId = req.user.id;

    // 1. Datos base del ciudadano
    const ciudadano = await Ciudadano.findById(ciudadanoId, '-password_hash');
    if (!ciudadano) return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });

    // 2. Comparendos Locales (MongoDB)
    const comparendosLocales = await Comparendo.find({ ciudadano_id: ciudadanoId })
      .sort({ fecha_imposicion: -1 });

    // ── INTEGRACIÓN SIMIT (3-CAPAS) ──
    const simitService = require('../services/simit.service');
    let simitResultDocumento = { comparendos: [] };
    let simitResultPlaca = { comparendos: [] };

    try {
      // Consulta por documento
      simitResultDocumento = await simitService.consultarPorCedula(ciudadano.cedula);
      
      // Consulta por placa (si tiene vinculada)
      if (ciudadano.placa_vehiculo) {
        simitResultPlaca = await simitService.consultarPorPlaca(ciudadano.placa_vehiculo);
      }
    } catch (sErr) {
      console.error('[getPerfil] SIMIT integration error:', sErr.message);
    }

    // Merge de multas (evitando duplicados por número de comparendo)
    const comparendosMap = new Map();

    // Prioridad 1: Locales (tienen el estado de nuestro curso)
    comparendosLocales.forEach(c => {
      comparendosMap.set(c.numero_comparendo, {
        id: c._id,
        numero: c.numero_comparendo,
        fecha: c.fecha_imposicion,
        tipo_infraccion: c.tipo_infraccion,
        valor_original: c.valor || 520000,
        estado: c.estado,
        requiere_curso: c.requiere_curso,
        fuente: 'local'
      });
    });

    // Prioridad 2: SIMIT Documento
    if (simitResultDocumento.encontrado) {
      simitResultDocumento.comparendos.forEach(c => {
        if (!comparendosMap.has(c.numero)) {
          comparendosMap.set(c.numero, {
            numero: c.numero,
            fecha: c.fecha,
            tipo_infraccion: `${c.codigo} - ${c.descripcion}`,
            valor_original: c.valor_original,
            estado: 'pendiente_simit',
            fuente: 'simit_id',
            organismo: c.organismo
          });
        }
      });
    }

    // Prioridad 3: SIMIT Placa
    if (simitResultPlaca.encontrado) {
      simitResultPlaca.comparendos.forEach(c => {
        if (!comparendosMap.has(c.numero)) {
          comparendosMap.set(c.numero, {
            numero: c.numero,
            fecha: c.fecha,
            tipo_infraccion: `${c.codigo} - ${c.descripcion}`,
            valor_original: c.valor_original,
            estado: 'pendiente_simit',
            fuente: 'simit_placa',
            organismo: c.organismo
          });
        }
      });
    }

    const allComparendos = Array.from(comparendosMap.values());

    // 3. Progreso del curso (el más reciente)
    const CursoProgreso = require('../models/CursoProgreso');
    const progreso = await CursoProgreso.findOne({ ciudadano_id: ciudadanoId })
      .sort({ updatedAt: -1 });

    // 4. Calcular estadísticas
    const pendientes = comparendos.filter(c => c.estado === 'pendiente').length;
    const modulosCompletados = progreso?.modulos_completados?.length || 0;
    const aprobado = progreso?.estado === 'completado';

    // Certificados: comparendos con descuento aplicado (estado curso_completado)
    const certificados = comparendos
      .filter(c => c.estado === 'curso_completado')
      .map(c => ({
        tipo: 'Descuento 50% — Curso Pedagógico Virtual',
        fecha: progreso?.fecha_completado || c.updatedAt,
        codigo: `CERT-${c.numero_comparendo}-${new Date(c.updatedAt).getFullYear()}`,
        comparendo: c.numero_comparendo
      }));

    res.json({
      success: true,
      data: {
        ciudadano: {
          id: ciudadano._id,
          cedula: ciudadano.cedula,
          nombre: ciudadano.nombre,
          apellido: ciudadano.apellido,
          email: ciudadano.email,
          telefono: ciudadano.telefono,
          placa_vehiculo: ciudadano.placa_vehiculo,
          createdAt: ciudadano.createdAt
        },
        estadisticas: {
          comparendos_pendientes: allComparendos.filter(c => c.estado === 'pendiente' || c.estado === 'pendiente_simit').length,
          modulos_completados: modulosCompletados,
          total_modulos: 5,
          certificados_obtenidos: certificados.length,
          estado_curso: progreso?.estado || 'no_iniciado'
        },
        comparendos: allComparendos.map(c => ({
          ...c,
          valor_descuento: Math.round((c.valor_original || 520000) * 0.5)
        })),
        progreso: progreso ? {
          estado: progreso.estado,
          modulos_completados: progreso.modulos_completados || [],
          porcentaje: Math.round((progreso.modulos_completados?.length || 0) / 5 * 100),
          trampas: progreso.trampas_detectadas || 0,
          fecha_inicio: progreso.fecha_inicio,
          fecha_completado: progreso.fecha_completado,
          bloqueado: progreso.bloqueado || false
        } : null,
        certificados
      }
    });
  } catch (error) {
    console.error('[getPerfil]', error);
    res.status(500).json({ success: false, message: 'Error al obtener el perfil.' });
  }
};

// ─── PUT /api/auth/perfil ─────────────────────────────────────────────────────
exports.updatePerfil = async (req, res) => {
  try {
    const ciudadanoId = req.user.id;
    const { nombre, apellido, email, telefono, placa_vehiculo, password_actual, password_nueva } = req.body;

    const ciudadano = await Ciudadano.findById(ciudadanoId);
    if (!ciudadano) return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });

    // Validar email único si cambió
    if (email && email !== ciudadano.email) {
      const existing = await Ciudadano.findOne({ email, _id: { $ne: ciudadanoId } });
      if (existing) return res.status(400).json({ success: false, message: 'Ese email ya está en uso por otro usuario.' });
    }

    // Actualizar campos básicos
    if (nombre)    ciudadano.nombre    = nombre.trim();
    if (apellido)  ciudadano.apellido  = apellido.trim();
    if (email)     ciudadano.email     = email.trim().toLowerCase();
    if (telefono)  ciudadano.telefono  = telefono.trim();
    
    if (placa_vehiculo !== undefined) {
      const p = placa_vehiculo.toUpperCase().trim();
      if (p && !/^[A-Z]{3}\d{3}$|^[A-Z]{3}\d{2}[A-Z]$/.test(p)) {
        return res.status(400).json({ success: false, message: 'Formato de placa inválido (ej: ABC123 o ABC12D).' });
      }
      ciudadano.placa_vehiculo = p || null;
    }

    // Cambio de contraseña (opcional)
    if (password_nueva) {
      if (!password_actual) {
        return res.status(400).json({ success: false, message: 'Debes ingresar tu contraseña actual para cambiarla.' });
      }
      const match = await bcrypt.compare(password_actual, ciudadano.password_hash);
      if (!match) {
        return res.status(400).json({ success: false, message: 'La contraseña actual es incorrecta.' });
      }
      if (password_nueva.length < 8) {
        return res.status(400).json({ success: false, message: 'La nueva contraseña debe tener al menos 8 caracteres.' });
      }
      ciudadano.password_hash = await bcrypt.hash(password_nueva, 10);
    }

    await ciudadano.save();

    // Emitir nuevo token con datos actualizados
    const token = jwt.sign(
      { id: ciudadano._id, role: 'ciudadano', cedula: ciudadano.cedula, nombre: ciudadano.nombre },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    await ActivityLog.create({
      tipo_evento: 'perfil_actualizado',
      canal: 'sistema',
      descripcion: `Ciudadano ${ciudadano.cedula} actualizó su perfil.`,
      metadata: { ciudadano_id: ciudadano._id }
    }).catch(() => {});

    res.json({
      success: true,
      message: '¡Perfil actualizado exitosamente!',
      data: {
        token,
        usuario: {
          id: ciudadano._id,
          nombre: ciudadano.nombre,
          apellido: ciudadano.apellido,
          email: ciudadano.email,
          cedula: ciudadano.cedula,
          telefono: ciudadano.telefono,
          placa_vehiculo: ciudadano.placa_vehiculo,
          rol: 'ciudadano'
        }
      }
    });
  } catch (error) {
    console.error('[updatePerfil]', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el perfil.' });
  }
};

// Mantener endpoints legacy por compatibilidad
exports.loginCiudadano = async (req, res) => {
  const { cedula, password } = req.body;
  req.body.identifier = cedula;
  return exports.loginUnificado(req, res);
};

exports.loginAdmin = async (req, res) => {
  const { username, password } = req.body; 
  req.body.identifier = username;
  return exports.loginUnificado(req, res);
};
