require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Modelos
const Sede = require('../models/Sede');
const Horario = require('../models/Horario');
const Ciudadano = require('../models/Ciudadano');
const Comparendo = require('../models/Comparendo');
const ActivityLog = require('../models/ActivityLog');
const Admin = require('../models/Admin');
const Cita = require('../models/Cita');
const CursoProgreso = require('../models/CursoProgreso');

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const seedDB = async () => {
  try {
    console.log('Conectando a MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conexión exitosa. Limpiando colecciones base...');

    // Wipe todo
    await Promise.all([
      Sede.deleteMany(), Horario.deleteMany(), Ciudadano.deleteMany(),
      Comparendo.deleteMany(), ActivityLog.deleteMany(), Admin.deleteMany(),
      Cita.deleteMany(), CursoProgreso.deleteMany()
    ]);

    console.log('🌱 Insertando nuevos datos masivos...');

    // 1. SEDES (5 reales de Cali)
    const sedesData = [
      { nombre: 'Salomia', direccion: 'Cra 3 # 56-90', activa: true },
      { nombre: 'Aventura Plaza', direccion: 'Cra 100 # 15A-61', activa: true },
      { nombre: 'Sameco', direccion: 'Calle 70 Norte # 3N-02', activa: true },
      { nombre: 'Chipichape', direccion: 'Calle 38 Norte # 6N-35', activa: true },
      { nombre: 'Valle del Lili', direccion: 'Cra 98 # 18-49', activa: true }
    ];
    const sedes = await Sede.insertMany(sedesData);

    // 2. ADMINS (6 Admins)
    const adminPass = await bcrypt.hash('Admin123*', 10);
    const admins = [
      { username: 'superadmin', password_hash: adminPass, nombre: 'Super Administrador', email: 'superadmin@secretaria.gov.co', rol: 'super_admin', activo: true }
    ];
    sedes.forEach((sede, i) => {
      admins.push({
        username: `admin_${sede.nombre.toLowerCase().split(' ')[0]}`,
        password_hash: adminPass,
        nombre: `Admin ${sede.nombre}`,
        email: `admin${i}@secretaria.gov.co`,
        rol: 'admin_sede',
        sede_id: sede._id,
        activo: true
      });
    });
    await Admin.insertMany(admins);

    // 3. CIUDADANOS (20)
    const nombres = ['Andres', 'Maria', 'Carlos', 'Lucia', 'Jorge', 'Diana', 'Roberto', 'Marta', 'Sebastian', 'Laura', 'Luis', 'Sofia', 'Pedro', 'Camila', 'Diego', 'Ana', 'Julian', 'Paula', 'Felipe', 'Valentina'];
    const apellidos = ['Gomez', 'Perez', 'Rodriguez', 'Martinez', 'Garcia', 'Lopez', 'Hernandez', 'Gonzalez', 'Ramirez', 'Sanchez', 'Dias', 'Torres', 'Flores', 'Ruiz', 'Alvarez', 'Castro', 'Vargas', 'Rios', 'Rojas', 'Ospina'];
    const ciudadanosArray = [];
    const passwordHash = await bcrypt.hash('password123', 10);
    
    for (let i = 0; i < 20; i++) {
        ciudadanosArray.push({
            cedula: `111222${String(i).padStart(3, '0')}`,
            nombre: nombres[i],
            apellido: apellidos[i],
            telefono: `3${getRandomInt(10, 20)}0000000`,
            email: `${nombres[i].toLowerCase()}@example.com`,
            password_hash: passwordHash,
            role: 'citizen'
        });
    }
    const ciudadanos = await Ciudadano.insertMany(ciudadanosArray);

    // 4. COMPARENDOS (30)
    const infracciones = ['C02 - Estacionar en sitio prohibido', 'D02 - Conducir sin SOAT', 'C14 - Transitar por sitios restringidos', 'E03 - Embriaguez', 'C29 - Exceso de velocidad'];
    const comparendosArray = [];
    for (let i = 0; i < 30; i++) {
        comparendosArray.push({
            numero_comparendo: `CNT-2026-${String(i).padStart(4, '0')}`,
            ciudadano_id: getRandomElement(ciudadanos)._id,
            fecha_imposicion: new Date(Date.now() - getRandomInt(1, 60) * 86400000), // últimos 60 días
            tipo_infraccion: getRandomElement(infracciones),
            requiere_curso: Math.random() > 0.3, // 70% requiere curso
            estado: getRandomElement(['pendiente', 'curso_agendado', 'curso_completado'])
        });
    }
    const comparendos = await Comparendo.insertMany(comparendosArray);

    // 5. HORARIOS (15) para los proximos 30 días compartidos entre sedes
    const horariosArray = [];
    for (let i = 0; i < 15; i++) {
        const d = new Date();
        d.setDate(d.getDate() + getRandomInt(0, 30));
        horariosArray.push({
            sede_id: getRandomElement(sedes)._id,
            fecha: d,
            hora_inicio: getRandomElement(['08:00', '10:00', '14:00', '16:00']),
            hora_fin: '00:00', // Mocked if not needed
            capacidad_maxima: 30,
            cupos_disponibles: getRandomInt(0, 30),
            activo: true
        });
    }
    const horarios = await Horario.insertMany(horariosArray);

    // 6. CITAS (25)
    // Debemos asegurar que estén asociadas a la misma sede del horario
    const citasArray = [];
    for (let i = 0; i < 25; i++) {
        const h = getRandomElement(horarios);
        const c = getRandomElement(comparendos); // Asociada a un comparendo si existe
        citasArray.push({
            ciudadano_id: c.ciudadano_id,
            sede_id: h.sede_id,
            horario_id: h._id,
            canal: Math.random() > 0.5 ? 'chatbot' : 'web',
            estado: getRandomElement(['confirmada', 'confirmada', 'completada', 'cancelada', 'no_asistio']), // mayor chance confirmada
            comparendo_id: c._id // vinculando
        });
    }
    const citas = await Cita.insertMany(citasArray);

    // 7. CURSO PROGRESO (15)
    const cursosProgreso = [];
    for (let i = 0; i < 15; i++) {
        const comparendo = getRandomElement(comparendos);
        cursosProgreso.push({
            ciudadano_id: comparendo.ciudadano_id,
            comparendo_id: comparendo._id,
            modulo_actual: 'modulo_' + getRandomInt(1, 5),
            modulos_completados: [1], 
            trampas_detectadas: Math.random() > 0.8 ? 1 : 0,
            estado: getRandomElement(['en_progreso', 'completado']),
            fecha_inicio: new Date(),
        });
    }
    await CursoProgreso.insertMany(cursosProgreso);

    // 8. ACTIVITY LOGS (20)
    const logsArray = [];
    for (let i = 0; i < 20; i++) {
        logsArray.push({
            tipo_evento: getRandomElement(['login_admin', 'login_ciudadano', 'cita_agendada', 'curso_completado', 'error_sistema']),
            canal: getRandomElement(['sistema', 'admin', 'chatbot', 'web']),
            descripcion: 'Evento pre-generado por el Seed del sistema central de Movilidad. Acción detectada correctamente en el entorno de pruebas.',
            createdAt: new Date(Date.now() - getRandomInt(0, 1000000000))
        });
    }
    await ActivityLog.insertMany(logsArray);

    console.log('✅ Base de datos Atlas poblada masivamente.');
    console.log('---------------------------------------------');
    console.log('Nuevos Administradores Generados:');
    console.log('Super Admin -> superadmin | Admin123*');
    console.log('Admins Sedes -> admin_salomia, admin_aventura, etc. | Admin123*');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error en Seed Masivo:', err);
    process.exit(1);
  }
};

seedDB();
