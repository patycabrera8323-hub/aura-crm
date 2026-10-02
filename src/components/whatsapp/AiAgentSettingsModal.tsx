import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { AgentSettings } from '../../types/crm';
import { 
  X, 
  Bot, 
  Sparkles, 
  Save, 
  Settings, 
  Clock, 
  MapPin, 
  DollarSign, 
  Plus, 
  Trash2,
  Sliders,
  CheckCircle2
} from 'lucide-react';

interface AiAgentSettingsModalProps {
  onClose: () => void;
}

export const AiAgentSettingsModal: React.FC<AiAgentSettingsModalProps> = ({ onClose }) => {
  const { agentSettings, updateAgentSettings, addToast } = useCrm();

  const [botName, setBotName] = useState(agentSettings.botName);
  const [businessName, setBusinessName] = useState(agentSettings.businessName);
  const [businessType, setBusinessType] = useState(agentSettings.businessType);
  const [tone, setTone] = useState(agentSettings.tone);
  const [customPrompt, setCustomPrompt] = useState(agentSettings.customPrompt);
  const [welcomeMessage, setWelcomeMessage] = useState(agentSettings.welcomeMessage);
  const [consultationPrice, setConsultationPrice] = useState(agentSettings.consultationPrice);
  const [locationAddress, setLocationAddress] = useState(agentSettings.locationAddress);
  const [autoStageTransition, setAutoStageTransition] = useState(agentSettings.autoStageTransition);
  const [autoAppointmentBooking, setAutoAppointmentBooking] = useState(agentSettings.autoAppointmentBooking);
  const [servicesCatalog, setServicesCatalog] = useState<string[]>(agentSettings.servicesCatalog);
  const [newServiceInput, setNewServiceInput] = useState('');

  const handleAddService = () => {
    if (!newServiceInput.trim()) return;
    setServicesCatalog(prev => [...prev, newServiceInput.trim()]);
    setNewServiceInput('');
  };

  const handleRemoveService = (index: number) => {
    setServicesCatalog(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAgentSettings({
      botName,
      businessName,
      businessType,
      tone,
      customPrompt,
      welcomeMessage,
      consultationPrice,
      locationAddress,
      autoStageTransition,
      autoAppointmentBooking,
      servicesCatalog
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl border border-purple-100 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-purple-100 bg-gradient-to-r from-purple-50 via-white to-purple-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                Configuración del Agente IA de WhatsApp
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  Gemini Flash
                </span>
              </h3>
              <p className="text-xs text-slate-500">Personaliza la personalidad, tono, catálogo y reglas de agendamiento.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nombre del Asistente Virtual</label>
              <input
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nombre de la Clínica / Empresa</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tono de Comunicación</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-purple-500 outline-none"
              >
                <option value="empatico_medico">Médico & Empático (Recomendado Salud)</option>
                <option value="comercial_persuasivo">Comercial & Persuasivo (Ventas y Cierre)</option>
                <option value="formal_profesional">Formal & Ejecutivo</option>
                <option value="cercano_amigable">Cálido, Cercano & Amigable</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Costo de Consulta / Tarifa Base</label>
              <input
                type="text"
                value={consultationPrice}
                onChange={(e) => setConsultationPrice(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-purple-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Dirección / Ubicación Física</label>
            <input
              type="text"
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-purple-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Mensaje de Bienvenida Automático</label>
            <textarea
              rows={2}
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-purple-500 outline-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Instrucciones Específicas / Prompt del Bot IA
            </label>
            <textarea
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Ej. Responde con calidez. Si el paciente pregunta por tiempos de recuperación, indícale que depende del tratamiento pero usualmente son 48 horas..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-purple-500 outline-none leading-relaxed"
            />
          </div>

          {/* Service Catalog List */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Catálogo de Servicios y Especialidades</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newServiceInput}
                onChange={(e) => setNewServiceInput(e.target.value)}
                placeholder="Agregar especialidad o tratamiento..."
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={handleAddService}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-[#FAF8FE] rounded-xl border border-purple-100">
              {servicesCatalog.map((srv, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-purple-200 rounded-lg text-slate-800 font-semibold text-[11px]"
                >
                  <span>{srv}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveService(idx)}
                    className="text-slate-400 hover:text-rose-500 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Auto Stage Transitions */}
          <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-2">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-bold text-purple-900 block">Auto-cambio de Estado a "Atendiendo"</span>
                <span className="text-[11px] text-purple-700">Mueve automáticamente de "Inicio" a "Atendiendo" al responder.</span>
              </div>
              <input
                type="checkbox"
                checked={autoStageTransition}
                onChange={(e) => setAutoStageTransition(e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-purple-100">
              <div>
                <span className="font-bold text-purple-900 block">Sugerir Agendamiento de Consulta</span>
                <span className="text-[11px] text-purple-700">El bot ofrece activamente 2 opciones de fecha y horario libre.</span>
              </div>
              <input
                type="checkbox"
                checked={autoAppointmentBooking}
                onChange={(e) => setAutoAppointmentBooking(e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Footer Save Button */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold rounded-xl shadow-md shadow-purple-500/20 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Configuración</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
