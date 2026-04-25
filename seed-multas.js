require('dotenv').config();
const mongoose = require('mongoose');
const { Ciudadano, Comparendo } = require('./src/models');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('🌱 Conectado para seeding...');

  // Intentamos buscar un ciudadano o creamos uno de prueba
  let c = await Ciudadano.findOne();
  if (!c) {
    c = await Ciudadano.create({
      nombre: 'Usuario de Prueba SIMIT',
      cedula: '123456789',
      email: 'prueba@valle.gov.co',
      password: 'password123'
    });
  }

  // Crear un par de multas reales 2024
  const multas = [
    {
      numero_comparendo: 'CNT-2024-0015',
      ciudadano_id: c._id,
      tipo_infraccion: 'C02', // Exceso velocidad
      valor: 1040000,
      fecha_imposicion: new Date(),
      estado: 'pendiente',
      requiere_curso: true
    },
    {
      numero_comparendo: 'CNT-2024-0082',
      ciudadano_id: c._id,
      tipo_infraccion: 'A03', // Estacionamiento
      valor: 130000,
      fecha_imposicion: new Date(Date.now() - 5*24*60*60*1000),
      estado: 'pendiente',
      requiere_curso: true
    }
  ];

  await Comparendo.deleteMany({ ciudadano_id: c._id });
  await Comparendo.insertMany(multas);

  console.log(`✅ Seed completado para cédula: ${c.cedula}`);
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
