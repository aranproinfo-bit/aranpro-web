// Datos iniciales para Gobernanza (Ley 21.442), Libro de Actas, Poderes,
// Mantenciones Preventivas y Libro de Sugerencias y Reclamos.

export const INITIAL_WRITTEN_CONSULTATIONS = [
  {
    id: 'cons-2026-001',
    folio: 'CONS-2026-001',
    title: 'Aprobación de Cuota Extraordinaria: Modernización Motores de Portón Vehicular',
    description: 'Sustitución de motores electromecánicos de corredera por sistema industrial de alto tráfico con respaldo de baterías ante cortes de luz y apertura de emergencia para bomberos/ambulancias (Ley 21.442 Art. 40). Monto total presupuestado: $560.000 ($35.000 por casa en 1 cuota extraordinaria en el gasto común).',
    legalBasis: 'Art. 15 inc. final y Art. 16 Ley N° 21.442',
    requiredQuorumType: 'Mayoría Absoluta (50% + 1 de los derechos totales del condominio)',
    requiredQuorumPct: 50.0001,
    status: 'ACTIVA', // 'ACTIVA' | 'CERRADA_APROBADA' | 'CERRADA_RECHAZADA'
    startDate: '2026-10-25',
    endDate: '2026-11-15',
    options: ['A Favor (Aprueba cuota $35.000)', 'En Contra', 'Abstención'],
    votes: {
      '1': { value: 'A Favor', voter: 'Carlos Morales Rojas', date: '2026-10-26' },
      '2': { value: 'A Favor', voter: 'Patricia Vega Fuentes', date: '2026-10-26' },
      '3': { value: 'En Contra', voter: 'Daniela Rojas Plaza (Apoderada)', date: '2026-10-27' },
      '4': { value: 'A Favor', voter: 'Marcela Castillo Gómez', date: '2026-10-26' },
      '5': { value: 'A Favor', voter: 'Felipe Orellana', date: '2026-10-28' },
      '6': { value: 'A Favor', voter: 'Rodrigo Menares', date: '2026-10-28' },
      '7': { value: 'A Favor', voter: 'Claudia Herrera Soto (Apoderada)', date: '2026-10-29' },
      '8': { value: 'A Favor', voter: 'Jorge Alarcón', date: '2026-10-30' },
      '10': { value: 'A Favor', voter: 'Esteban Paredes Quintanilla', date: '2026-10-30' },
      '11': { value: 'A Favor', voter: 'Loreto Valenzuela', date: '2026-10-31' },
      '12': { value: 'A Favor', voter: 'Sebastián Piñeiro', date: '2026-11-01' }
    }
  },
  {
    id: 'cons-2026-002',
    folio: 'CONS-2026-002',
    title: 'Actualización del Reglamento: Horario Límite de Celebraciones en Fines de Semana',
    description: 'Modificación del artículo 12 del Reglamento Interno de Copropiedad: Extender el horario límite para reuniones familiares y música moderada los días viernes, sábados y vísperas de festivos desde las 23:30 hasta las 01:00 AM, manteniendo estricta prohibición de ruidos molestos en días de semana después de las 22:00 hrs.',
    legalBasis: 'Art. 15 inc. final Ley N° 21.442',
    requiredQuorumType: 'Mayoría Absoluta (50% + 1 de los derechos totales del condominio)',
    requiredQuorumPct: 50.0001,
    status: 'ACTIVA',
    startDate: '2026-11-01',
    endDate: '2026-11-22',
    options: ['A Favor (Modificar a 01:00 AM)', 'En Contra (Mantener 23:30 hrs)', 'Abstención'],
    votes: {
      '1': { value: 'A Favor', voter: 'Carlos Morales Rojas', date: '2026-11-01' },
      '4': { value: 'A Favor', voter: 'Marcela Castillo Gómez', date: '2026-11-01' },
      '7': { value: 'En Contra', voter: 'Claudia Herrera Soto', date: '2026-11-02' },
      '10': { value: 'Abstención', voter: 'Esteban Paredes Quintanilla', date: '2026-11-02' }
    }
  }
];

