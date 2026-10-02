import React, { useState, useEffect, useRef } from 'react';
import { useCrm } from '../../context/CrmContext';
import { LeadStage, ChatMessage } from '../../types/crm';
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  Sparkles, 
  Phone, 
  Calendar, 
  Tag, 
  CheckCheck, 
  Mic, 
  Paperclip, 
  Smile, 
  PlusCircle, 
  Search,
  CheckCircle2,
  Clock,
  Volume2,
  RefreshCw,
  Sliders,
  ChevronRight,
  Info
} from 'lucide-react';

interface WhatsAppChatHubProps {
  onOpenLeadModal: (lead: any) => void;
  onOpenAgentSettings: () => void;
}

export const WhatsAppChatHub: React.FC<WhatsAppChatHubProps> = ({
  onOpenLeadModal,
  onOpenAgentSettings
}) => {
  const { 
    leads, 
    activeChatLeadId, 
    setActiveChatLeadId, 
    sendMessage, 
    aiIsTyping,
    toggleLeadBot,
    updateLeadStage,
    getAiSuggestions,
    simulateInboundLeadMessage,
    agentSettings,
    whatsAppConnection,
    analyzeLeadWithAi
  } = useCrm();

  const [inputMessage, setInputMessage] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeLead = leads.find(l => l.id === activeChatLeadId) || leads[0];

  // Auto scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeLead?.whatsappChat, aiIsTyping]);

  // Load AI Suggestions when active lead changes
  useEffect(() => {
    if (activeLead) {
      setIsLoadingSuggestions(true);
      getAiSuggestions(activeLead.id).then(res => {
        setSuggestions(res);
        setIsLoadingSuggestions(false);
      });
    }
  }, [activeLead?.id]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !activeLead) return;

    const textToSend = inputMessage;
    setInputMessage('');
    await sendMessage(activeLead.id, textToSend, 'agent');
  };

  const handleSendQuickSuggestion = async (suggestionText: string) => {
    if (!activeLead) return;
    await sendMessage(activeLead.id, suggestionText, 'agent');
  };

  // Simulate sending a test message from the patient (to test AI bot behavior)
  const handleSimulatePatientReply = async () => {
    if (!activeLead) return;
    const testMessages = [
      '¿Me confirmas qué día y hora tienen disponible?',
      '¿Cuánto tiempo dura la consulta de valoración?',
      '¿Tienen estacionamiento en la clínica?',
      'Perfecto, me gustaría agendar para el sábado en la mañana.'
    ];
    const msg = testMessages[Math.floor(Math.random() * testMessages.length)];
    await sendMessage(activeLead.id, msg, 'lead');
  };

  const filteredChatLeads = leads.filter(l => 
    l.name.toLowerCase().includes(chatSearch.toLowerCase()) ||
    l.phone.includes(chatSearch) ||
    l.service.toLowerCase().includes(chatSearch.toLowerCase())
  );

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-[#FAF8FE]">
      
      {/* 1. Left List: Active Conversations */}
      <div className="w-80 lg:w-96 bg-white border-r border-purple-100 flex flex-col shrink-0">
        
        {/* Top Header of Chat List */}
        <div className="p-4 border-b border-purple-100 bg-[#FAF8FE]/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900 tracking-tight">Chats de WhatsApp</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                En vivo
              </span>
            </div>
            <button
              onClick={() => simulateInboundLeadMessage()}
              className="p-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold flex items-center gap-1 border border-amber-200 transition-colors"
              title="Simular nuevo mensaje de WhatsApp de un lead"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[11px]">Nuevo Test</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              placeholder="Buscar conversación..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-purple-100 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-purple-400 transition-all"
            />
          </div>
        </div>

        {/* List of Leads / Chats */}
        <div className="flex-1 overflow-y-auto divide-y divide-purple-50">
          {filteredChatLeads.map((lead) => {
            const isActive = lead.id === activeLead?.id;
            const lastMsg = lead.whatsappChat[lead.whatsappChat.length - 1];

            const stageBadges: Record<LeadStage, { label: string; style: string }> = {
              inicio: { label: 'Inicio', style: 'bg-sky-100 text-sky-800 border-sky-200' },
              atendiendo: { label: 'Atendiendo', style: 'bg-amber-100 text-amber-800 border-amber-200' },
              fue_a_consulta: { label: 'Consulta', style: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
              en_cartera: { label: 'En Cartera', style: 'bg-purple-100 text-purple-800 border-purple-200' },
            };

            return (
              <button
                key={lead.id}
                onClick={() => setActiveChatLeadId(lead.id)}
                className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors ${
                  isActive 
                    ? 'bg-purple-50/90 border-l-4 border-l-purple-600' 
                    : 'hover:bg-[#FAF8FE]'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={lead.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.name}`}
                    alt={lead.name}
                    className="w-11 h-11 rounded-full object-cover border border-purple-200"
                  />
                  {lead.aiBotEnabled && (
                    <span 
                      className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[9px] shadow-sm"
                      title="Bot IA activado"
                    >
                      <Bot className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {lead.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {lastMsg ? lastMsg.timestamp : 'Hoy'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 truncate mb-1.5 flex items-center gap-1">
                    {lastMsg ? (
                      <>
                        {lastMsg.sender === 'bot' && <span className="text-purple-600 font-semibold">IA:</span>}
                        {lastMsg.sender === 'agent' && <span className="text-indigo-600 font-semibold">Tú:</span>}
                        <span>{lastMsg.text}</span>
                      </>
                    ) : (
                      'Sin mensajes aún'
                    )}
                  </p>

                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded-md border ${stageBadges[lead.stage].style}`}>
                      {stageBadges[lead.stage].label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
                      {lead.service.split(' ')[0]}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

      </div>

      {/* 2. Center: WhatsApp Live Chat Interface */}
      {activeLead ? (
        <div className="flex-1 flex flex-col h-full bg-[#F5F2F9] overflow-hidden">
          
          {/* Chat Top Bar */}
          <div className="h-16 px-4 lg:px-6 bg-white border-b border-purple-100 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={activeLead.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeLead.name}`}
                alt={activeLead.name}
                className="w-10 h-10 rounded-full object-cover border border-purple-200 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {activeLead.name}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    {activeLead.service}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 flex items-center gap-2">
                  <span className="text-purple-600 font-semibold">{activeLead.phone}</span>
                  <span>•</span>
                  <span>{activeLead.aiBotEnabled ? '🤖 Agente IA respondiendo' : '👤 Modo Asesor Humano'}</span>
                </p>
              </div>
            </div>

            {/* Top Bar Controls: Toggle Bot, Test Message, Change Stage */}
            <div className="flex items-center gap-2">
              
              {/* Bot Mode Switcher */}
              <button
                type="button"
                onClick={() => toggleLeadBot(activeLead.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                  activeLead.aiBotEnabled
                    ? 'bg-purple-600 text-white border-purple-700 shadow-purple-500/20'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Bot className={`w-3.5 h-3.5 ${activeLead.aiBotEnabled ? 'animate-bounce' : ''}`} />
                <span>{activeLead.aiBotEnabled ? 'Bot IA: ACTIVO' : 'Bot IA: PAUSADO'}</span>
              </button>

              {/* Simulate Patient Inbound reply button */}
              <button
                type="button"
                onClick={handleSimulatePatientReply}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-colors"
                title="Simular que el paciente escribe un mensaje por WhatsApp"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Simular Paciente</span>
              </button>

              {/* Open Full Lead Info Modal */}
              <button
                type="button"
                onClick={() => onOpenLeadModal(activeLead)}
                className="p-2 rounded-xl bg-white hover:bg-purple-50 text-slate-600 hover:text-purple-700 border border-purple-100 transition-colors"
                title="Ver ficha completa y agendar consulta"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-3 bg-gradient-to-b from-[#FAF8FD] to-[#F3EFFB]">
            
            {/* Stage Indicator Pill in Chat */}
            <div className="flex justify-center my-2">
              <div className="px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-purple-100 text-[11px] text-slate-600 shadow-sm flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-purple-500" />
                <span>Estado actual: <strong className="text-purple-800 uppercase">{activeLead.stage.replace(/_/g, ' ')}</strong></span>
              </div>
            </div>

            {/* Chat Bubbles */}
            {activeLead.whatsappChat.map((msg) => {
              const isLead = msg.sender === 'lead';
              const isBot = msg.sender === 'bot';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isLead ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3.5 shadow-sm text-xs relative ${
                      isLead
                        ? 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                        : isBot
                        ? 'bg-gradient-to-br from-[#EDE8F9] to-[#E3DCF7] text-purple-950 border border-purple-200 rounded-tr-none'
                        : 'bg-[#7C3AED] text-white rounded-tr-none'
                    }`}
                  >
                    {/* Header of message (Sender tag) */}
                    <div className="flex items-center gap-1.5 mb-1">
                      {isBot && (
                        <span className="text-[10px] font-bold text-purple-700 flex items-center gap-1 bg-purple-200/70 px-1.5 py-0.2 rounded-md">
                          <Bot className="w-2.5 h-2.5" /> {agentSettings.botName}
                        </span>
                      )}
                      {!isLead && !isBot && (
                        <span className="text-[10px] font-bold text-purple-200 flex items-center gap-1">
                          <UserIcon className="w-2.5 h-2.5" /> Asesor Humano
                        </span>
                      )}
                      {isLead && (
                        <span className="text-[10px] font-bold text-slate-600">
                          {activeLead.name}
                        </span>
                      )}
                    </div>

                    {/* Message Body */}
                    <p className="leading-relaxed whitespace-pre-line text-xs">
                      {msg.text}
                    </p>

                    {/* Audio Note Simulator player */}
                    {msg.audioNote && (
                      <div className="mt-2 p-2 rounded-xl bg-purple-100/60 flex items-center gap-2 text-purple-900">
                        <button
                          onClick={() => {
                            setIsPlayingAudio(isPlayingAudio === msg.id ? null : msg.id);
                          }}
                          className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm"
                        >
                          <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio === msg.id ? 'animate-pulse text-amber-300' : ''}`} />
                        </button>
                        <div className="flex-1">
                          <div className="h-1.5 bg-purple-200 rounded-full overflow-hidden">
                            <div className={`h-full bg-purple-600 ${isPlayingAudio === msg.id ? 'w-full transition-all duration-3000' : 'w-1/3'}`} />
                          </div>
                          <span className="text-[10px] font-semibold text-purple-700 block mt-0.5">
                            Nota de Voz ({msg.audioNote.duration})
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Footer Time & Status */}
                    <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isLead ? 'text-slate-400' : isBot ? 'text-purple-600' : 'text-purple-200'}`}>
                      <span>{msg.timestamp}</span>
                      {!isLead && <CheckCheck className="w-3 h-3 text-emerald-400 inline" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* AI is typing indicator */}
            {aiIsTyping && (
              <div className="flex items-center gap-2 text-xs text-purple-600 bg-purple-100/70 py-1.5 px-3 rounded-full w-max animate-pulse">
                <Bot className="w-3.5 h-3.5" />
                <span>{agentSettings.botName} está escribiendo una respuesta...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* AI Suggestions Bar for Human Advisor */}
          <div className="bg-white border-t border-purple-100 px-4 py-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-purple-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                Sugerencias IA con 1 Clic (Gemini):
              </span>
              <button
                onClick={() => {
                  setIsLoadingSuggestions(true);
                  getAiSuggestions(activeLead.id).then(res => {
                    setSuggestions(res);
                    setIsLoadingSuggestions(false);
                  });
                }}
                className="text-[10px] text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingSuggestions ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendQuickSuggestion(sug)}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-[#FAF8FE] hover:bg-purple-100 border border-purple-200 text-xs text-purple-900 font-medium transition-all text-left max-w-xs truncate shadow-xs"
                  title={sug}
                >
                  "{sug}"
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 lg:p-4 bg-white border-t border-purple-100 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Escribe un mensaje de WhatsApp para el paciente..."
              className="flex-1 px-4 py-2.5 bg-[#FAF8FE] border border-purple-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white transition-all shadow-inner"
            />

            {/* Send Button */}
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim()}
              className={`p-2.5 rounded-2xl font-bold transition-all shadow-md flex items-center justify-center ${
                inputMessage.trim()
                  ? 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-purple-500/20'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-[#FAF8FE]">
          <Bot className="w-12 h-12 text-purple-300 mb-3" />
          <h3 className="text-base font-bold text-slate-700">Selecciona una conversación</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            Elige un lead del panel izquierdo para chatear o activar el Agente IA de WhatsApp.
          </p>
        </div>
      )}

      {/* 3. Right Sidebar: Lead Quick Info & Action Panel */}
      {activeLead && (
        <div className="w-72 lg:w-80 bg-white border-l border-purple-100 p-4 lg:p-5 flex flex-col justify-between overflow-y-auto hidden xl:flex">
          <div className="space-y-4">
            
            {/* Profile Avatar & Name */}
            <div className="text-center pb-4 border-b border-purple-100">
              <img
                src={activeLead.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeLead.name}`}
                alt={activeLead.name}
                className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-purple-200 shadow-sm mb-2"
              />
              <h3 className="text-sm font-bold text-slate-900">{activeLead.name}</h3>
              <p className="text-xs text-purple-600 font-medium">{activeLead.phone}</p>
              <span className="text-[11px] text-slate-500">{activeLead.email}</span>
            </div>

            {/* Fast Stage Selector (3 Core Stages + Cartera) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Estado en el CRM:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'inicio', label: '1. Inicio', color: 'hover:bg-sky-50 text-sky-800' },
                  { id: 'atendiendo', label: '2. Atendiendo', color: 'hover:bg-amber-50 text-amber-800' },
                  { id: 'fue_a_consulta', label: '3. Fue a Consulta 🎉', color: 'hover:bg-emerald-50 text-emerald-800' },
                  { id: 'en_cartera', label: '4. En Cartera 💼', color: 'hover:bg-purple-50 text-purple-800' }
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => updateLeadStage(activeLead.id, st.id as LeadStage)}
                    className={`p-2 rounded-xl text-left text-[11px] font-bold border transition-all ${
                      activeLead.stage === st.id
                        ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                        : `bg-[#FAF8FE] border-purple-100 ${st.color}`
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Summary Card & Analyzer */}
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-purple-900 flex items-center gap-1 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Diagnóstico IA
                </span>
                <span className="font-extrabold text-purple-700 bg-purple-200/80 px-2 py-0.2 rounded-md text-[10px]">
                  Score {activeLead.aiScore || 75}%
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {activeLead.aiSummary || 'Lead interesado en valoración médica y consulta esta semana.'}
              </p>
              <button
                type="button"
                onClick={() => analyzeLeadWithAi(activeLead.id)}
                className="mt-2.5 w-full py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-xs"
              >
                <Sparkles className="w-3 h-3" /> Re-analizar Conversación
              </button>
            </div>

            {/* Service & Value Info */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-purple-50">
                <span className="text-slate-400">Servicio:</span>
                <span className="font-bold text-slate-800">{activeLead.service}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-purple-50">
                <span className="text-slate-400">Valor Estimado:</span>
                <span className="font-extrabold text-emerald-600">${activeLead.value}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-purple-50">
                <span className="text-slate-400">Canal de Entrada:</span>
                <span className="font-bold text-slate-800 uppercase text-[10px]">{activeLead.source}</span>
              </div>
            </div>

          </div>

          {/* Full Lead Profile Trigger */}
          <button
            type="button"
            onClick={() => onOpenLeadModal(activeLead)}
            className="w-full mt-4 py-2 rounded-xl bg-[#FAF8FE] hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Ver Ficha y Notas Internas</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};
