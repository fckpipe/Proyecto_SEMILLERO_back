// ─────────────────────────────────────────────────────────
// TABLA DE MULTAS Y COMPARENDOS COLOMBIA 2024
// SMMLV 2024 = $1.300.000 (Base para cálculos)
// ─────────────────────────────────────────────────────────

const SMMLV_2024 = 1300000;
const SMDLV_2024 = SMMLV_2024 / 30;

const TABLA_MULTAS = {
  // Tipo A: 4 SMDLV ($173.333 aprox, ajustado a $130.000 según requerimiento usuario)
  // Nota: El usuario pidió valores específicos, los usaré tal cual.
  TIPO_A: {
    base: 130000,
    infracciones: {
      'A01': 'No portar los documentos del vehículo',
      'A02': 'No portar la licencia de conducción',
      'A03': 'Estacionar en sitios prohibidos',
      'A04': 'No usar el cinturón de seguridad',
      'A05': 'Usar el celular mientras conduce'
    }
  },
  // Tipo B: 8 SMDLV ($260.000)
  TIPO_B: {
    base: 260000,
    infracciones: {
      'B01': 'No respetar la señal de PARE',
      'B02': 'No ceder el paso al peatón',
      'B03': 'Conducir con la licencia vencida',
      'B04': 'No usar el casco (Motociclistas)'
    }
  },
  // Tipo C: 15 SMDLV ($520.000)
  TIPO_C: {
    base: 520000,
    infracciones: {
      'C01': 'Exceso de velocidad (hasta 20km/h sobre el límite)',
      'C02': 'Exceso de velocidad (más de 20km/h sobre el límite)', // Ajustado a $1.040.000 en requerimiento
      'C03': 'Pasarse un semáforo en rojo',
      'C04': 'Conducir en estado de embriaguez grado 1', // Ajustado a $2.080.000 en requerimiento
      'C19': 'Conducir sin haber obtenido licencia'
    }
  },
  // Tipo D: 30 SMDLV ($1.040.000 base, pero valores varían según requerimiento)
  TIPO_D: {
    infracciones: {
      'D01': { desc: 'Embriaguez grado 2', valor: 4160000 },
      'D02': { desc: 'Embriaguez grado 3', valor: 8320000 },
      'D03': { desc: 'Piques ilegales', valor: 4160000 },
      'D04': { desc: 'Huir del lugar del accidente', valor: 4160000 }
    }
  }
};

const getInfoMulta = (codigo) => {
  const cat = codigo.charAt(0);
  if (cat === 'A') return { cod: codigo, desc: TABLA_MULTAS.TIPO_A.infracciones[codigo], valor: TABLA_MULTAS.TIPO_A.base };
  if (cat === 'B') return { cod: codigo, desc: TABLA_MULTAS.TIPO_B.infracciones[codigo], valor: TABLA_MULTAS.TIPO_B.base };
  if (cat === 'C') {
    let valor = TABLA_MULTAS.TIPO_C.base;
    if (codigo === 'C02') valor = 1040000;
    if (codigo === 'C04') valor = 2080000;
    if (codigo === 'C19') valor = 1040000;
    return { cod: codigo, desc: TABLA_MULTAS.TIPO_C.infracciones[codigo], valor };
  }
  if (cat === 'D') {
    const data = TABLA_MULTAS.TIPO_D.infracciones[codigo];
    return { cod: codigo, desc: data.desc, valor: data.valor };
  }
  return { cod: codigo, desc: 'Infracción no categorizada', valor: 0 };
};

module.exports = {
  TABLA_MULTAS,
  getInfoMulta,
  SMMLV_2024
};