export const INITIAL_ASSEMBLY_MINUTES = [
  {
    id: 'acta-2026-001',
    folio: 'ACTA-2026-001',
    date: '2026-01-20',
    time: '19:30 hrs',
    type: 'Asamblea Ordinaria Anual',
    legalArticle: 'Art. 15° Ley N° 21.442',
    place: 'Sede Comunitaria y Transmisión Simultánea Google Meet',
    presidentName: 'Carlos Morales Rojas',
    presidentRut: '15.428.312-4',
    secretaryName: 'Marcela Castillo Gómez',
    secretaryRut: '13.784.512-8',
    adminName: 'Administración General ARANPRO',
    adminRut: '76.892.431-K',
    quorumAchieved: 81.25,
    totalUnitsPresent: 13,
    totalUnitsCount: 16,
    status: 'FIRMADA_Y_FOLIADA',
    agendaItems: [
      '1. Rendición de Cuentas y Estado Financiero Período 2025',
      '2. Aprobación del Presupuesto Operativo Estimativo 2026',
      '3. Fijación del Fondo de Reserva Legal en un 5% obligatorio',
      '4. Ratificación y Renovación del Comité de Administración'
    ],
    resolutions: [
      'Se aprueba por el 100% de los copropietarios asistentes (81.25% de los derechos totales del condominio) la rendición de cuentas del ejercicio anual 2025 presentada por la Administración, sin observaciones contables.',
      'Se aprueba el presupuesto de gastos ordinarios para el año 2026 fijando un gasto común base de $44.625 mensuales por vivienda, con vencimiento los días 5 de cada mes.',
      'Se acuerda destinar un 5% mensual obligatorio sobre el gasto común para el Fondo de Reserva Comunitario para imprevistos.',
      'Se ratifica la designación de don Carlos Morales Rojas (Casa 1) como Presidente del Comité de Administración y de doña Marcela Castillo Gómez (Casa 4) como Secretaria/Tesorera, con mandato por 2 años según el Art. 17 Ley 21.442.'
    ],
    notes: 'Copia foliada auténtica respaldada en el libro digital de actas y a disposición de los copropietarios en el portal.'
  },
  {
    id: 'acta-2025-003',
    folio: 'ACTA-2025-003',
    date: '2025-10-18',
    time: '20:00 hrs',
    type: 'Asamblea Extraordinaria Mayoría Absoluta',
    legalArticle: 'Art. 15° inc. 2° Ley N° 21.442',
    place: 'Sede Comunitaria Condominio Los Cerezos',
    presidentName: 'Carlos Morales Rojas',
    presidentRut: '15.428.312-4',
    secretaryName: 'Marcela Castillo Gómez',
    secretaryRut: '13.784.512-8',
    adminName: 'Administración General ARANPRO',
    adminRut: '76.892.431-K',
    quorumAchieved: 68.75,
    totalUnitsPresent: 11,
    totalUnitsCount: 16,
    status: 'FIRMADA_Y_FOLIADA',
    agendaItems: [
      '1. Contratación de empresa de mantención de portón eléctrico',
      '2. Instalación de circuito cerrado de tele-vigilancia (CCTV) en accesos'
    ],
    resolutions: [
      'Se aprueba la contratación de la empresa Automatizaciones del Norte SpA para el mantenimiento preventivo bimensual del portón vehicular.',
      'Se aprueba la instalación de 4 cámaras de alta resolución en los accesos vehiculares y peatonales con cargo al fondo de reserva disponible.'
    ],
    notes: 'Acta archivada y debidamente protocolizada con firmas de rigor.'
  }
];

export const INITIAL_REGISTERED_PROXIES = [
  {
    unitNumber: 'Casa 3',
    ownerName: 'Gonzalo Silva Araya',
    ownerRut: '16.298.584-2',
    proxyName: 'Daniela Rojas Plaza',
    proxyRut: '17.842.105-3',
    relationship: 'Arrendataria con Poder',
    proxyType: 'Poder Simple Escrito (Ley 21.442 Art. 16°)',
    validity: 'Período 2026 (Renovación Anual)',
    status: 'ACREDITADO', // 'ACREDITADO' | 'EN_REVISION' | 'REVOCADO'
    grantedDate: '2026-03-01',
    notes: 'Acreditado mediante carta poder simple con firma del propietario y fotocopia de cédula de identidad.'
  },
  {
    unitNumber: 'Casa 7',
    ownerName: 'Roberto Fuenzalida',
    ownerRut: '12.451.980-1',
    proxyName: 'Claudia Herrera Soto',
    proxyRut: '14.120.301-9',
    relationship: 'Cónyuge / Co-Habitante',
    proxyType: 'Poder Notarial Amplio',
    validity: 'Indefinido',
    status: 'ACREDITADO',
    grantedDate: '2025-08-14',
    notes: 'Escritura de poder notarial para administración y representación en asambleas.'
  },
  {
    unitNumber: 'Casa 12',
    ownerName: 'Sebastián Piñeiro',
    ownerRut: '18.902.431-5',
    proxyName: 'Camila Morales Vega',
    proxyRut: '19.541.220-7',
    relationship: 'Arrendataria',
    proxyType: 'Poder Simple Escrito (Ley 21.442 Art. 16°)',
    validity: 'Período 2026',
    status: 'EN_REVISION',
    grantedDate: '2026-10-20',
    notes: 'Documento recepcionado vía portal; en proceso de cotejo de firma con escritura de la propiedad.'
  }
];

