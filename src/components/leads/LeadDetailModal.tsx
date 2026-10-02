import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Lead, LeadStage } from '../../types/crm';
import { 
  X, 
  Phone, 
  Mail, 
  Sparkles, 
  MessageSquare, 
  Calendar, 
  DollarSign, 
  Tag, 
  Bot, 
  User as UserIcon, 
  Plus, 
  Save, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
  onOpenChat: (leadId: string) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  onClose,
  onOpenChat
}) => {
  const { updateLead, updateLeadStage, addNoteToLead, analyzeLeadWithAi, toggleLeadBot } = useCrm();

  const [activeTab, setActiveTab] = useState<'info' | 'appointment' | 'notes' | 'chat'>('info');
  const [newNoteText, setNewNoteText] = useState('');
  
  // Editable fields
  const [name, setName] = useState(lead.name);
  const [phone, setPhone] = useState(lead.phone);
  const [email, setEmail] = useState(lead.email);
  const [service, setService] = useState(lead.service);
  const [value, setValue] = useState(lead.value);
  const [stage, setStage] = useState<LeadStage>(lead.stage);
  const [appointmentDate, setAppointmentDate] = useState(lead.appointmentDate || '');
  const [appointmentStatus, setAppointmentStatus] = useState(lead.appointmentStatus || 'pendiente');

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateLead(lead.id, {
      name,
      phone,
      email,
      service,
      value: Number(value),
      appointmentDate: appointmentDate || undefined,
      appointmentStatus: appointmentDate ? (appointmentStatus as any) : undefined
    });
    if (stage !== lead.stage) {
      updateLeadStage(lead.id, stage);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    addNoteToLead(lead.id, newNoteText);
    setNewNoteText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl border border-purple-100 shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="p-5 border-b border-purple-100 bg-gradient-to-r from-[#FAF8FE] via-white to-purple-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={lead.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.name}`}
              alt={lead.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-purple-200 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">{lead.name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  {lead.service}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
                <span className="text-purple-600 font-semibold">{lead.phone}</span>
                <span>•</span>
                <span>Creado: {new Date(lead.createdAt).toLocaleDateString()}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 border-b border-purple-100 bg-[#FAF8FE] text-xs font-bold">
          {[
            { id: 'info', label: 'Datos & Estado' },
            { id: 'appointment', label: 'Cita / Consulta 📅' },
            { id: 'notes', label: `Notas Internas (${lead.notes.length})` },
            { id: 'chat', label: `Chat WhatsApp (${lead.whatsappChat.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-purple-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* TAB 1: INFO & STAGE */}
          {activeTab === 'info' && (
            <form onSubmit={handleSaveInfo} className="space-y-4">
              
              {/* Stage selector (3 core stages + cartera) */}
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
                <label className="block text-xs font-extrabold text-purple-900 mb-2 uppercase tracking-wider">
                  Etapa Actual en el CRM:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'inicio', label: '1. Inicio', color: 'border-sky-300 bg-sky-50 text-sky-800' },
                    { id: 'atendiendo', label: '2. Atendiendo', color: 'border-amber-300 bg-amber-50 text-amber-800' },
                    { id: 'fue_a_consulta', label: '3. Fue a Consulta 🎉', color: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
                    { id: 'en_cartera', label: '4. En Cartera 💼', color: 'border-purple-300 bg-purple-50 text-purple-800' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setStage(st.id as LeadStage)}
                      className={`p-2.5 rounded-xl text-center text-xs font-bold border transition-all ${
                        stage === st.id
                          ? 'bg-purple-600 text-white border-purple-700 shadow-md ring-2 ring-purple-300'
                          : `bg-white ${st.color} hover:bg-purple-100/50`
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Diagnóstico & Score Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FAF8FE] to-[#F3EFFB] border border-purple-100 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-slate-800">Evaluación Inteligente de Lead</span>
                    <span className="text-[10px] font-bold px-2 py-0.2 bg-purple-200 text-purple-800 rounded-md">
                      Score: {lead.aiScore || 75}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {lead.aiSummary || 'Lead altamente calificado con intenciones de agendar cita.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => analyzeLeadWithAi(lead.id)}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Re-analizar</span>
                </button>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Servicio de Interés</label>
                  <input
                    type="text"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Valor Estimado ($)</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Modo Agente de WhatsApp</label>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => toggleLeadBot(lead.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                        lead.aiBotEnabled
                          ? 'bg-purple-100 text-purple-800 border-purple-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>{lead.aiBotEnabled ? 'Bot IA Activado' : 'Asesor Humano'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/20 transition-all flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: APPOINTMENT / CONSULTATION */}
          {activeTab === 'appointment' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#FAF8FE] border border-purple-100">
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  Programar o Confirmar Consulta Médica / Cita
                </h4>
                <p className="text-slate-500 mb-4">
                  Al agendar la cita, el lead puede ser marcado en estado "Atendiendo" y al asistir, pasar a "Fue a Consulta".
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Fecha y Hora de Consulta</label>
                    <input
                      type="datetime-local"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-purple-200 focus:border-purple-500 outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Estado de la Cita</label>
                    <select
                      value={appointmentStatus}
                      onChange={(e) => setAppointmentStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2 rounded-xl border border-purple-200 focus:border-purple-500 outline-none text-xs"
                    >
                      <option value="pendiente">Pendiente de Confirmación</option>
                      <option value="confirmada">Confirmada por el Paciente</option>
                      <option value="asistio">Asistió (Fue a Consulta)</option>
                      <option value="reprogramada">Reprogramada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      updateLead(lead.id, {
                        appointmentDate: appointmentDate || undefined,
                        appointmentStatus: appointmentDate ? (appointmentStatus as any) : undefined
                      });
                      if (appointmentStatus === 'asistio') {
                        updateLeadStage(lead.id, 'fue_a_consulta');
                      }
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Guardar Cita</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenChat(lead.id);
                    }}
                    className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Enviar Confirmación por WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INTERNAL NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4 text-xs">
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Escribe una nota interna para este lead..."
                  className="flex-1 px-4 py-2 bg-[#FAF8FE] border border-purple-200 rounded-xl focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar</span>
                </button>
              </form>

              <div className="space-y-2">
                {lead.notes.length === 0 ? (
                  <p className="text-center py-6 text-slate-400">No hay notas registradas para este lead.</p>
                ) : (
                  lead.notes.map((note) => (
                    <div key={note.id} className="p-3 rounded-xl bg-purple-50/50 border border-purple-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-purple-900">{note.author}</span>
                        <span className="text-[10px] text-slate-400">{note.date}</span>
                      </div>
                      <p className="text-slate-700">{note.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CHAT PREVIEW */}
          {activeTab === 'chat' && (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-purple-100">
                <span className="font-bold text-slate-700">Historial reciente de WhatsApp</span>
                <button
                  onClick={() => {
                    onClose();
                    onOpenChat(lead.id);
                  }}
                  className="text-purple-600 hover:text-purple-800 font-bold flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Abrir en WhatsApp Hub</span>
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 p-3 bg-[#FAF8FE] rounded-2xl border border-purple-100">
                {lead.whatsappChat.map((m) => (
                  <div
                    key={m.id}
                    className={`p-2.5 rounded-xl max-w-[80%] ${
                      m.sender === 'lead'
                        ? 'bg-white border border-slate-200 mr-auto'
                        : m.sender === 'bot'
                        ? 'bg-purple-100 text-purple-950 ml-auto'
                        : 'bg-purple-600 text-white ml-auto'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] opacity-75 mb-0.5">
                      <span>{m.senderName}</span>
                      <span>{m.timestamp}</span>
                    </div>
                    <p>{m.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
