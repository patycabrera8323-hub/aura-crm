import { Lead, AgentSettings, WhatsAppConnection, User, BroadcastCampaign } from '../types/crm';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_1',
    name: 'Dr. Roberto Garza',
    email: 'dr.garza@auracrm.com',
    role: 'Director / Admin',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr_2',
    name: 'Sofía Morales',
    email: 'sofia.morales@auracrm.com',
    role: 'Asesora WhatsApp',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr_3',
    name: 'Carlos Méndez',
    email: 'carlos.mendez@auracrm.com',
    role: 'Recepción & Citas',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  }
];

export const INITIAL_AGENT_SETTINGS: AgentSettings = {
  botName: 'AuraBot IA',
  businessName: 'Clínica Aura Especialistas & Bienestar',
  businessType: 'Salud, Estética y Consultoría Médica',
  tone: 'empatico_medico',
  customPrompt: 'Brinda atención cálida y resolutiva. Prioriza responder dudas sobre tratamientos, tiempos de recuperación y agendar la consulta de valoración.',
  autoAppointmentBooking: true,
  autoStageTransition: true,
  businessHours: 'Lunes a Sábado de 8:00 AM a 8:00 PM',
  welcomeMessage: '¡Hola! 💜 Gracias por contactar a Clínica Aura. Soy AuraBot, tu asistente inteligente. ¿En qué especialidad o consulta podemos ayudarte hoy?',
  fallbackMessage: 'He tomado nota de tu solicitud. Un asesor médico especializado continuará tu atención en unos instantes.',
  consultationPrice: '$45 USD / $850 MXN (Incluye diagnóstico y plan)',
  locationAddress: 'Av. Las Palmas 450, Torre Médica Platinum, Piso 3, Consultorio 304',
  servicesCatalog: [
    'Dermatología & Tratamientos Faciales',
    'Ortodoncia Invisible & Sonrisa',
    'Consulta Médica General & Nutrición',
    'Fisioterapia y Rehabilitación',
    'Cirugía Estética y Reconstructiva',
    'Chequeo Preventivo Ejecutivo'
  ]
};

export const INITIAL_WHATSAPP_CONNECTION: WhatsAppConnection = {
  isConnected: true,
  phoneNumber: '+52 1 55 8421 9900',
  displayName: 'Clínica Aura Oficial 🩺',
  qrCodeToken: 'aura_qr_session_live_authenticated_token',
  webhookUrl: typeof window !== 'undefined' ? `${window.location.origin}/api/webhook/whatsapp` : 'https://ais-pre-icymb44tectv3vwvuwlt4b-204608689121.us-west2.run.app/api/webhook/whatsapp',
  verifyToken: 'aura_crm_whatsapp_secret_2026',
  lastSync: 'Hace 2 minutos',
  batteryLevel: 94,
};

