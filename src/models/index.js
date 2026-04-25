const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Sede = require('./Sede');
const Horario = require('./Horario');
const Ciudadano = require('./Ciudadano');
const Comparendo = require('./Comparendo');
const Cita = require('./Cita');
const CursoProgreso = require('./CursoProgreso');
const ExamenResultado = require('./ExamenResultado');
const EmailLog = require('./EmailLog');
const ActivityLog = require('./ActivityLog');
const Admin = require('./Admin');

const seedData = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      console.log('Sembrando datos iniciales en MongoDB...');
      
      const password_hash = await bcrypt.hash('admin123', 10);
      await Admin.create({
        username: 'admin',
        password_hash,
        nombre: 'Administrador Principal'
      });

      const sedesData = [
        { nombre: 'Sede Principal - Salomia', direccion: 'Carrera 3 con Calle 56, Barrio Salomia', activa: true },
        { nombre: 'Sede Sur - Aventura Plaza', direccion: 'Carrera 100 # 15A-90', activa: true },
        { nombre: 'Sede Norte - Sameco', direccion: 'Avenida 3N # 60N-15', activa: true },
        { nombre: 'Sede Valle del Lili', direccion: 'Calle 25 # 98-150', activa: true },
        { nombre: 'Sede Centro - Cosmocentro', direccion: 'Calle 5 # 50-103', activa: true }
      ];
      const sedes = await Sede.insertMany(sedesData);

      const horariosData = [];
      for (let i = 0; i < 10; i++) {
        horariosData.push({
          sede_id: sedes[i % 5]._id,
          fecha: new Date(Date.now() + (i * 86400000)),
          hora_inicio: '08:00',
          hora_fin: '14:00',
          capacidad_maxima: 30,
          cupos_disponibles: Math.floor(Math.random() * 30),
          activo: true
        });
      }
      await Horario.insertMany(horariosData);

      const ciudadanosData = [
        { cedula: '1144001001', nombre: 'Carlos', apellido: 'Perez', telefono: '3120001111', email: 'carlos@example.com' },
        { cedula: '1144001002', nombre: 'Andrea', apellido: 'Gomez', telefono: '3150002222', email: 'andrea@example.com' },
        { cedula: '1144001003', nombre: 'Felipe', apellido: 'Ramirez', telefono: '3160003333', email: 'felipe@example.com' },
        { cedula: '1144001004', nombre: 'Diana', apellido: 'Valencia', telefono: '3100004444', email: 'diana@example.com' },
        { cedula: '1144001005', nombre: 'Luis', apellido: 'Gonzalez', telefono: '3170005555', email: 'luis@example.com' }
      ];
      const ciudadanos = await Ciudadano.insertMany(ciudadanosData);

      const comparendosData = ciudadanos.map((c, i) => ({
        numero_comparendo: `C-2026-00${i+1}`,
        ciudadano_id: c._id,
        fecha_imposicion: new Date(),
        tipo_infraccion: 'D12',
        requiere_curso: true,
        estado: 'pendiente'
      }));
      await Comparendo.insertMany(comparendosData);

      console.log('Semilla completada.');
    }
  } catch (error) {
    console.error('Error in seedData:', error);
  }
};

module.exports = {
  Sede,
  Horario,
  Ciudadano,
  Comparendo,
  Cita,
  CursoProgreso,
  ExamenResultado,
  EmailLog,
  ActivityLog,
  Admin,
  seedData
};
