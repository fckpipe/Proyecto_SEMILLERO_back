const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Acceso denegado. Se requiere Token.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Unificar la propiedad de rol por si viene como 'role' o 'rol'.
    req.user = {
      ...decoded,
      rol: decoded.rol || decoded.role
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Sesión expirada' });
    }
    res.status(401).json({ success: false, message: 'Token inválido o expirado.' });
  }
};

const verificarAdmin = (req, res, next) => {
  verificarToken(req, res, () => {
    if (req.user.rol === 'admin_sede' || req.user.rol === 'super_admin') {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Acceso denegado. Se requiere rol administrativo.' });
    }
  });
};

const verificarSuperAdmin = (req, res, next) => {
  verificarToken(req, res, () => {
    if (req.user.rol === 'super_admin') {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Acceso denegado. Se requiere rol de Super Admin.' });
    }
  });
};

const filtrarPorSede = (req, res, next) => {
  // Solo aplicamos el filtro si es un admin de sede. 
  // El Super Admin ve todo, por lo que no inyectamos sede_id en req.query automáticamente.
  if (req.user.rol === 'admin_sede') {
    req.sedeFilter = { sede_id: req.user.sede_id };
  } else {
    req.sedeFilter = {};
  }
  next();
};

module.exports = {
  verificarToken,
  verificarAdmin,
  verificarSuperAdmin,
  filtrarPorSede
};
