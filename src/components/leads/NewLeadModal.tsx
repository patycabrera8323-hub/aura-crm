import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { LeadStage, LeadSource, LeadPriority } from '../../types/crm';
import { X, UserPlus, Phone, Mail, DollarSign, Tag, Sparkles } from 'lucide-react';

interface NewLeadModalProps {
  onClose: () => void;
  onOpenChat: (leadId: string) => void;
}

export const NewLeadModal: React.FC<NewLeadModalProps> = ({ onClose, onOpenChat }) => {
  const { addLead, agentSettings, currentUser } = useCrm();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+52 55 ');
  const [email, setEmail] = useState('');
  const [service, setService] = useState(agentSettings.servicesCatalog[0] || 'Dermatología & Tratamientos Faciales');
  const [value, setValue] = useState(150);
  const [stage, setStage] = useState<LeadStage>('inicio');
  const [source, setSource] = useState<LeadSource>('whatsapp_direct');
  const [priority, setPriority] = useState<LeadPriority>('media');
  const [initialNote, setInitialNote] = useState('');
  const [enableBot, setEnableBot] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const createdLead = addLead({
      name,
      phone,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      service,
      value: Number(value),
      stage,
      source,
      priority,
      aiBotEnabled: enableBot,
      assignedTo: currentUser?.name || 'Asesor WhatsApp',
      tags: ['Manual', service.split(' ')[0]],
      initialNote: initialNote.trim() || undefined,
    });

    onClose();
    onOpenChat(createdLead.id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl border border-purple-100 shadow-2xl max-w-xl w-full overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-purple-100 bg-gradient-to-r from-purple-50 via-white to-purple-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Registrar Nuevo Lead</h3>
              <p className="text-xs text-slate-500">Captura un prospecto manual o entrante para iniciar seguimiento.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Stage selection: 3 states + cartera */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
              Estado Inicial en el Embudo:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'inicio', label: '1. Inicio' },
                { id: 'atendiendo', label: '2. Atendiendo' },
                { id: 'fue_a_consulta', label: '3. Fue a Consulta' },
                { id: 'en_cartera', label: '4. En Cartera' },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStage(st.id as LeadStage)}
                  className={`py-2 px-2 rounded-xl font-bold border transition-all text-center ${
                    stage === st.id
                      ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                      : 'bg-[#FAF8FE] border-purple-100 text-slate-700 hover:bg-purple-50'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nombre Completo *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Ana Lucía Morales"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">WhatsApp / Celular *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+52 55 1234 5678"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Correo Electrónico (Opcional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ana.lucia@correo.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Servicio de Interés</label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-xs"
              >
                {agentSettings.servicesCatalog.map((srv, idx) => (
                  <option key={idx} value={srv}>{srv}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Valor Estimado ($ USD)</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Canal de Origen</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-xs"
              >
                <option value="whatsapp_direct">WhatsApp Directo</option>
                <option value="meta_ads">Meta Ads (Facebook / Instagram)</option>
                <option value="webhook">Webhook API</option>
                <option value="website_form">Formulario Web</option>
                <option value="referral">Referido / Recomendado</option>
                <option value="manual">Manual / Recepción</option>
              </select>
            </div>
          </div>

          {/* Initial Note */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nota Inicial o Motivo de Consulta</label>
            <textarea
              rows={2}
              value={initialNote}
              onChange={(e) => setInitialNote(e.target.value)}
              placeholder="Ej. Preguntó por precios de valoración para este fin de semana..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-xs"
            />
          </div>

          {/* AI Bot Toggle */}
          <div className="p-3 rounded-2xl bg-purple-50/80 border border-purple-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <div>
                <span className="font-bold text-purple-950 block">Activar Agente IA de WhatsApp</span>
                <span className="text-[10px] text-purple-600">El bot responderá automáticamente si el lead escribe.</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={enableBot}
              onChange={(e) => setEnableBot(e.target.checked)}
              className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold rounded-xl shadow-md shadow-purple-500/20 transition-all flex items-center gap-1.5"
            >
              <span>Guardar y Abrir WhatsApp</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
