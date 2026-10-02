import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Lead, 
  LeadStage, 
  AgentSettings, 
  WhatsAppConnection, 
  User, 
  ChatMessage, 
  NoteItem,
  BroadcastCampaign 
} from '../types/crm';
import { 
  INITIAL_LEADS, 
  INITIAL_AGENT_SETTINGS, 
  INITIAL_WHATSAPP_CONNECTION, 
  INITIAL_USERS,
  INITIAL_CAMPAIGNS
} from '../data/initialData';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface CrmContextType {
  currentUser: User | null;
  users: User[];
  login: (user: User) => void;
  logout: () => void;
  
  // Leads
  leads: Lead[];
  selectedLead: Lead | null;
  setSelectedLead: (lead: Lead | null) => void;
  addLead: (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'lastActivity' | 'unreadCount' | 'whatsappChat' | 'notes'> & { initialNote?: string }) => Lead;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  updateLeadStage: (id: string, newStage: LeadStage) => void;
  deleteLead: (id: string) => void;
  addNoteToLead: (leadId: string, text: string) => void;
  toggleLeadBot: (leadId: string) => void;
  
  // WhatsApp & Chat
  activeChatLeadId: string | null;
  setActiveChatLeadId: (id: string | null) => void;
  sendMessage: (leadId: string, text: string, senderOverride?: 'agent' | 'lead') => Promise<void>;
  simulateInboundLeadMessage: (customLead?: Partial<Lead>, customText?: string) => Promise<void>;
  aiIsTyping: boolean;
  
  // AI Suggestions & Analysis
  getAiSuggestions: (leadId: string) => Promise<string[]>;
  analyzeLeadWithAi: (leadId: string) => Promise<void>;
  
  // WhatsApp Settings & Connection
  whatsAppConnection: WhatsAppConnection;
  toggleWhatsAppConnection: () => void;
  reconnectWhatsAppQr: () => void;
  agentSettings: AgentSettings;
  updateAgentSettings: (settings: Partial<AgentSettings>) => void;
  
  // Cartera & Campaigns
  campaigns: BroadcastCampaign[];
  sendCampaignBroadcast: (campaignId: string) => Promise<void>;
  createCampaign: (campaign: Omit<BroadcastCampaign, 'id' | 'recipientCount' | 'openRate'>) => void;
  
  // Stats & Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedStageFilter: LeadStage | 'all';
  setSelectedStageFilter: (stage: LeadStage | 'all') => void;
  
  // Toast notifications
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export const CrmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('aura_crm_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[0]; // Default Dr. Roberto
  });
  const [users] = useState<User[]>(INITIAL_USERS);

  // 2. Leads State
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('aura_crm_leads');
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activeChatLeadId, setActiveChatLeadId] = useState<string | null>('lead_1');
  const [aiIsTyping, setAiIsTyping] = useState(false);

  // 3. WhatsApp & Settings
  const [whatsAppConnection, setWhatsAppConnection] = useState<WhatsAppConnection>(INITIAL_WHATSAPP_CONNECTION);
  const [agentSettings, setAgentSettings] = useState<AgentSettings>(() => {
    const saved = localStorage.getItem('aura_crm_agent_settings');
    return saved ? JSON.parse(saved) : INITIAL_AGENT_SETTINGS;
  });

  // 4. Campaigns
  const [campaigns, setCampaigns] = useState<BroadcastCampaign[]>(INITIAL_CAMPAIGNS);

  // 5. Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState<LeadStage | 'all'>('all');

  // 6. Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('aura_crm_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('aura_crm_agent_settings', JSON.stringify(agentSettings));
  }, [agentSettings]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('aura_crm_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('aura_crm_user');
    }
  }, [currentUser]);

  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const login = (user: User) => {
    setCurrentUser(user);
    addToast('success', 'Sesión iniciada', `Bienvenido(a), ${user.name}`);
  };

  const logout = () => {
    setCurrentUser(null);
    addToast('info', 'Sesión cerrada', 'Has salido del CRM de forma segura.');
  };

  // Trigger celebratory confetti when a lead reaches "fue_a_consulta"
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#C084FC', '#A78BFA', '#34D399', '#F472B6']
      });
    } catch {
      // ignore
    }
  };

  const updateLeadStage = (id: string, newStage: LeadStage) => {
    setLeads(prev => prev.map(lead => {
      if (lead.id === id) {
        if (newStage === 'fue_a_consulta' && lead.stage !== 'fue_a_consulta') {
          triggerCelebration();
          addToast('success', '¡Consulta Concretada! 🎉', `${lead.name} asistió a su consulta exitosamente.`);
        } else if (newStage === 'en_cartera') {
          addToast('info', 'Guardado en Cartera 💼', `${lead.name} quedó en seguimiento para nutrición de cartera.`);
        } else if (newStage === 'atendiendo') {
          addToast('info', 'En Atención 💬', `${lead.name} pasó a etapa Atendiendo.`);
        }
        return {
          ...lead,
          stage: newStage,
          updatedAt: new Date().toISOString(),
          lastActivity: 'Cambio de estado a ' + newStage.replace(/_/g, ' ')
        };
      }
      return lead;
    }));
  };

  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'lastActivity' | 'unreadCount' | 'whatsappChat' | 'notes'> & { initialNote?: string }): Lead => {
    const newId = 'lead_' + Date.now();
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newLead: Lead = {
      ...leadData,
      id: newId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      lastActivity: 'Lead registrado',
      unreadCount: 0,
      aiScore: leadData.aiScore || 75,
      whatsappChat: [
        {
          id: 'msg_welcome_' + Date.now(),
          sender: 'bot',
          senderName: agentSettings.botName,
          text: agentSettings.welcomeMessage.replace('{nombre}', leadData.name.split(' ')[0]),
          timestamp: formattedTime,
          status: 'delivered'
        }
      ],
      notes: leadData.initialNote ? [
        {
          id: 'note_' + Date.now(),
          author: currentUser?.name || 'Sistema',
          text: leadData.initialNote,
          date: 'Hoy, ' + formattedTime
        }
      ] : []
    };

    setLeads(prev => [newLead, ...prev]);
    addToast('success', 'Lead Registrado', `${newLead.name} ha sido agregado al CRM en estado ${newLead.stage}.`);
    return newLead;
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(lead => {
      if (lead.id === id) {
        const updated = { ...lead, ...updates, updatedAt: new Date().toISOString() };
        if (selectedLead?.id === id) {
          setSelectedLead(updated);
        }
        return updated;
      }
      return lead;
    }));
  };

  const deleteLead = (id: string) => {
    const leadToDelete = leads.find(l => l.id === id);
    setLeads(prev => prev.filter(l => l.id !== id));
    if (selectedLead?.id === id) setSelectedLead(null);
    if (activeChatLeadId === id) setActiveChatLeadId(null);
    addToast('info', 'Lead Eliminado', `Se eliminó a ${leadToDelete?.name || 'el lead'}.`);
  };

  const addNoteToLead = (leadId: string, text: string) => {
    if (!text.trim()) return;
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newNote: NoteItem = {
      id: 'note_' + Date.now(),
      author: currentUser?.name || 'Asesor CRM',
      text: text.trim(),
      date: 'Hoy, ' + formattedTime
    };

    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        return {
          ...lead,
          notes: [newNote, ...lead.notes],
          updatedAt: now.toISOString(),
          lastActivity: 'Nota agregada por ' + newNote.author
        };
      }
      return lead;
    }));
    addToast('success', 'Nota guardada', 'Nota agregada a la ficha del lead.');
  };

  const toggleLeadBot = (leadId: string) => {
    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        const nextVal = !lead.aiBotEnabled;
        addToast(
          nextVal ? 'success' : 'info',
          nextVal ? 'Agente IA Activado' : 'Modo Humano Activado',
          nextVal 
            ? `${agentSettings.botName} responderá automáticamente a ${lead.name}`
            : `El bot se pausó. Un asesor humano responderá los mensajes.`
        );
        return { ...lead, aiBotEnabled: nextVal };
      }
      return lead;
    }));
  };

  // WhatsApp Messaging Engine
  const sendMessage = async (leadId: string, text: string, senderOverride?: 'agent' | 'lead') => {
    if (!text.trim()) return;
    const targetLead = leads.find(l => l.id === leadId);
    if (!targetLead) return;

    const sender = senderOverride || 'agent';
    const senderName = sender === 'agent' 
      ? (currentUser?.name || 'Asesor WhatsApp') 
      : targetLead.name;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now() + Math.random().toString(36).substr(2, 3),
      sender,
      senderName,
      text: text.trim(),
      timestamp: timeStr,
      status: 'sent'
    };

    // Update state with the new message
    const updatedChat = [...targetLead.whatsappChat, newMsg];
    
    // If sent by human agent, ensure stage changes from 'inicio' to 'atendiendo'
    let nextStage = targetLead.stage;
    if (sender === 'agent' && targetLead.stage === 'inicio') {
      nextStage = 'atendiendo';
    }

    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          stage: nextStage,
          whatsappChat: updatedChat,
          lastActivity: `Mensaje de ${senderName}: "${text.substring(0, 30)}..."`,
          updatedAt: now.toISOString()
        };
      }
      return l;
    }));

    // If the message came from LEAD and bot is enabled, trigger Gemini AI Auto-Reply
    if (sender === 'lead' && targetLead.aiBotEnabled) {
      setAiIsTyping(true);
      try {
        const res = await fetch('/api/gemini/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: updatedChat,
            leadName: targetLead.name,
            service: targetLead.service,
            botSettings: agentSettings,
          })
        });

        const data = await res.json();
        const replyText = data.reply || agentSettings.fallbackMessage;

        setTimeout(() => {
          const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const botMsg: ChatMessage = {
            id: 'bot_msg_' + Date.now(),
            sender: 'bot',
            senderName: agentSettings.botName,
            text: replyText,
            timestamp: botTime,
            status: 'delivered'
          };

          // If bot auto-stage transition is on and stage is 'inicio', move to 'atendiendo'
          let botStage = targetLead.stage;
          if (agentSettings.autoStageTransition && targetLead.stage === 'inicio') {
            botStage = 'atendiendo';
          }

          setLeads(prev2 => prev2.map(l2 => {
            if (l2.id === leadId) {
              return {
                ...l2,
                stage: botStage,
                whatsappChat: [...l2.whatsappChat, botMsg],
                lastActivity: `${agentSettings.botName} respondió: "${replyText.substring(0, 30)}..."`,
                updatedAt: new Date().toISOString()
              };
            }
            return l2;
          }));

          setAiIsTyping(false);
        }, 1200);

      } catch (err) {
        console.error('Error invoking Gemini WhatsApp Bot:', err);
        setAiIsTyping(false);
      }
    }
  };

  // Simulate an incoming patient/client message to test the WhatsApp agent
  const simulateInboundLeadMessage = async (customLead?: Partial<Lead>, customText?: string) => {
    const sampleQuestions = [
      'Hola buenas tardes, ¿cuánto cuesta la consulta de valoración y en qué horarios atienden?',
      'Buenas, me gustaría agendar una cita para esta semana por favor, ¿qué días tienen libres?',
      'Hola, vi su anuncio sobre el tratamiento. ¿Tienen facilidades de pago o meses sin intereses?',
      'Hola Dr., tengo dolor en la zona lumbar desde ayer, ¿tienen espacio para urgencia hoy?',
      'Buenas tardes, quisiera saber si atienden los sábados para chequeo general.'
    ];

    const randomQuestion = customText || sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)];

    let targetLeadId: string;

    if (customLead && customLead.id) {
      targetLeadId = customLead.id;
    } else if (leads.length > 0 && Math.random() > 0.4) {
      // Use existing lead
      targetLeadId = leads[Math.floor(Math.random() * leads.length)].id;
    } else {
      // Create a new simulated lead in "inicio"
      const names = ['Camila Restrepo', 'Santiago Navarro', 'Daniela Mendoza', 'Alejandro Vargas', 'Natalia Gómez'];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomPhone = `+52 55 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`;
      const randomService = agentSettings.servicesCatalog[Math.floor(Math.random() * agentSettings.servicesCatalog.length)];

      const newLead = addLead({
        name: randomName,
        phone: randomPhone,
        email: `${randomName.toLowerCase().replace(' ', '.')}@email.com`,
        stage: 'inicio',
        value: 200,
        service: randomService,
        source: 'whatsapp_direct',
        priority: 'alta',
        aiBotEnabled: true,
        assignedTo: currentUser?.name || 'Sofía Morales',
        tags: ['Nuevo WhatsApp', 'Simulado', randomService.split(' ')[0]],
      });
      targetLeadId = newLead.id;
    }

    setActiveChatLeadId(targetLeadId);
    addToast('info', 'Mensaje de WhatsApp Recibido 📲', `Nuevo mensaje entrante en el chat.`);
    await sendMessage(targetLeadId, randomQuestion, 'lead');
  };

  // Get 3 AI Suggestions for human agent
  const getAiSuggestions = async (leadId: string): Promise<string[]> => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return [];

    try {
      const res = await fetch('/api/gemini/suggest-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: lead.whatsappChat,
          leadName: lead.name,
          service: lead.service
        })
      });
      const data = await res.json();
      return data.suggestions || [
        `¡Hola ${lead.name.split(' ')[0]}! Con gusto te agendamos para esta semana.`,
        `Te comparto nuestra disponibilidad de horarios para tu consulta.`,
        `¿Prefieres horario matutino o vespertino?`
      ];
    } catch {
      return [
        `¡Hola ${lead.name.split(' ')[0]}! Con gusto te agendamos tu consulta de valoración.`,
        `Tenemos citas disponibles jueves y viernes. ¿Te reservo un espacio?`,
        `¿Deseas consulta presencial en nuestras instalaciones o virtual?`
      ];
    }
  };

  // Run AI Summary & Score Analysis on Lead
  const analyzeLeadWithAi = async (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    addToast('info', 'Analizando con IA...', 'Evaluando conversación e interés del lead.');

    try {
      const res = await fetch('/api/gemini/analyze-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatHistory: lead.whatsappChat,
          leadName: lead.name,
          currentStage: lead.stage,
          service: lead.service
        })
      });

      const data = await res.json();
      setLeads(prev => prev.map(l => {
        if (l.id === leadId) {
          return {
            ...l,
            aiScore: data.score || 80,
            aiSummary: data.summary,
            notes: [
              {
                id: 'ai_note_' + Date.now(),
                author: 'Gemini AI Assistant',
                text: `Diagnóstico IA: ${data.summary} Recomedación: ${data.nextAction}`,
                date: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              },
              ...l.notes
            ]
          };
        }
        return l;
      }));

      addToast('success', 'Análisis IA Completado', `Score: ${data.score || 80}/100 - Resumen generado.`);
    } catch {
      addToast('warning', 'Análisis no disponible', 'No se pudo conectar con el servicio de IA.');
    }
  };

  // WhatsApp connection controls
  const toggleWhatsAppConnection = () => {
    setWhatsAppConnection(prev => {
      const nextState = !prev.isConnected;
      addToast(
        nextState ? 'success' : 'warning',
        nextState ? 'WhatsApp Conectado' : 'WhatsApp Desconectado',
        nextState ? 'Sesión de WhatsApp activa y sincronizada.' : 'Sesión de WhatsApp pausada temporalmente.'
      );
      return {
        ...prev,
        isConnected: nextState,
        lastSync: nextState ? 'Justo ahora' : 'Desconectado'
      };
    });
  };

  const reconnectWhatsAppQr = () => {
    setWhatsAppConnection(prev => ({
      ...prev,
      isConnected: false,
      qrCodeToken: 'aura_qr_' + Date.now()
    }));
    addToast('info', 'Nuevo Código QR', 'Escanea el código QR desde tu app de WhatsApp.');
    setTimeout(() => {
      setWhatsAppConnection(prev => ({
        ...prev,
        isConnected: true,
        lastSync: 'Justo ahora'
      }));
      addToast('success', '¡WhatsApp Vinculado!', 'Dispositivo conectado exitosamente.');
    }, 4000);
  };

  const updateAgentSettings = (newSettings: Partial<AgentSettings>) => {
    setAgentSettings(prev => ({ ...prev, ...newSettings }));
    addToast('success', 'Configuración Guardada', 'Los ajustes del Agente IA de WhatsApp han sido actualizados.');
  };

  // Cartera Campaigns
  const sendCampaignBroadcast = async (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    addToast('info', 'Enviando Campaña...', `Transmitiendo a ${campaign.recipientCount} leads en cartera.`);

    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        return { ...c, status: 'enviando' };
      }
      return c;
    }));

    // Simulate sending messages to all leads matching the stage
    setTimeout(() => {
      setCampaigns(prev => prev.map(c => {
        if (c.id === campaignId) {
          return { ...c, status: 'completada', openRate: 88 };
        }
        return c;
      }));

      // Append broadcast message to leads in cartera
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLeads(prev => prev.map(lead => {
        if (lead.stage === campaign.targetStage) {
          const personalizedText = campaign.templateMessage
            .replace('{nombre}', lead.name.split(' ')[0])
            .replace('{servicio}', lead.service);
          
          return {
            ...lead,
            whatsappChat: [
              ...lead.whatsappChat,
              {
                id: 'broadcast_' + Date.now() + Math.random().toString(36).substr(2, 3),
                sender: 'agent',
                senderName: 'Campaña: ' + campaign.name,
                text: personalizedText,
                timestamp: timeStr,
                status: 'delivered'
              }
            ],
            lastActivity: 'Campaña WhatsApp enviada'
          };
        }
        return lead;
      }));

      addToast('success', 'Campaña Enviada 🎉', `Se entregaron los mensajes a los clientes de cartera.`);
    }, 2000);
  };

  const createCampaign = (campaignData: Omit<BroadcastCampaign, 'id' | 'recipientCount' | 'openRate'>) => {
    const count = leads.filter(l => l.stage === campaignData.targetStage).length;
    const newCamp: BroadcastCampaign = {
      ...campaignData,
      id: 'camp_' + Date.now(),
      recipientCount: count || 1,
      openRate: 0
    };
    setCampaigns(prev => [newCamp, ...prev]);
    addToast('success', 'Campaña Creada', `Se programó la campaña "${newCamp.name}".`);
  };

  return (
    <CrmContext.Provider
      value={{
        currentUser,
        users,
        login,
        logout,
        leads,
        selectedLead,
        setSelectedLead,
        addLead,
        updateLead,
        updateLeadStage,
        deleteLead,
        addNoteToLead,
        toggleLeadBot,
        activeChatLeadId,
        setActiveChatLeadId,
        sendMessage,
        simulateInboundLeadMessage,
        aiIsTyping,
        getAiSuggestions,
        analyzeLeadWithAi,
        whatsAppConnection,
        toggleWhatsAppConnection,
        reconnectWhatsAppQr,
        agentSettings,
        updateAgentSettings,
        campaigns,
        sendCampaignBroadcast,
        createCampaign,
        searchQuery,
        setSearchQuery,
        selectedStageFilter,
        setSelectedStageFilter,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = () => {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
};