export const INITIAL_LEADS: Lead[] = [
  // 1. INICIO (Leads nuevos que acaban de entrar)
  {
    id: 'lead_1',
    name: 'Valeria Cárdenas',
    phone: '+52 55 4123 9801',
    email: 'valeria.cardenas@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    stage: 'inicio',
    value: 120,
    service: 'Dermatología & Tratamientos Faciales',
    source: 'whatsapp_direct',
    priority: 'alta',
    createdAt: '2026-10-01T14:15:00Z',
    updatedAt: '2026-10-01T14:15:00Z',
    lastActivity: 'Hoy, 2:15 PM',
    unreadCount: 1,
    aiScore: 88,
    aiSummary: 'Interesada en tratamiento para acné y manchas. Pregunta por costo y disponibilidad para esta misma semana.',
    aiBotEnabled: true,
    assignedTo: 'Sofía Morales',
    tags: ['WhatsApp Directo', 'Tratamiento Facial', 'Nuevo'],
    notes: [
      {
        id: 'n1',
        author: 'Sistema',
        text: 'Lead ingresado directamente vía WhatsApp Webhook tras ver anuncio en Instagram.',
        date: 'Hoy, 2:15 PM'
      }
    ],
    whatsappChat: [
      {
        id: 'm1_1',
        sender: 'lead',
        senderName: 'Valeria Cárdenas',
        text: 'Hola buenas tardes, vi su publicación de dermatología facial. ¿Tienen citas disponibles para valoración esta semana?',
        timestamp: '14:15',
        status: 'read'
      },
      {
        id: 'm1_2',
        sender: 'bot',
        senderName: 'AuraBot IA',
        text: '¡Hola Valeria! 💜 Bienvenida a Clínica Aura. Claro que sí, tenemos espacios disponibles para valoración dermatológica este jueves a las 11:00 AM o viernes a las 4:30 PM. ¿Te gustaría apartar alguno de estos horarios?',
        timestamp: '14:16',
        status: 'delivered'
      }
    ]
  },
  {
    id: 'lead_2',
    name: 'Mauricio Saldívar',
    phone: '+52 55 8920 1144',
    email: 'mauricio.saldivar@hotmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    stage: 'inicio',
    value: 350,
    service: 'Ortodoncia Invisible & Sonrisa',
    source: 'meta_ads',
    priority: 'media',
    createdAt: '2026-10-01T13:30:00Z',
    updatedAt: '2026-10-01T13:30:00Z',
    lastActivity: 'Hoy, 1:30 PM',
    unreadCount: 1,
    aiScore: 72,
    aiSummary: 'Preguntó si el escaneo 3D dental está incluido en la primera consulta.',
    aiBotEnabled: true,
    assignedTo: 'Sofía Morales',
    tags: ['Meta Ads', 'Alineadores', 'Cotización'],
    notes: [],
    whatsappChat: [
      {
        id: 'm2_1',
        sender: 'lead',
        senderName: 'Mauricio Saldívar',
        text: 'Buen día, me gustaría saber cuánto cuesta la ortodoncia invisible y si en la primera consulta me toman escaneo 3D.',
        timestamp: '13:30',
        status: 'read'
      }
    ]
  },

  // 2. ATENDIENDO (Leads en conversación activa o con cita tentativa)
  {
    id: 'lead_3',
    name: 'Dra. Gabriela Fuentes',
    phone: '+52 55 3322 7788',
    email: 'gaby.fuentes@salud.org',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    stage: 'atendiendo',
    value: 580,
    service: 'Chequeo Preventivo Ejecutivo',
    source: 'referral',
    priority: 'urgente',
    createdAt: '2026-09-30T10:00:00Z',
    updatedAt: '2026-10-01T11:20:00Z',
    lastActivity: 'Hoy, 11:20 AM',
    unreadCount: 0,
    aiScore: 95,
    aiSummary: 'Paciente referida por el Dr. Garza. Solicitó paquete integral de análisis clínicos y consulta con internista.',
    aiBotEnabled: false, // Atención humana
    assignedTo: 'Dr. Roberto Garza',
    tags: ['Referido VIP', 'Preventivo', 'En Negociación'],
    appointmentDate: '2026-10-03T09:00',
    appointmentStatus: 'confirmada',
    notes: [
      {
        id: 'n2',
        author: 'Dr. Roberto Garza',
        text: 'Hablé con Gabriela, requiere ayuno de 8 horas previo a la toma de muestras.',
        date: 'Hoy, 11:25 AM'
      }
    ],
    whatsappChat: [
      {
        id: 'm3_1',
        sender: 'lead',
        senderName: 'Gabriela Fuentes',
        text: 'Hola Dr. Roberto, me recomendó su clínica el Dr. Méndez para un chequeo preventivo completo.',
        timestamp: 'Ayer 10:00',
        status: 'read'
      },
      {
        id: 'm3_2',
        sender: 'agent',
        senderName: 'Dr. Roberto Garza',
        text: '¡Hola Gabriela! Qué gusto saludarte. Tenemos el Paquete Ejecutivo Platinum con análisis de laboratorio, electrocardiograma y valoración médica completa.',
        timestamp: 'Ayer 10:15',
        status: 'read'
      },
      {
        id: 'm3_3',
        sender: 'lead',
        senderName: 'Gabriela Fuentes',
        text: 'Perfecto, me queda excelente el sábado a las 9:00 AM para ir en ayunas.',
        timestamp: 'Hoy 11:20',
        status: 'read'
      },
      {
        id: 'm3_4',
        sender: 'agent',
        senderName: 'Sofía Morales',
        text: '¡Listo Gabriela! Te agendamos para el Sábado 3 de Octubre a las 9:00 AM. Te mandamos tu ficha de preparación.',
        timestamp: 'Hoy 11:22',
        status: 'read'
      }
    ]
  },
  {
    id: 'lead_4',
    name: 'Rodrigo Alarcón',
    phone: '+52 55 9988 2211',
    email: 'rodrigo.alarcon@empresa.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    stage: 'atendiendo',
    value: 240,
    service: 'Fisioterapia y Rehabilitación',
    source: 'website_form',
    priority: 'alta',
    createdAt: '2026-09-29T16:00:00Z',
    updatedAt: '2026-10-01T09:40:00Z',
    lastActivity: 'Hoy, 9:40 AM',
    unreadCount: 0,
    aiScore: 84,
    aiSummary: 'Lesión deportiva en rodilla (meniscos). Requiere valoración con ultrasonido terapéutico.',
    aiBotEnabled: true,
    assignedTo: 'Carlos Méndez',
    tags: ['Fisioterapia', 'Dolor Agudo'],
    appointmentDate: '2026-10-02T16:30',
    appointmentStatus: 'pendiente',
    notes: [
      {
        id: 'n3',
        author: 'Carlos Méndez',
        text: 'Mencionó dolor agudo al correr. Se le ofreció sesión de descarga y electroterapia.',
        date: 'Ayer, 4:30 PM'
      }
    ],
    whatsappChat: [
      {
        id: 'm4_1',
        sender: 'lead',
        senderName: 'Rodrigo Alarcón',
        text: 'Hola, tengo un dolor fuerte en la rodilla tras un partido de fútbol, ¿tienen fisioterapeuta hoy o mañana?',
        timestamp: 'Ayer 16:00',
        status: 'read'
      },
      {
        id: 'm4_2',
        sender: 'bot',
        senderName: 'AuraBot IA',
        text: 'Hola Rodrigo, lamentamos la molestia en tu rodilla. Nuestro equipo de Fisioterapia Deportiva tiene espacio disponible mañana a las 4:30 PM para valoración y primera terapia. ¿Confirmamos tu lugar?',
        timestamp: 'Ayer 16:02',
        status: 'read'
      },
      {
        id: 'm4_3',
        sender: 'lead',
        senderName: 'Rodrigo Alarcón',
        text: 'Sí por favor, a las 4:30 me viene genial.',
        timestamp: 'Hoy 09:40',
        status: 'read'
      }
    ]
  },

  // 3. FUE A CONSULTA (Leads que ya asistieron a la consulta / cita ganada)
  {
    id: 'lead_5',
    name: 'Mariana Elizondo',
    phone: '+52 55 6712 3490',
    email: 'mariana.elizondo@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    stage: 'fue_a_consulta',
    value: 1200,
    service: 'Cirugía Estética y Reconstructiva',
    source: 'meta_ads',
    priority: 'alta',
    createdAt: '2026-09-20T11:00:00Z',
    updatedAt: '2026-10-01T15:00:00Z',
    lastActivity: 'Hoy, 3:00 PM',
    unreadCount: 0,
    aiScore: 98,
    aiSummary: 'Asistió a su consulta de valoración con el Dr. Garza. Se aprobó presupuesto de rinoplastia ultrasónica para Noviembre.',
    aiBotEnabled: false,
    assignedTo: 'Dr. Roberto Garza',
    tags: ['Consulta Realizada', 'Cirugía', 'Ganado', 'Paciente Activo'],
    appointmentDate: '2026-10-01T11:00',
    appointmentStatus: 'asistio',
    notes: [
      {
        id: 'n4',
        author: 'Dr. Roberto Garza',
        text: 'Excelente consulta presencial. Se realizaron fotografías clínicas y simulación digital 3D. Aceptó presupuesto.',
        date: 'Hoy, 12:30 PM'
      }
    ],
    whatsappChat: [
      {
        id: 'm5_1',
        sender: 'agent',
        senderName: 'Dr. Roberto Garza',
        text: 'Hola Mariana, fue un placer recibirte hoy en consulta. Te enviamos la orden médica para los estudios preoperatorios.',
        timestamp: '15:00',
        status: 'delivered'
      },
      {
        id: 'm5_2',
        sender: 'lead',
        senderName: 'Mariana Elizondo',
        text: '¡Muchas gracias Doctor! Me encantó la atención de todo el equipo. Ya programé mis estudios para el lunes.',
        timestamp: '15:12',
        status: 'read'
      }
    ]
  },
  {
    id: 'lead_6',
    name: 'Esteban Domínguez',
    phone: '+52 55 1199 4433',
    email: 'esteban.d@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    stage: 'fue_a_consulta',
    value: 180,
    service: 'Dermatología & Tratamientos Faciales',
    source: 'whatsapp_direct',
    priority: 'media',
    createdAt: '2026-09-25T09:00:00Z',
    updatedAt: '2026-09-30T17:00:00Z',
    lastActivity: 'Ayer, 5:00 PM',
    unreadCount: 0,
    aiScore: 92,
    aiSummary: 'Acudió a sesión de Hydrafacial y peeling médico. Compró kit de skincare dermatológico en recepción.',
    aiBotEnabled: true,
    assignedTo: 'Sofía Morales',
    tags: ['Consulta Realizada', 'Hydrafacial', 'Venta Producto'],
    appointmentDate: '2026-09-30T16:00',
    appointmentStatus: 'asistio',
    notes: [
      {
        id: 'n5',
        author: 'Sofía Morales',
        text: 'Paciente muy satisfecho con los resultados inmediatos. Se programó seguimiento en 21 días.',
        date: 'Ayer, 5:10 PM'
      }
    ],
    whatsappChat: [
      {
        id: 'm6_1',
        sender: 'bot',
        senderName: 'AuraBot IA',
        text: '¡Hola Esteban! Esperamos que tu piel se sienta increíble tras tu sesión de Hydrafacial. Recuerda aplicar bloqueador solar cada 4 horas.',
        timestamp: 'Ayer 18:00',
        status: 'read'
      },
      {
        id: 'm6_2',
        sender: 'lead',
        senderName: 'Esteban Domínguez',
        text: '¡Excelente servicio muchas gracias! Nos vemos el próximo mes.',
        timestamp: 'Ayer 18:30',
        status: 'read'
      }
    ]
  },

  // 4. EN CARTERA (Leads guardados para seguimiento posterior, recontacto, nutrición)
  {
    id: 'lead_7',
    name: 'Lucía Benavides',
    phone: '+52 55 7766 5544',
    email: 'lucia.bena@outlook.com',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    stage: 'en_cartera',
    value: 450,
    service: 'Ortodoncia Invisible & Sonrisa',
    source: 'meta_ads',
    priority: 'media',
    createdAt: '2026-09-15T12:00:00Z',
    updatedAt: '2026-09-28T10:00:00Z',
    lastActivity: 'Hace 3 días',
    unreadCount: 0,
    aiScore: 65,
    aiSummary: 'Interesada en alineadores pero comentó que empezaría tratamiento en Noviembre por viaje de trabajo.',
    aiBotEnabled: true,
    assignedTo: 'Sofía Morales',
    tags: ['Cartera Activa', 'Recontacto Noviembre', 'Nutrición'],
    notes: [
      {
        id: 'n6',
        author: 'Sofía Morales',
        text: 'Volver a contactar la primera semana de Noviembre para ofrecer promoción de fin de año.',
        date: '28 Sep, 10:30 AM'
      }
    ],
    whatsappChat: [
      {
        id: 'm7_1',
        sender: 'lead',
        senderName: 'Lucía Benavides',
        text: 'Hola Sofía, me interesa mucho pero salgo de viaje todo octubre. ¿Me podrían contactar en noviembre?',
        timestamp: '28 Sep 09:50',
        status: 'read'
      },
      {
        id: 'm7_2',
        sender: 'agent',
        senderName: 'Sofía Morales',
        text: '¡Claro que sí Lucía! Te guardamos en nuestra cartera preferencial y te escribimos en noviembre con una sorpresa especial. ¡Buen viaje!',
        timestamp: '28 Sep 10:00',
        status: 'read'
      }
    ]
  },
  {
    id: 'lead_8',
    name: 'Fernando Ruiz',
    phone: '+52 55 9012 3456',
    email: 'fernando.ruiz@tecnologia.io',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    stage: 'en_cartera',
    value: 290,
    service: 'Consulta Médica General & Nutrición',
    source: 'website_form',
    priority: 'baja',
    createdAt: '2026-09-10T14:00:00Z',
    updatedAt: '2026-09-26T16:00:00Z',
    lastActivity: 'Hace 5 días',
    unreadCount: 0,
    aiScore: 58,
    aiSummary: 'Pidió información para plan nutricional corporativo de 5 colaboradores. Quedó de revisar presupuesto con finanzas.',
    aiBotEnabled: true,
    assignedTo: 'Carlos Méndez',
    tags: ['Cartera B2B', 'Nutrición', 'Presupuesto'],
    notes: [
      {
        id: 'n7',
        author: 'Carlos Méndez',
        text: 'Enviar recordatorio de descuento por volumen empresarial el próximo lunes.',
        date: '26 Sep, 4:15 PM'
      }
    ],
    whatsappChat: [
      {
        id: 'm8_1',
        sender: 'lead',
        senderName: 'Fernando Ruiz',
        text: 'Recibí la propuesta económica, la estoy evaluando con el equipo de recursos humanos.',
        timestamp: '26 Sep 15:45',
        status: 'read'
      }
    ]
  }
];

export const INITIAL_CAMPAIGNS: BroadcastCampaign[] = [
  {
    id: 'camp_1',
    name: 'Recontacto Cartera: Bono Consulta de Primavera 🌸',
    targetStage: 'en_cartera',
    templateMessage: '¡Hola {nombre}! 💜 En Clínica Aura recordamos tu interés en {servicio}. Este mes tenemos un 25% de cortesía en tu consulta de valoración. ¿Te gustaría agendar esta semana?',
    scheduledDate: '2026-10-05',
    status: 'borrador',
    recipientCount: 14,
    openRate: 78
  },
  {
    id: 'camp_2',
    name: 'Recordatorio Pre-Consulta & Confirmación 📅',
    targetStage: 'atendiendo',
    templateMessage: 'Hola {nombre}, te recordamos tu cita programada en Clínica Aura. ¿Nos confirmas tu asistencia con un "SÍ"? 😊',
    scheduledDate: '2026-10-02',
    status: 'completada',
    recipientCount: 8,
    openRate: 95
  }
];
