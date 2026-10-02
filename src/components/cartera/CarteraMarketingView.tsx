import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Lead } from '../../types/crm';
import { 
  Briefcase, 
  Sparkles, 
  Send, 
  Plus, 
  MessageSquare, 
  Calendar, 
  DollarSign, 
  Users, 
  Flame, 
  Clock, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';

interface CarteraMarketingViewProps {
  onSelectLead: (lead: Lead) => void;
  onOpenChat: (leadId: string) => void;
}

export const CarteraMarketingView: React.FC<CarteraMarketingViewProps> = ({
  onSelectLead,
  onOpenChat
}) => {
  const { leads, campaigns, sendCampaignBroadcast, createCampaign, updateLeadStage, addToast } = useCrm();

  const leadsInCartera = leads.filter(l => l.stage === 'en_cartera');
  const totalValueInCartera = leadsInCartera.reduce((acc, curr) => acc + (curr.value || 0), 0);

  const [newCampaignName, setNewCampaignName] = useState('');
  const [templateText, setTemplateText] = useState(
    '¡Hola {nombre}! 💜 En Clínica Aura recordamos tu interés en {servicio}. Este mes tenemos un 25% de descuento en tu consulta de valoración. ¿Te gustaría apartar tu cita esta semana? 🩺✨'
  );
  const [isGeneratingAiTemplate, setIsGeneratingAiTemplate] = useState(false);

  const handleGenerateAiTemplate = async (theme: string) => {
    setIsGeneratingAiTemplate(true);
    setTimeout(() => {
      if (theme === 'descuento') {
        setTemplateText('¡Hola {nombre}! 🌸 Tenemos una promoción exclusiva de temporada: 30% de descuento en tu primera sesión de {servicio}. ¿Te gustaría que te reservemos cupo para el fin de semana?');
      } else if (theme === 'seguimiento') {
        setTemplateText('Hola {nombre}, un gusto saludarte nuevamente de Clínica Aura. ¿Cómo sigues? Nos encantaría apoyarte con tu tratamiento de {servicio}. ¿Tienes unos minutos para agendar tu consulta? 😊');
      } else {
        setTemplateText('¡Hola {nombre}! 🩺 Te escribimos de Clínica Aura. Abrimos nuevos horarios vespertinos para {servicio}. ¿Te gustaría apartar tu valoración médica esta semana?');
      }
      setIsGeneratingAiTemplate(false);
      addToast('success', 'Plantilla IA Generada', 'Mensaje optimizado para WhatsApp con placeholders dinámicos.');
    }, 600);
  };

  const handleCreateAndSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName.trim()) return;

    createCampaign({
      name: newCampaignName.trim(),
      targetStage: 'en_cartera',
      templateMessage: templateText,
      scheduledDate: new Date().toISOString().slice(0, 10),
      status: 'borrador'
    });

    setNewCampaignName('');
  };

  return (
    <div className="w-full flex flex-col p-4 lg:p-6 bg-[#FAF8FE] space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Gestión de Cartera & Remarketing</h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
              {leadsInCartera.length} Leads en Cartera
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Estrategias de recontacto por WhatsApp para convertir pacientes interesados en consultas confirmadas.
          </p>
        </div>

        {/* Total Cartera Value Card */}
        <div className="bg-white px-4 py-2.5 rounded-2xl border border-purple-100 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Valor Potencial en Cartera</span>
            <span className="text-base font-extrabold text-slate-900">${totalValueInCartera} USD</span>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto pb-4">
        
        {/* Left 7 Columns: Leads in Cartera list */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl border border-purple-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                Pacientes / Leads en Cartera Activa ({leadsInCartera.length})
              </h3>
              <span className="text-xs text-slate-400">Listos para recontacto</span>
            </div>

            {leadsInCartera.length === 0 ? (
              <div className="p-8 text-center text-slate-400 border-2 border-dashed border-purple-100 rounded-2xl">
                <Briefcase className="w-10 h-10 text-purple-200 mx-auto mb-2" />
                <p className="font-bold text-slate-700 text-xs">No hay leads en cartera actualmente</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Mueve leads desde el Tablero Kanban a la etapa "En Cartera" para programarles campañas.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {leadsInCartera.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className="p-3.5 rounded-2xl bg-[#FAF8FE] border border-purple-100 hover:border-purple-300 hover:bg-purple-50/50 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={lead.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.name}`}
                        alt={lead.name}
                        className="w-10 h-10 rounded-full object-cover border border-purple-200"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-purple-700">
                          {lead.name}
                        </h4>
                        <p className="text-[11px] text-purple-600 font-semibold truncate">{lead.service}</p>
                        <p className="text-[10px] text-slate-400">{lead.phone} • {lead.lastActivity}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-extrabold text-emerald-600 text-xs">${lead.value}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateLeadStage(lead.id, 'atendiendo');
                          onOpenChat(lead.id);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] transition-colors flex items-center gap-1"
                        title="Reactivar conversación en WhatsApp"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Reactivar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Columns: Campaign Broadcast Creator */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Campaign Wizard Card */}
          <div className="bg-white rounded-3xl border border-purple-100 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Crear Campaña de WhatsApp</h3>
                <p className="text-[11px] text-slate-500">Envío masivo personalizado para leads en cartera.</p>
              </div>
            </div>

            {/* Quick AI Template Buttons */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                Generar Mensaje con IA:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleGenerateAiTemplate('descuento')}
                  className="px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-[10px] border border-purple-200"
                >
                  🎁 Promoción 30%
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerateAiTemplate('seguimiento')}
                  className="px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-[10px] border border-purple-200"
                >
                  🩺 Chequeo Preventivo
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerateAiTemplate('urgencia')}
                  className="px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-[10px] border border-purple-200"
                >
                  ⏰ Nuevos Horarios
                </button>
              </div>
            </div>

            {/* Campaign Form */}
            <form onSubmit={handleCreateAndSend} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre de la Campaña</label>
                <input
                  type="text"
                  required
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  placeholder="Ej. Recontacto Promoción Fin de Mes"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Plantilla de WhatsApp Personalizada</label>
                <textarea
                  rows={4}
                  required
                  value={templateText}
                  onChange={(e) => setTemplateText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-purple-500 outline-none leading-relaxed text-xs"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Variables dinámicas: <strong className="text-purple-600">{'{nombre}'}</strong>, <strong className="text-purple-600">{'{servicio}'}</strong>
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white font-bold rounded-xl shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-1.5 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Programar Campaña de Cartera</span>
              </button>
            </form>
          </div>

          {/* Active Campaigns List */}
          <div className="bg-white rounded-3xl border border-purple-100 p-5 shadow-sm space-y-3">
            <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
              Historial de Campañas
            </h4>
            <div className="space-y-2">
              {campaigns.map((camp) => (
                <div key={camp.id} className="p-3 rounded-2xl bg-[#FAF8FE] border border-purple-100 flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <h5 className="font-bold text-slate-900 truncate">{camp.name}</h5>
                    <p className="text-[10px] text-slate-500 truncate">{camp.recipientCount} destinatarios • {camp.scheduledDate}</p>
                  </div>

                  <div className="shrink-0">
                    {camp.status === 'completada' ? (
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Enviada ({camp.openRate}%)
                      </span>
                    ) : camp.status === 'enviando' ? (
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Enviando...
                      </span>
                    ) : (
                      <button
                        onClick={() => sendCampaignBroadcast(camp.id)}
                        className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" /> Transmitir
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
