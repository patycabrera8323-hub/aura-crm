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

// ✅ Sin datos demo — los leads reales llegan automáticamente desde Supabase vía /api/crm/leads-live
export const INITIAL_LEADS: Lead[] = [];

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
