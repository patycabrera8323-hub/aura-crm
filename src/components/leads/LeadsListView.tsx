import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Lead, LeadStage } from '../../types/crm';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  MessageSquare, 
  Bot, 
  Calendar, 
  Phone, 
  Mail, 
  Tag, 
  CheckCircle2, 
  Clock, 
  Trash2,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface LeadsListViewProps {
  onSelectLead: (lead: Lead) => void;
  onOpenNewLeadModal: () => void;
  onOpenChatWithLead: (leadId: string) => void;
}

export const LeadsListView: React.FC<LeadsListViewProps> = ({
  onSelectLead,
  onOpenNewLeadModal,
  onOpenChatWithLead
}) => {
  const { leads, updateLeadStage, deleteLead, searchQuery, setSearchQuery, selectedStageFilter, setSelectedStageFilter, addToast } = useCrm();
  const [selectedService, setSelectedService] = useState<string>('all');

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.service.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStage = selectedStageFilter === 'all' || lead.stage === selectedStageFilter;
    const matchesService = selectedService === 'all' || lead.service === selectedService;

    return matchesSearch && matchesStage && matchesService;
  });

  const exportCsv = () => {
    const headers = ['ID', 'Nombre', 'Teléfono', 'Email', 'Estado', 'Servicio', 'Valor ($)', 'Origen', 'Prioridad', 'Score IA', 'Fecha Creación'];
    const rows = filteredLeads.map(l => [
      l.id,
      `"${l.name}"`,
      `"${l.phone}"`,
      `"${l.email}"`,
      `"${l.stage}"`,
      `"${l.service}"`,
      l.value,
      `"${l.source}"`,
      `"${l.priority}"`,
      l.aiScore || 0,
      `"${l.createdAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aura_crm_leads_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Archivo CSV Exportado', `Se descargaron ${filteredLeads.length} leads.`);
  };

  const stageBadges: Record<LeadStage, { label: string; style: string }> = {
    inicio: { label: '1. Inicio', style: 'bg-sky-100 text-sky-800 border-sky-200' },
    atendiendo: { label: '2. Atendiendo', style: 'bg-amber-100 text-amber-800 border-amber-200' },
    fue_a_consulta: { label: '3. Fue a Consulta 🎉', style: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    en_cartera: { label: '4. En Cartera 💼', style: 'bg-purple-100 text-purple-800 border-purple-200' },
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-4 lg:p-6 bg-[#FAF8FE]">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Directorio Completo de Leads</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualiza, filtra y administra todos los contactos capturados por WhatsApp y canales digitales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-800 border border-purple-200 text-xs font-bold transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={onOpenNewLeadModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white text-xs font-bold rounded-xl shadow-md shadow-purple-500/20 hover:shadow-purple-500/30 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Lead</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-3 rounded-2xl border border-purple-100 shadow-sm flex flex-wrap items-center justify-between gap-3 mb-4">
        
        {/* Stage Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Estado:</span>
          {(['all', 'inicio', 'atendiendo', 'fue_a_consulta', 'en_cartera'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStageFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs shrink-0 ${
                selectedStageFilter === st
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-[#FAF8FE] text-slate-600 hover:bg-purple-50 border border-purple-100'
              }`}
            >
              {st === 'all' ? `Todos (${leads.length})` : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Count summary */}
        <div className="text-xs text-slate-500 font-medium">
          Mostrando <strong className="text-purple-700">{filteredLeads.length}</strong> de {leads.length} leads
        </div>

      </div>

      {/* Table Container */}
      <div className="flex-1 bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-purple-100 bg-[#FAF8FE] text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Lead / Paciente</th>
                <th className="py-3.5 px-4">Estado (3 Claves + Cartera)</th>
                <th className="py-3.5 px-4">Servicio de Interés</th>
                <th className="py-3.5 px-4">Valor Estimado</th>
                <th className="py-3.5 px-4">IA Score</th>
                <th className="py-3.5 px-4">Última Actividad</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 text-xs">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No se encontraron leads con los filtros actuales.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className="hover:bg-purple-50/50 transition-colors cursor-pointer group"
                    >
                      {/* Name & Contact */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={lead.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.name}`}
                            alt={lead.name}
                            className="w-9 h-9 rounded-full object-cover border border-purple-200"
                          />
                          <div>
                            <span className="font-bold text-slate-900 group-hover:text-purple-700 block">
                              {lead.name}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                              <span>{lead.phone}</span>
                              <span>•</span>
                              <span>{lead.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Stage Selector */}
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={lead.stage}
                          onChange={(e) => updateLeadStage(lead.id, e.target.value as LeadStage)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-xl border outline-none cursor-pointer ${stageBadges[lead.stage].style}`}
                        >
                          <option value="inicio">1. Inicio</option>
                          <option value="atendiendo">2. Atendiendo</option>
                          <option value="fue_a_consulta">3. Fue a Consulta</option>
                          <option value="en_cartera">4. En Cartera</option>
                        </select>
                      </td>

                      {/* Service */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-700 block truncate max-w-[180px]">
                          {lead.service}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase">{lead.source}</span>
                      </td>

                      {/* Value */}
                      <td className="py-3 px-4 font-bold text-emerald-600">
                        ${lead.value}
                      </td>

                      {/* AI Score */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-10 bg-purple-100 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-purple-600 h-full rounded-full"
                              style={{ width: `${lead.aiScore || 70}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-purple-800">{lead.aiScore || 70}%</span>
                        </div>
                      </td>

                      {/* Last Activity */}
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {lead.lastActivity}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenChatWithLead(lead.id)}
                            className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                            title="Abrir WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onSelectLead(lead)}
                            className="p-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors"
                            title="Ver Ficha Completa"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteLead(lead.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                            title="Eliminar Lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