export const INITIAL_PREVENTIVE_MAINTENANCES = [
  {
    id: 'maint-bombas',
    name: 'Bombas de Impulsión y Presurización de Agua Potable',
    category: 'Agua & Bombas',
    frequency: 'Trimestral',
    frequencyMonths: 3,
    lastDate: '2026-09-15',
    nextDueDate: '2026-12-15',
    daysRemaining: 43,
    status: 'VIGENTE', // 'VIGENTE' | 'PROXIMO' | 'URGENTE' | 'VENCIDO'
    statusColor: 'emerald',
    providerName: 'Bombas & Fluidos Elqui SpA',
    providerRut: '76.412.309-8',
    providerContact: '+56 9 8451 9920',
    providerEmail: 'contacto@bombaselqui.cl',
    estimatedCost: 85000,
    legalRequirement: 'Ley N° 21.442 Art. 40 - Seguridad e Higiene de Bienes Comunes',
    certificateNumber: 'CERT-BOM-2026-03',
    certificateUrl: '#',
    scopeDescription: 'Revisión y calibración de presostatos, sellos mecánicos, alternancia automática de bombas 1 y 2, y medición de amperaje en tablero de fuerza.'
  },
  {
    id: 'maint-porton',
    name: 'Portón Vehicular Automático y Motores de Corredera',
    category: 'Acceso & Seguridad',
    frequency: 'Bimensual',
    frequencyMonths: 2,
    lastDate: '2026-09-28',
    nextDueDate: '2026-11-28',
    daysRemaining: 26,
    status: 'PROXIMO',
    statusColor: 'amber',
    providerName: 'Automatizaciones del Norte SpA',
    providerRut: '77.104.582-1',
    providerContact: '+56 9 9342 1109',
    providerEmail: 'servicio@autonorte.cl',
    estimatedCost: 65000,
    legalRequirement: 'Art. 40 Ley N° 21.442 - Mantención preventiva obligatoria de accesos y portones',
    certificateNumber: 'MNT-PORT-2026-05',
    certificateUrl: '#',
    scopeDescription: 'Engrase de cremallera metálica, verificación de finales de carrera mecánicos y prueba de fotoceldas de seguridad anti-aplastamiento.'
  },
  {
    id: 'maint-extintores',
    name: 'Extintores de Incendio y Red Húmeda (DS N° 44)',
    category: 'Seguridad & Incendio',
    frequency: 'Anual',
    frequencyMonths: 12,
    lastDate: '2025-11-10',
    nextDueDate: '2026-11-10',
    daysRemaining: 8,
    status: 'URGENTE',
    statusColor: 'rose',
    providerName: 'Extintores & Seguridad La Serena Ltda.',
    providerRut: '78.902.115-4',
    providerContact: '+56 51 224 8812',
    providerEmail: 'contacto@extintoreslaserena.cl',
    estimatedCost: 120000,
    legalRequirement: 'Decreto Supremo N° 44 / NCh 1433 - Recertificación y mantención anual obligatoria',
    certificateNumber: 'EXT-2025-DS44-098',
    certificateUrl: '#',
    scopeDescription: 'Inspección de 8 extintores de polvo químico seco (PQS 6kg), pesaje de agentes impulsores y prueba hidrostática periódica.'
  },
  {
    id: 'maint-estanques',
    name: 'Lavado y Desinfección de Estanques de Agua Potable',
    category: 'Salud & Sanidad',
    frequency: 'Semestral',
    frequencyMonths: 6,
    lastDate: '2026-05-20',
    nextDueDate: '2026-11-20',
    daysRemaining: 18,
    status: 'PROXIMO',
    statusColor: 'amber',
    providerName: 'Higiene Ambiental & Sanitizaciones Norte',
    providerRut: '76.819.330-2',
    providerContact: '+56 9 7712 3344',
    providerEmail: 'info@saninorte.cl',
    estimatedCost: 180000,
    legalRequirement: 'Resolución Sanitaria Seremi de Salud - Higienización y desinfección semestral obligatoria',
    certificateNumber: 'SEREMI-SAN-2026-44',
    certificateUrl: '#',
    scopeDescription: 'Vaciado, cepillado de paredes de estanques de hormigón con hipoclorito de sodio al 5%, enjuague de alta presión y análisis bacteriológico de agua.'
  },
  {
    id: 'maint-gas',
    name: 'Inspección de Instalaciones de Gas (Sello Verde SEC)',
    category: 'Certificación SEC',
    frequency: 'Bianual (Cada 2 años)',
    frequencyMonths: 24,
    lastDate: '2025-10-15',
    nextDueDate: '2027-10-15',
    daysRemaining: 347,
    status: 'VIGENTE',
    statusColor: 'emerald',
    providerName: 'Certificadora de Gas del Elqui Ltda. (Organismo Acreditado SEC)',
    providerRut: '76.992.100-3',
    providerContact: '+56 51 230 4400',
    providerEmail: 'sec@certigas.cl',
    estimatedCost: 280000,
    legalRequirement: 'D.S. N° 66 Ministerio de Economía - Certificación Periódica de Instalaciones de Gas',
    certificateNumber: 'SEC-SELLO-VERDE-2025-081',
    certificateUrl: '#',
    scopeDescription: 'Sello Verde oficial vigente aprobado sin observaciones en matriz general de gas y shaft de medidores hasta Octubre 2027.'
  }
];

