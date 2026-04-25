const MODULOS = [
  {
    id: 1,
    titulo: 'Normas Básicas de Tránsito y Velocidades',
    descripcion: 'Fundamentos del Código Nacional de Tránsito (Ley 769 de 2002) y límites de velocidad actualizados (Ley Julián Esteban).',
    tiempoMinimoMinutos: 40,
    contenido: `
      <h2>Introducción al Código Nacional de Tránsito</h2>
      <p>La <strong>Ley 769 de 2002</strong> rige en todo el territorio colombiano para peatones, pasajeros, conductores, motociclistas, ciclistas y vehículos. Su objetivo es garantizar la seguridad vial y el flujo ordenado.</p>
      
      <div class="regla-destacada">
        <h3>Límites de Velocidad (Ley 2251 de 2022)</h3>
        <ul>
          <li><strong>Zonas Urbanas:</strong> El límite genérico es de <mark>50 km/h</mark>.</li>
          <li><strong>Carreteras Nacionales:</strong> Límite genérico de <mark>80 km/h</mark>, pudiendo llegar a 120 km/h solo en vías señalizadas de doble calzada sin cruces peatonales.</li>
          <li><strong>Zonas Escolares y Residenciales:</strong> Límite absoluto de <mark>30 km/h</mark>.</li>
        </ul>
      </div>

      <h3>Normas de Oro para el Conductor</h3>
      <p>Es obligatorio el uso del <strong>cinturón de seguridad</strong> en todas las plazas del vehículo. El uso del <strong>teléfono celular</strong> está prohibido mientras se conduce, permitiéndose solo con sistemas manos libres que no distraigan la visión.</p>
    `,
    puntosClave: [
      { icono: '⚖️', texto: 'La Ley 769 de 2002 es la base de todo el tránsito en Colombia.' },
      { icono: '🚗', texto: 'Velocidad máxima urbana: 50 km/h para vehículos particulares.' },
      { icono: '🛣️', texto: 'Velocidad máxima en carretera: 80 km/h (general) o según señalización.' },
      { icono: '🏫', texto: 'Zonas escolares y residenciales: Máximo 30 km/h.' },
      { icono: '🎗️', texto: 'Uso obligatorio del cinturón de seguridad para todos los ocupantes.' },
      { icono: '📱', texto: 'Prohibición total de sostener el celular mientras se conduce.' },
      { icono: '🚦', texto: 'Prioridad en intersecciones: El vehículo a la derecha tiene la prelación.' },
      { icono: '💡', texto: 'Uso de luces: Obligatorio de 6:00 PM a 6:00 AM y en condiciones de baja visibilidad.' },
      { icono: '📏', texto: 'Distancia de seguridad: Regla de los 3 segundos respecto al vehículo de adelante.' },
      { icono: '🛑', texto: 'Señal de PARE: Detención total obligatoria, no solo disminuir velocidad.' },
      { icono: '🛂', texto: 'Documentos: Licencia física o digital, SOAT y Técnico-Mecánica vigentes.' },
      { icono: '🏍️', texto: 'Motociclistas: Uso de casco certificado y chaleco reflectivo después de las 6 PM.' },
      { icono: '🚲', texto: 'Ciclistas: Prelación sobre vehículos a motor, distancia lateral de 1.5m al adelantar.' },
      { icono: '🚑', texto: 'Vehículos de emergencia: Obligación de ceder el paso desplazándose a la derecha.' },
      { icono: '🚫', texto: 'Maniobras peligrosas: El "zig-zag" y adelantar en curva están estrictamente prohibidos.' }
    ],
    preguntas: [
      { id: 101, tipo: 'vf', texto: '¿El límite de velocidad en zonas escolares en Colombia es de 30 km/h?', opciones: ['Verdadero', 'Falso'], respuestaCorrecta: 'Verdadero' },
      { id: 102, tipo: 'vf', texto: '¿Es permitido usar el celular sosteniéndolo con la mano si se usa el altavoz?', opciones: ['Verdadero', 'Falso'], respuestaCorrecta: 'Falso' },
      { id: 103, tipo: 'vf', texto: '¿El cinturón de seguridad es obligatorio solo para los pasajeros del asiento delantero?', opciones: ['Verdadero', 'Falso'], respuestaCorrecta: 'Falso' },
      { id: 104, tipo: 'vf', texto: '¿En una intersección no señalizada, el vehículo que viene por la derecha tiene la prelación?', opciones: ['Verdadero', 'Falso'], respuestaCorrecta: 'Verdadero' },
      { id: 105, tipo: 'vf', texto: '¿La Ley 769 de 2002 rige solo en Bogotá y Cali?', opciones: ['Verdadero', 'Falso'], respuestaCorrecta: 'Falso' },
      { id: 106, tipo: 'sm', texto: '¿Cuál es la velocidad máxima permitida en zona urbana para un vehículo particular?', opciones: ['30 km/h', '50 km/h', '60 km/h', '80 km/h'], respuestaCorrecta: '50 km/h' },
      { id: 107, tipo: 'sm', texto: '¿Cuál es el límite máximo general en carreteras nacionales según la norma vigente?', opciones: ['60 km/h', '80 km/h', '100 km/h', '120 km/h'], respuestaCorrecta: '80 km/h' },
      { id: 108, tipo: 'sm', texto: '¿A qué hora debe encenderse obligatoriamente el alumbrado del vehículo?', opciones: ['De 7 PM a 5 AM', 'De 6 PM a 6 AM', 'Cuando el conductor quiera', 'Solo si llueve'], respuestaCorrecta: 'De 6 PM a 6 AM' },
      { id: 109, tipo: 'sm', texto: 'La distancia de seguridad recomendada entre vehículos se mide con la regla de:', opciones: ['1 segundo', '3 segundos', '5 segundos', '10 metros'], respuestaCorrecta: '3 segundos' },
      { id: 110, tipo: 'sm', texto: '¿Qué documento NO es obligatorio portar para conducir en Colombia?', opciones: ['Licencia de Conducción', 'SOAT', 'Cédula de Ciudadanía', 'Carnet de afiliación a club deportivo'], respuestaCorrecta: 'Carnet de afiliación a club deportivo' },
      { id: 111, tipo: 'frase', texto: 'La ley que rige el tránsito en Colombia es la Ley ___ de 2002.', opciones: ['715', '769', '100', '115'], respuestaCorrecta: '769' },
      { id: 112, tipo: 'frase', texto: 'El límite de velocidad en zonas residenciales es de ___ km/h.', opciones: ['10', '20', '30', '40'], respuestaCorrecta: '30' },
      { id: 113, tipo: 'frase', texto: 'El sobrepaso de vehículos debe realizarse siempre por el carril ___.', opciones: ['Derecho', 'Izquierdo', 'Central', 'Auxiliar'], respuestaCorrecta: 'Izquierdo' },
      { id: 114, tipo: 'frase', texto: 'Los motociclistas deben usar chaleco reflectivo desde las ___ hasta las 6:00 AM.', opciones: ['17:00', '18:00', '19:00', '20:00'], respuestaCorrecta: '18:00' },
      { id: 115, tipo: 'frase', texto: 'El SOAT es un seguro obligatorio para ___ de tránsito.', opciones: ['Multas', 'Robos', 'Accidentes', 'Mantenimiento'], respuestaCorrecta: 'Accidentes' }
    ]
  },
  {
    id: 2,
    titulo: 'Señales de Tránsito y Demarcación',
    descripcion: 'Clasificación y significado de la señalética vial: Reglamentarias, Preventivas, Informativas y marcas viales.',
    tiempoMinimoMinutos: 40,
    contenido: `
      <h2>El Lenguaje de la Vía</h2>
      <p>Las señales de tránsito son mensajes visuales que indican prohibiciones, advertencias o información útil. Ignorarlas no solo es una infracción, es un riesgo de vida.</p>
      
      <div class="grid-señales">
        <h3>Clasificación por Colores</h3>
        <ul>
          <li><strong>Rojas (Reglamentarias):</strong> Indican limitaciones, prohibiciones o restricciones. Su desacato es sancionable. Ejemplo: Pare, Prohibido Girar.</li>
          <li><strong>Amarillas (Preventivas):</strong> Advierten peligros próximos o cambios en la vía. Ejemplo: Curva peligrosa, Resalto.</li>
          <li><strong>Azules/Verdes (Informativas):</strong> Guían sobre servicios y destinos. Ejemplo: Hospital, Aeropuerto.</li>
          <li><strong>Naranjas (Transitorias):</strong> Modificaciones temporales por obras.</li>
        </ul>
      </div>

      <h3>Demarcación Horizontal</h3>
      <p>Las líneas en el pavimento son fundamentales. La <strong>doble línea continua</strong> prohíbe el adelantamiento en ambos sentidos, mientras que la <strong>línea discontinua</strong> permite maniobras de sobrepaso con precaución.</p>
    `,
    puntosClave: [
      { icono: '🛑', texto: 'Señales Reglamentarias: Fondo blanco, borde rojo, símbolo negro.' },
      { icono: '⚠️', texto: 'Señales Preventivas: Forma de rombo, fondo amarillo, símbolo negro.' },
      { icono: 'ℹ️', texto: 'Señales Informativas: Rectangulares, fondo azul o verde.' },
      { icono: '🚧', texto: 'Señales Transitorias: Color naranja, usadas en zonas de obra.' },
      { icono: '🚥', texto: 'Semáforos: El amarillo indica precaución y obligación de detenerse.' },
      { icono: '🟡', texto: 'Amarillo Intermitente: Significa avanzar con extrema precaución.' },
      { icono: '➖', texto: 'Línea Continua Blanca: Prohíbe el cambio de carril.' },
      { icono: '💠', texto: 'Doble Línea Amarilla: Máxima prohibición de sobrepaso en ambos sentidos.' },
      { icono: '🦓', texto: 'Cebra: Territorio sagrado del peatón, detención absoluta antes de la línea.' },
      { icono: '🚸', texto: 'Señalización Escolar: Prioridad absoluta a los menores en la vía.' },
      { icono: '🚫', texto: 'Señales de Prohibición: Circulares con una banda roja transversal.' },
      { icono: '🔄', texto: 'Giro en U: Solo permitido donde la señal informativa o reglamentaria lo autorice.' },
      { icono: '🅿️', texto: 'No Estacionar: La letra E con una línea roja cruzada.' },
      { icono: '🚳', texto: 'Uso de Carriles: Las flechas blancas indican dirección obligatoria.' },
      { icono: '🏁', texto: 'Final de Restricción: Señal circular blanca con líneas negras diagonales.' }
    ],
    preguntas: [
      { id: 201, tipo: 'vf', texto: '¿Las señales reglamentarias tienen forma de rombo amarillo?', opciones: ['Verdadero', 'Falso'], respuestaCorrecta: 'Falso' },
      { id: 202, tipo: 'vf', texto: '¿La línea continua en el pavimento permite adelantar si no viene nadie?', opciones: ['Verdadero', 'Falso'], respuestaCorrecta: 'Falso' },
      { id: 203, tipo: 'vf', texto: '¿La señal de "PARE" es de tipo preventivo?', opciones: ['Verdadero', 'Falso'], respuestaCorrecta: 'Falso' },
      { id: 204, tipo: 'vf', texto: '¿El semáforo en amarillo indica que debo acelerar para pasar rápido?', opciones: ['Verdadero', 'Falso'], respuestaCorrecta: 'Falso' },
      { id: 205, tipo: 'vf', texto: '¿Las señales informativas suelen ser de fondo azul o verde?', opciones: ['Verdadero', 'Falso'], respuestaCorrecta: 'Verdadero' },
      { id: 206, tipo: 'sm', texto: '¿De qué color son las señales transitorias usadas en zonas de obra?', opciones: ['Amarillo', 'Rojo', 'Naranja', 'Azul'], respuestaCorrecta: 'Naranja' },
      { id: 207, tipo: 'sm', texto: '¿Qué indica una doble línea amarilla continua en el centro de la vía?', opciones: ['Zona de parqueo', 'Prohibición de adelantar en ambos sentidos', 'Vía de un solo sentido', 'Carril exclusivo de motos'], respuestaCorrecta: 'Prohibición de adelantar en ambos sentidos' },
      { id: 208, tipo: 'sm', texto: '¿Cuál es la función principal de las señales preventivas?', opciones: ['Poner multas', 'Guiar a hospitales', 'Advertir peligros próximos', 'Indicar destinos'], respuestaCorrecta: 'Advertir peligros próximos' },
      { id: 209, tipo: 'sm', texto: 'El semáforo en rojo intermitente tiene el mismo significado que:', opciones: ['Un Siga', 'Un Pare', 'Un Ceda el paso', 'Un semáforo dañado'], respuestaCorrecta: 'Un Pare' },
      { id: 210, tipo: 'sm', texto: '¿Qué señal tiene forma octagonal (8 lados)?', opciones: ['Ceda el paso', 'Pare', 'Prohibido parquear', 'Sentido de circulación'], respuestaCorrecta: 'Pare' },
      { id: 211, tipo: 'frase', texto: 'Las señales ___ tienen por objeto advertir al usuario de la vía la existencia de un peligro.', opciones: ['Informativas', 'Preventivas', 'Reglamentarias', 'Transitorias'], respuestaCorrecta: 'Preventivas' },
      { id: 212, tipo: 'frase', texto: 'La señal de ___ el paso tiene forma de triángulo invertido.', opciones: ['Pare', 'Ceda', 'Gire', 'Siga'], respuestaCorrecta: 'Ceda' },
      { id: 213, tipo: 'frase', texto: 'Las marcas viales de color ___ separan carriles de flujo en el mismo sentido.', opciones: ['Amarillo', 'Blanco', 'Rojo', 'Azul'], respuestaCorrecta: 'Blanco' },
      { id: 214, tipo: 'frase', texto: 'La señal reglamentaria R-30 indica la velocidad ___ permitida.', opciones: ['Mínima', 'Promedio', 'Máxima', 'Sugerida'], respuestaCorrecta: 'Máxima' },
      { id: 215, tipo: 'frase', texto: 'La luz ___ del semáforo indica que el conductor debe detenerse sin pisar la línea de pare.', opciones: ['Verde', 'Amarilla', 'Roja', 'Violeta'], respuestaCorrecta: 'Roja' }
    ]
  },
  {
    id: 3,
    titulo: 'Responsabilidad y Convivencia Vial',
    descripcion: 'Derechos y deberes de todos los actores viales. Inteligencia emocional y respeto en la vía pública.',
    tiempoMinimoMinutos: 40,
    contenido: `
      <h2>La Pirámide de la Movilidad</h2>
      <p>En el espacio público, no todos tenemos la misma vulnerabilidad. El <strong>Peatón</strong> es el actor más importante y debe ser protegido por todos los demás.</p>
      
      <h3>Jerarquía de Actores (Prioridad)</h3>
      <ol>
        <li>Peatones (especialmente personas con discapacidad, niños y ancianos).</li>
        <li>Ciclistas y usuarios de micromovilidad.</li>
        <li>Usuarios del transporte público.</li>
        <li>Transporte de carga y servicios.</li>
        <li>Conductores de vehículos particulares (carros y motos).</li>
      </ol>

      <h3>Deberes del Conductor</h3>
      <p>La convivencia requiere empatía. Respetar los 1.5 metros al adelantar un ciclista o no pitar innecesariamente son actos de <strong>civilidad vial</strong>. El manejo de conflictos debe ser pacífico, evitando cualquier tipo de agresión física o verbal.</p>
    `,
    puntosClave: [
      { icono: '🚶', texto: 'El peatón tiene prelación absoluta en intersecciones y cebras.' },
      { icono: '🚴', texto: 'Los ciclistas tienen derecho a ocupar un carril completo a la derecha.' },
      { icono: '↔️', texto: 'Distancia lateral mínima al sobrepasar ciclistas: 1.5 metros.' },
      { icono: '🛴', texto: 'Usuarios de patinetas eléctricas deben seguir normas similares a los ciclistas.' },
      { icono: '🤝', texto: 'Tolerancia: Ante un error ajeno, la respuesta debe ser la calma, no el conflicto.' },
      { icono: '🔇', texto: 'Uso del claxon: Únicamente para prevenir accidentes inminentes.' },
      { icono: '🐕', texto: 'Protección Animal: Evitar atropellos y no abandonar mascotas en las vías.' },
      { icono: '🚦', texto: 'Cortesía: Ceder el paso ayuda a descongestionar el tráfico de forma inteligente.' },
      { icono: '🤰', texto: 'Prelación: Mujeres gestantes y personas con movilidad reducida son prioridad.' },
      { icono: '📵', texto: 'Distracción: Un segundo mirando el celular son 14 metros manejando a ciegas.' },
      { icono: '🧘', texto: 'Inteligencia Emocional: No permitas que el estrés del tráfico afecte tu juicio.' },
      { icono: '🗑️', texto: 'Respeto Ambiental: Prohibido arrojar desperdicios desde el vehículo.' },
      { icono: '🛑', texto: 'Bloqueo de Intersecciones: Nunca entres a un cruce si no tienes espacio para salir.' },
      { icono: '🛡️', texto: 'Manejo Defensivo: Conducir asumiendo que el otro puede cometer un error.' },
      { icono: '🧑‍⚖️', texto: 'Responsabilidad Civil: Responder por los daños materiales causados a terceros.' }
    ],
    preguntas: [
      { id: 301, tipo: 'vf', texto: '¿Los ciclistas deben transitar obligatoriamente por el andén?', opciones: ['Verdadero', 'Falso'], respuestaCorrecta: 'Falso' },
      { id: 302, tipo: 'vf', texto: '¿El peatón es el actor más vulnerable de la seguridad vial?', opciones: ['Verdadero', 'Falso'], respuestaCorrecta: 'Verdadero' },
      { id: 303, tipo: 'vf', texto: '¿Es permitido pitar fuertemente si el conductor de adelante no arranca rápido?', opciones: ['Verdadero', 'Falso'], respuestaCorrecta: 'Falso' },
      { id: 304, tipo: 'vf', texto: '¿Al adelantar a un ciclista se debe dejar una distancia mínima de 1.5 metros?', opciones: ['Verdadero', 'Falso'], respuestaCorrecta: 'Verdadero' },
      { id: 305, tipo: 'vf', texto: '¿Arrojar basura desde el vehículo es sancionable por el Código de Tránsito?', opciones: ['Verdadero', 'Falso'], respuestaCorrecta: 'Verdadero' },
      { id: 306, tipo: 'sm', texto: '¿Quién tiene la mayor prioridad en la pirámide de movilidad?', opciones: ['El bus de transporte público', 'El peatón', 'La moto', 'El carro particular'], respuestaCorrecta: 'El peatón' },
      { id: 307, tipo: 'sm', texto: '¿Cuál debe ser la actitud frente a una provocación o conflicto vial?', opciones: ['Acelerar para ganar', 'Ignorar y mantener la calma', 'Bajarse a discutir', 'Pitar repetidamente'], respuestaCorrecta: 'Ignorar y mantener la calma' },
      { id: 308, tipo: 'sm', texto: '¿Qué derecho tienen los ciclistas en las vías urbanas?', opciones: ['Ir por el centro del carril izquierdo', 'Ocupar un carril completo de la derecha', 'Pasar semáforos en rojo', 'Transitar en contravía'], respuestaCorrecta: 'Ocupar un carril completo de la derecha' },
      { id: 309, tipo: 'sm', texto: 'El uso indebido de la bocina (pito) se considera:', opciones: ['Un derecho del conductor', 'Una falta a la convivencia y norma de tránsito', 'Un lenguaje necesario', 'Algo opcional'], respuestaCorrecta: 'Una falta a la convivencia y norma de tránsito' },
      { id: 310, tipo: 'sm', texto: '¿Qué es el manejo defensivo?', opciones: ['Manejar con agresividad', 'Conducir esperando que los demás no cometan errores', 'Conducir atento a los errores de otros para evitarlos', 'Manejar siempre a alta velocidad'], respuestaCorrecta: 'Conducir atento a los errores de otros para evitarlos' },
      { id: 311, tipo: 'frase', texto: 'La prelación de paso la tiene siempre el ___ frente a los vehículos.', opciones: ['Motociclista', 'Peatón', 'Pasajero', 'Animal'], respuestaCorrecta: 'Peatón' },
      { id: 312, tipo: 'frase', texto: 'Al conducir un vehículo a motor, somos legalmente responsables de proteger a los actores ___ de la vía.', opciones: ['Fuertes', 'Vulnerables', 'Policiales', 'Extranjeros'], respuestaCorrecta: 'Vulnerables' },
      { id: 313, tipo: 'frase', texto: 'La distancia de ___ metros es vital para proteger la vida del ciclista al sobrepasarlo.', opciones: ['0.5', '1.0', '1.5', '2.0'], respuestaCorrecta: '1.5' },
      { id: 314, tipo: 'frase', texto: 'El bloqueo de una ___ es una infracción que genera gran congestión.', opciones: ['Vía', 'Calle', 'Intersección', 'Acera'], respuestaCorrecta: 'Intersección' },
      { id: 315, tipo: 'frase', texto: 'El respeto por las normas de tránsito es una muestra de cultura ___ .', opciones: ['Vial', 'Familiar', 'Musical', 'Deportiva'], respuestaCorrecta: 'Vial' }
    ]
  },
  {
    id: 4,
    titulo: 'Infracciones, Sanciones y Procedimiento',
    descripcion: 'Consecuencias de las malas conductas. Categorías de infracciones y el proceso del comparendo.',
    tiempoMinimoMinutos: 40,
    contenido: `
      <h2>Tipos de Infracciones en Colombia</h2>
      <p>Las infracciones se categorizan por su gravedad, desde la A (menores) hasta la F (relacionadas con embriaguez). </p>
      
      <div class="tabla-sanciones">
        <h3>Categorías Principales</h3>
        <ul>
          <li><strong>Categoría A:</strong> Multa de 4 SMDLV. Ejemplo: No transitar por la derecha.</li>
          <li><strong>Categoría B:</strong> Multa de 8 SMDLV. Ejemplo: Conducir sin licencia vencida.</li>
          <li><strong>Categoría C:</strong> Multa de 15 SMDLV. Ejemplo: Exceso de velocidad, omitir semáforo en rojo.</li>
          <li><strong>Categoría D:</strong> Multa de 30 SMDLV e inmovilización. Ejemplo: Conducir en contravía, sin SOAT.</li>
        </ul>
      </div>

      <h3>El Comparendo No es una Multa</h3>
      <p>El comparendo es una <strong>orden de comparecencia</strong>. Tienes derecho a la defensa en una audiencia si no estás de acuerdo. Si aceptas la culpa, este curso te permite reducir el valor de la sanción económica.</p>
    `,
    puntosClave: [
      { icono: '⚖️', texto: 'SMDLV: Salario Mínimo Diario Legal Vigente (base de las multas).' },
      { icono: '📸', texto: 'Fotodetección: Se notifica al propietario, responsabilidad solidaria.' },
      { icono: '🍷', texto: 'Alcoholemia: Grado 0 en adelante genera suspensión de licencia.' },
      { icono: '⛔', texto: 'Contravía: Infracción categoría D, genera inmovilización inmediata.' },
      { icono: '💳', texto: 'Descuento 50%: Si haces el curso en los primeros 5 días hábiles.' },
      { icono: '🏧', texto: 'Descuento 25%: Si haces el curso entre el día 6 y 20.' },
      { icono: '🏗️', texto: 'Inmovilización: El vehículo es llevado a patios; genera gastos de grúa y parqueo.' },
      { icono: '📇', texto: 'Suspensión de Licencia: Por reincidencia en menos de 6 meses.' },
      { icono: '❌', texto: 'Cancelación de Licencia: Por muertes en accidente bajo efectos de alcohol.' },
      { icono: '👮', texto: 'Autoridad: Agentes de tránsito y Policía de Carreteras están facultados.' },
      { icono: '📂', texto: 'SIMIT: Sistema donde se registran todas las multas a nivel nacional.' },
      { icono: '🗓️', texto: 'Caducidad: Los comparendos caducan al año si no se dicta resolución.' },
      { icono: '🏦', texto: 'Cobro Coactivo: La autoridad puede embargar cuentas por multas de tránsito.' },
      { icono: '🧪', texto: 'Negarse a la prueba: Genera la sanción más alta de la ley (Grado 3).' },
      { icono: '📑', texto: 'Derecho de Impugnación: Audiencia pública ante el inspector de tránsito.' }
    ],
    preguntas: [
      { id: 401, tipo: 'vf', texto: '¿Un comparendo es automáticamente una multa en firme?', opciones: ['Verdadero', 'Falso'], respuestaCorrecta: 'Falso' },
      { id: 402, tipo: 'vf', texto: '¿El curso pedagógico otorga el 50% de descuento si se hace el primer día?', opciones: ['Verdadero', 'Falso'], respuestaCorrecta: 'Verdadero' },
      { id: 403, tipo: 'vf', texto: '¿Conducir en contravía permite acceder al descuento del 50% con curso?', opciones: ['Verdadero', 'Falso'], respuestaCorrecta: 'Verdadero' },
      { id: 404, tipo: 'vf', texto: '¿La reincidencia en dos infracciones en menos de 6 meses suspende la licencia?', opciones: ['Verdadero', 'Falso'], respuestaCorrecta: 'Verdadero' },
      { id: 405, tipo: 'vf', texto: '¿Las fotomultas por exceso de velocidad son ilegales en Cali?', opciones: ['Verdadero', 'Falso'], respuestaCorrecta: 'Falso' },
      { id: 406, tipo: 'sm', texto: '¿Qué categoría de infracción es omitir un semáforo en rojo?', opciones: ['Categoría A', 'Categoría B', 'Categoría C', 'Categoría D'], respuestaCorrecta: 'Categoría C' },
      { id: 407, tipo: 'sm', texto: '¿Cuál es la consecuencia de conducir sin SOAT vigente?', opciones: ['Multa de 5 salarios', 'Llamado de atención', 'Multa de 30 SMDLV e inmovilización', 'Hacer una fila extra'], respuestaCorrecta: 'Multa de 30 SMDLV e inmovilización' },
      { id: 408, tipo: 'sm', texto: '¿A cuántos SMDLV equivale una infracción categoría B?', opciones: ['4', '8', '15', '30'], respuestaCorrecta: '8' },
      { id: 409, tipo: 'sm', texto: '¿Qué entidad nacional consolida todas las multas del país?', opciones: ['DIAN', 'SIMIT', 'Registraduría', 'SENA'], respuestaCorrecta: 'SIMIT' },
      { id: 410, tipo: 'sm', texto: '¿Qué sucede si un conductor se niega a realizar la prueba de alcoholemia?', opciones: ['Lo dejan ir', 'Se asume el grado más alto de sanción', 'Paga multa categoría A', 'Solo se le quita el carro una hora'], respuestaCorrecta: 'Se asume el grado más alto de sanción' },
      { id: 411, tipo: 'frase', texto: 'Las infracciones tipo ___ son las más costosas por embriaguez.', opciones: ['A', 'B', 'D', 'F'], respuestaCorrecta: 'F' },
      { id: 412, tipo: 'frase', texto: 'Para obtener el 50% de descuento, debe realizar el curso en los primeros ___ días hábiles.', opciones: ['3', '5', '10', '20'], respuestaCorrecta: '5' },
      { id: 413, tipo: 'frase', texto: 'El cobro ___ es el proceso por el cual la Secretaría de Movilidad puede embargar cuentas bancarias.', opciones: ['Amistoso', 'Coactivo', 'Efectivo', 'Judicial'], respuestaCorrecta: 'Coactivo' },
      { id: 414, tipo: 'frase', texto: 'La ___ del vehículo se presenta cuando este es trasladado a los patios oficiales.', opciones: ['Venta', 'Reparación', 'Inmovilización', 'Lavada'], respuestaCorrecta: 'Inmovilización' },
      { id: 415, tipo: 'frase', texto: 'La licencia de conducción se puede ___ permanentemente por reincidencia en embriaguez.', opciones: ['Extender', 'Perder', 'Cancelar', 'Duplicar'], respuestaCorrecta: 'Cancelar' }
    ]
  },
  {
    id: 5,
    titulo: 'Repaso Final y Cultura Vial',
    descripcion: 'Consolidación de conocimientos y compromiso con la ciudad. Protocolos de emergencia.',
    tiempoMinimoMinutos: 40,
    contenido: `
      <h2>Compromiso por la Vida</h2>
      <p>Ser conductor en Cali implica una responsabilidad social. La mayoría de accidentes son prevenibles y ocurren por exceso de velocidad o distracciones.</p>
      
      <h3>Protocolo PAS de Emergencia</h3>
      <ul>
        <li><strong>Proteger:</strong> Asegura el lugar del accidente con señales y luces para evitar nuevos choques.</li>
        <li><strong>Avisar:</strong> Llama a la línea <strong>123</strong> reportando heridos y ubicación exacta.</li>
        <li><strong>Socorrer:</strong> Solo si tienes conocimientos, brinda primeros auxilios básicos sin mover heridos de gravedad.</li>
      </ul>

      <p>Este curso pedagógico no es solo un trámite para ahorrar dinero; es una oportunidad para <strong>resetear tus hábitos</strong> al volante y volver a casa seguro cada día.</p>
    `,
    puntosClave: [
      { icono: '🏥', texto: 'En accidentes con heridos, jamás se debe mover el cuello del lesionado.' },
      { icono: '📞', texto: 'Línea 123: Punto de reporte unificado para todas las emergencias.' },
      { icono: '🛡️', texto: 'Equipo de Carretera: Debe incluir botiquín, extintor, tacos y gato.' },
      { icono: '☔', texto: 'Lluvia en Cali: Reduce la velocidad a la mitad, el asfalto mojado es resbaladizo.' },
      { icono: '🧠', texto: 'Conciencia: No manejes si estás bajo efectos de medicamentos que den sueño.' },
      { icono: '📉', texto: 'Estadística: El 90% de los accidentes viales son por factor humano.' },
      { icono: '🌃', texto: 'Visibilidad: Limpia tus vidrios y luces para evitar fatiga visual nocturna.' },
      { icono: '⛽', texto: 'Mantenimiento: Chequear frenos, llantas y dirección cada semana.' },
      { icono: '🏁', texto: 'Puntualidad: Sal 10 minutos antes para no tener que correr por el tráfico.' },
      { icono: '🧒', texto: 'Niños: Menores de 10 años deben ir siempre en el asiento trasero.' },
      { icono: '👨‍👩‍👧‍👦', texto: 'Familia: Recuerda que alguien te espera en casa.' },
      { icono: '💨', texto: 'Contaminación: Mantener el vehículo afinado reduce emisiones de CO2.' },
      { icono: '🏆', texto: 'Éxito Vial: Llegar a destino sin incidentes es la mejor meta.' },
      { icono: '🏙️', texto: 'Cali: Nuestra ciudad merece conductores educados y respetuosos.' },
      { icono: '🤝', texto: 'Promesa: Se un multiplicador de estas normas con tus conocidos.' }
    ],
    preguntas: [
      { id: 501, tipo: 'vf', texto: '¿La sigla PAS significa Parar, Avanzar y Seguir?', opciones: ['Verdadero', 'Falso'], respuestaCorrecta: 'Falso' },
      { id: 502, tipo: 'vf', texto: '¿Los niños menores de 10 años pueden viajar en el asiento del copiloto?', opciones: ['Verdadero', 'Falso'], respuestaCorrecta: 'Falso' },
      { id: 503, tipo: 'vf', texto: '¿El 90% de los accidentes se deben a fallas mecánicas impredecibles?', opciones: ['Verdadero', 'Falso'], respuestaCorrecta: 'Falso' },
      { id: 504, tipo: 'vf', texto: '¿En caso de lluvia extrema se recomienda aumentar la velocidad para salir rápido de la vía?', opciones: ['Verdadero', 'Falso'], respuestaCorrecta: 'Falso' },
      { id: 505, tipo: 'vf', texto: '¿Llamar al 123 es el primer paso del protocolo Avisar?', opciones: ['Verdadero', 'Falso'], respuestaCorrecta: 'Verdadero' },
      { id: 506, tipo: 'sm', texto: '¿Qué significa la P en el protocolo PAS?', opciones: ['Pitar', 'Proteger', 'Parquear', 'Pagar'], respuestaCorrecta: 'Proteger' },
      { id: 507, tipo: 'sm', texto: '¿Cuál es la línea de emergencia unificada en Colombia?', opciones: ['112', '911', '123', '147'], respuestaCorrecta: '123' },
      { id: 508, tipo: 'sm', texto: 'Al presentarse un accidente con heridos, lo primero que NO se debe hacer es:', opciones: ['Llamar ambulancia', 'Mover bruscamente a los lesionados', 'Colocar señalización en la vía', 'Encender luces de parqueo'], respuestaCorrecta: 'Mover bruscamente a los lesionados' },
      { id: 509, tipo: 'sm', texto: '¿Qué elemento NO es obligatorio en el equipo de carretera?', opciones: ['Extintor vigente', 'Tacos para bloquear ruedas', 'Botiquín de primeros auxilios', 'Nevera para bebidas'], respuestaCorrecta: 'Nevera para bebidas' },
      { id: 510, tipo: 'sm', texto: '¿Cuál es el factor que causa más accidentes en Cali?', opciones: ['Estado de las vías', 'Falla de semáforos', 'Imprudencia del actor vial', 'El clima'], respuestaCorrecta: 'Imprudencia del actor vial' },
      { id: 511, tipo: 'frase', texto: 'El protocolo PAS se usa para atender emergencias en la ___ .', opciones: ['Calle', 'Casa', 'Vía', 'Oficina'], respuestaCorrecta: 'Vía' },
      { id: 512, tipo: 'frase', texto: 'Socorrer es el ___ paso del protocolo de emergencias.', opciones: ['Primer', 'Segundo', 'Tercer', 'Cuarto'], respuestaCorrecta: 'Tercer' },
      { id: 513, tipo: 'frase', texto: 'La seguridad vial es un compromiso de ___ .', opciones: ['Todos', 'Unos pocos', 'Los policías', 'Los mecánicos'], respuestaCorrecta: 'Todos' },
      { id: 514, tipo: 'frase', texto: 'El equipo de carretera debe incluir dos señales en forma de ___ .', opciones: ['Círculo', 'Cuadrado', 'Triángulo', 'Rombo'], respuestaCorrecta: 'Triángulo' },
      { id: 515, tipo: 'frase', texto: 'Las luces de ___ deben activarse inmediatamente después de un impacto.', opciones: ['Alta', 'Baja', 'Parqueo', 'Antiniebla'], respuestaCorrecta: 'Parqueo' }
    ]
  }
];

// Generar banco plano para el motor de examen
const PREGUNTAS_BANCO = MODULOS.flatMap(m => m.preguntas.map(p => ({ ...p, modulo_id: m.id })));

module.exports = { MODULOS, PREGUNTAS_BANCO };
