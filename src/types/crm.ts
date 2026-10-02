export type LeadStage = 'inicio' | 'atendiendo' | 'fue_a_consulta' | 'en_cartera';

export type LeadSource = 
  | 'whatsapp_direct' 
  | 'meta_ads' 
  | 'webhook' 
  | 'website_form' 
  | 'referral' 
  | 'manual';

export type LeadPriority = 'baja' | 'media' | 'alta' | 'urgente';

export interface ChatMessage {
  id: string;
  sender: 'lead' | 'bot' | 'agent';
  senderName: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  audioNote?: {
    duration: string;
    url?: string;
  };
}

export interface NoteItem {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  stage: LeadStage;
  value: number; // Valor estimado o facturado en USD / Moneda local
  service: string; // Ej: "Ortodoncia Invisible", "Dermatología Facial", "Consulta Médica General", "Cirugía Plástica", "Nutrición Integral"
  source: LeadSource;
  priority: LeadPriority;
  createdAt: string;
  updatedAt: string;
  lastActivity: string;
  notes: NoteItem[];
  tags: string[];
  appointmentDate?: string; // Formato YYYY-MM-DDTHH:mm
  appointmentStatus?: 'pendiente' | 'confirmada' | 'asistio' | 'cancelada' | 'reprogramada';
  whatsappChat: ChatMessage[];
  unreadCount: number;
  aiScore?: number; // 0 a 100
  aiSummary?: string;
  aiBotEnabled: boolean; // Si el bot de WhatsApp responde automáticamente
  assignedTo: string;
}

export interface AgentSettings {
  botName: string;
  businessName: string;
  businessType: string;
  tone: 'empatico_medico' | 'comercial_persuasivo' | 'formal_profesional' | 'cercano_amigable';
  customPrompt: string;
  autoAppointmentBooking: boolean;
  autoStageTransition: boolean;
  businessHours: string;
  welcomeMessage: string;
  fallbackMessage: string;
  consultationPrice: string;
  locationAddress: string;
  servicesCatalog: string[];
}

export interface WhatsAppConnection {
  isConnected: boolean;
  phoneNumber: string;
  displayName: string;
  qrCodeToken: string;
  webhookUrl: string;
  verifyToken: string;
  lastSync: string;
  batteryLevel?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Director / Admin' | 'Médico Especialista' | 'Asesora WhatsApp' | 'Recepción & Citas';
  avatar: string;
}

export interface BroadcastCampaign {
  id: string;
  name: string;
  targetStage: LeadStage;
  templateMessage: string;
  scheduledDate: string;
  status: 'borrador' | 'enviando' | 'completada';
  recipientCount: number;
  openRate: number;
}