export const INITIAL_COMMUNITY_TICKETS = [
  {
    id: 'ticket-2026-001',
    folio: 'REC-2026-001',
    unitNumber: 'Casa 3',
    residentName: 'Daniela Rojas Plaza',
    implicatedUnitNumber: 'Casa 9',
    date: '2026-10-28',
    type: 'Reclamo',
    category: 'Ruidos Molestos / Convivencia',
    priority: 'Alta',
    status: 'EN_GESTION', // 'PENDIENTE' | 'EN_GESTION' | 'RESUELTO' | 'ARCHIVADO'
    title: 'Música a alto volumen en horario de madrugada',
    description: 'Durante la noche del sábado 26 de octubre, vecinos de la Casa 9 tuvieron música a volumen excesivo hasta las 03:30 AM, impidiendo el descanso de las familias colindantes. Se solicita aplicar amonestación conforme al Art. 14 del Reglamento de Copropiedad.',
    adminResponse: 'Estimada Daniela, se cursó carta de advertencia formal a los ocupantes de la Casa 9 recordando los horarios establecidos en el Reglamento interno. En caso de reincidencia, se procederá con la multa correspondiente en el próximo gasto común.',
    adminResponseDate: '2026-10-29',
    elevateToAssembly: false
  },
  {
    id: 'ticket-2026-002',
    folio: 'SUG-2026-002',
    unitNumber: 'Casa 8',
    residentName: 'Jorge Alarcón',
    implicatedUnitNumber: '',
    date: '2026-10-15',
    type: 'Sugerencia',
    category: 'Espacios Comunes & Sustentabilidad',
    priority: 'Media',
    status: 'RESUELTO',
    title: 'Instalación de Punto Verde de Reciclaje de Vidrio y Cartón',
    description: 'Propongo coordinar con la Municipalidad de La Serena la colocación de un contenedor para reciclaje de vidrios y latas en el sector aledaño a la sala de bombas, para reducir el volumen de basura común.',
    adminResponse: 'Excelente iniciativa. Se tomó contacto con el Departamento de Medio Ambiente Municipal y se agendó la entrega de dos campanas de reciclaje sin costo para la comunidad para la segunda quincena de Noviembre.',
    adminResponseDate: '2026-10-18',
    elevateToAssembly: true
  },
  {
    id: 'ticket-2026-003',
    folio: 'REC-2026-003',
    unitNumber: 'Casa 14',
    residentName: 'Verónica Bustos',
    implicatedUnitNumber: 'Área Común / Proveedor Portones',
    date: '2026-11-01',
    type: 'Reclamo',
    category: 'Seguridad / Portón',
    priority: 'Urgente',
    status: 'PENDIENTE',
    title: 'Portón vehicular comenzó a cerrarse antes de completar el cruce',
    description: 'Al ingresar en mi vehículo ayer domingo a las 19:00 hrs, el portón comenzó a cerrarse antes de completar el cruce. Afortunadamente frené, pero parece que el sensor de fotocelda está descalibrado o con suciedad.',
    adminResponse: '',
    adminResponseDate: null,
    elevateToAssembly: false
  }
];
