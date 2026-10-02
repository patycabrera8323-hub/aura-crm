import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Lead, LeadStage } from '../../types/crm';
import { 
  MessageSquare, 
  Bot, 
  User as UserIcon, 
  Calendar, 
  DollarSign, 
  Sparkles, 
  ArrowRight, 
  Plus, 
  Flame,
  Phone,
  Tag,
  CheckCircle2
} from 'lucide-react';

interface PipelineKanbanProps {
  onSelectLead: (lead: Lead) => void;
  onOpenNewLeadModal: () => void;
  onOpenChatWithLead: (leadId: string) => void;
}

interface ColumnConfig {
  id: LeadStage;
  title: string;
  stepNumber: number;
  description: string;
  bgPastel: string;
  borderColor: string;
  headerBadgeBg: string;
  headerBadgeText: string;
  accentColor: string;
  emptyStateText: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: 'inicio',
    title: '1. Inicio',
    stepNumber: 1,
    description: 'Leads nuevos por WhatsApp o Webhook',
    bgPastel: 'bg-[#F4F8FF]/80',
    borderColor: 'border-sky-200/80',
    headerBadgeBg: 'bg-sky-100',
    headerBadgeText: 'text-sky-800',
    accentColor: '#38BDF8',
    emptyStateText: 'No hay leads nuevos en espera.'
  },
  {
    id: 'atendiendo',
    title: '2. Atendiendo',
    stepNumber: 2,
    description: 'En conversación activa (IA o Asesor)',
    bgPastel: 'bg-[#FEFCE8]/70',
    borderColor: 'border-amber-200/80',
    headerBadgeBg: 'bg-amber-100',
    headerBadgeText: 'text-amber-800',
    accentColor: '#FBBF24',
    emptyStateText: 'Ningún lead siendo atendido actualmente.'
  },
  {
    id: 'fue_a_consulta',
    title: '3. Fue a Consulta',
    stepNumber: 3,
    description: 'Asistió a su cita o consulta ganada',
    bgPastel: 'bg-[#ECFDF5]/80',
    borderColor: 'border-emerald-200/80',
    headerBadgeBg: 'bg-emerald-100',
    headerBadgeText: 'text-emerald-800',
    accentColor: '#34D399',
    emptyStateText: 'Aún no hay consultas registradas en este periodo.'
  },
  {
    id: 'en_cartera',
    title: '4. En Cartera',
    stepNumber: 4,
    description: 'Seguimiento futuro & remarketing',
    bgPastel: 'bg-[#FAF5FF]/80',
    borderColor: 'border-purple-200/80',
    headerBadgeBg: 'bg-purple-100',
    headerBadgeText: 'text-purple-800',
    accentColor: '#A855F7',
    emptyStateText: 'No hay leads guardados en cartera.'
  }
];

export const PipelineKanban: React.FC<PipelineKanbanProps> = ({
  onSelectLead,
  onOpenNewLeadModal,
  onOpenChatWithLead
}) => {
  const { 
    leads, 
    updateLeadStage, 
    searchQuery, 
    toggleLeadBot,
    selectedStageFilter,
    setSelectedStageFilter 
  } = useCrm();

  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<LeadStage | null>(null);

  // Filter leads by search query and stage filter
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStage = selectedStageFilter === 'all' || lead.stage === selectedStageFilter;
    return matchesSearch && matchesStage;
  });

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
    setDraggedLeadId(leadId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: LeadStage) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStage: LeadStage) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (leadId) {
      updateLeadStage(leadId, targetStage);
    }
    setDraggedLeadId(null);
    setDragOverColumn(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 lg:p-6 bg-[#FAF8FE]">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Embudo de Leads & Consultas
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
              3 Estados Clave + Cartera
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Arrastra las tarjetas o usa los botones rápidos para mover el paciente a través de cada etapa.
          </p>
        </div>

        {/* Stage Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-purple-100 shadow-sm text-xs">
          <button
            onClick={() => setSelectedStageFilter('all')}
            className={`px-3 py-1 rounded-xl font-semibold transition-all ${
              selectedStageFilter === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-purple-700'
            }`}
          >
            Todos ({leads.length})
          </button>
          {COLUMNS.map(col => {
            const count = leads.filter(l => l.stage === col.id).length;
            return (
              <button
                key={col.id}
                onClick={() => setSelectedStageFilter(col.id)}
                className={`px-2.5 py-1 rounded-xl font-semibold transition-all hidden md:inline-flex items-center gap-1 ${
                  selectedStageFilter === col.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-purple-700'
                }`}
              >
                <span>{col.title.split('. ')[1]}</span>
                <span className="text-[10px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Pastel Columns Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 overflow-y-auto xl:overflow-x-auto pb-4">
        {COLUMNS.map((column) => {
          const columnLeads = filteredLeads.filter(l => l.stage === column.id);
          const columnTotalValue = columnLeads.reduce((acc, curr) => acc + (curr.value || 0), 0);
          const isDragTarget = dragOverColumn === column.id;

          return (
            <div
              key={column.id}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
              className={`flex flex-col rounded-3xl border transition-all duration-200 min-h-[500px] xl:min-h-full ${
                column.bgPastel
              } ${
                isDragTarget 
                  ? 'border-purple-500 ring-2 ring-purple-300 shadow-xl bg-purple-50/90 scale-[1.01]' 
                  : column.borderColor
              }`}
            >
              {/* Column Header */}
              <div className="p-4 border-b border-white/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${column.headerBadgeBg} ${column.headerBadgeText}`}>
                      {column.title}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {columnLeads.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{column.description}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase">Valor Est.</span>
                  <span className="text-xs font-extrabold text-slate-800">${columnTotalValue}</span>
                </div>
              </div>

              {/* Cards Container */}
              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {columnLeads.length === 0 ? (
                  <div className="h-40 border-2 border-dashed border-slate-200/80 rounded-2xl flex flex-col items-center justify-center text-center p-4 text-slate-400">
                    <p className="text-xs">{column.emptyStateText}</p>
                    {column.id === 'inicio' && (
                      <button
                        onClick={onOpenNewLeadModal}
                        className="mt-2 text-[11px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Agregar Lead
                      </button>
                    )}
                  </div>
                ) : (
                  columnLeads.map((lead) => {
                    const isUrgent = lead.priority === 'urgente' || lead.priority === 'alta';
                    const lastMessage = lead.whatsappChat[lead.whatsappChat.length - 1];

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onClick={() => onSelectLead(lead)}
                        className="group bg-white rounded-2xl p-3.5 border border-purple-100 shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-150 cursor-grab active:cursor-grabbing space-y-3 relative overflow-hidden"
                      >
                        {/* Priority indicator strip */}
                        {isUrgent && (
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 to-amber-400" />
                        )}

                        {/* Top: Avatar, Name & AI Score */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={lead.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.name}`}
                              alt={lead.name}
                              className="w-9 h-9 rounded-full object-cover border border-purple-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-purple-700 transition-colors">
                                {lead.name}
                              </h4>
                              <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                                <Phone className="w-2.5 h-2.5 text-purple-500" /> {lead.phone}
                              </p>
                            </div>
                          </div>

                          {/* AI Score Badge */}
                          {lead.aiScore !== undefined && (
                            <div 
                              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-50 border border-purple-100 text-[10px] font-bold text-purple-700"
                              title={`Score de probabilidad de consulta: ${lead.aiScore}%`}
                            >
                              <Sparkles className="w-2.5 h-2.5 text-purple-500" />
                              <span>{lead.aiScore}%</span>
                            </div>
                          )}
                        </div>

                        {/* Service & Value */}
                        <div className="bg-[#FAF8FE] rounded-xl p-2 border border-purple-50 flex items-center justify-between text-xs">
                          <div className="min-w-0 pr-2">
                            <span className="text-[10px] text-purple-500 font-semibold block uppercase">Servicio de Interés</span>
                            <span className="font-bold text-slate-800 text-[11px] truncate block">{lead.service}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[10px] text-slate-400 font-medium block">Valor</span>
                            <span className="font-extrabold text-emerald-600 text-[11px]">${lead.value}</span>
                          </div>
                        </div>

                        {/* Appointment Highlight if in 'atendiendo' or 'fue_a_consulta' */}
                        {lead.appointmentDate && (
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-700 bg-purple-50/80 px-2.5 py-1 rounded-xl border border-purple-100">
                            <Calendar className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            <span className="truncate">
                              Cita: {new Date(lead.appointmentDate).toLocaleDateString([], { day: 'numeric', month: 'short' })} - {new Date(lead.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )}

                        {/* Last WhatsApp Chat snippet */}
                        {lastMessage && (
                          <div className="text-[11px] text-slate-500 bg-slate-50/70 p-2 rounded-xl border border-slate-100 flex items-start gap-1.5">
                            <MessageSquare className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                            <p className="line-clamp-2 italic text-[10px] text-slate-600">
                              "{lastMessage.text}"
                            </p>
                          </div>
                        )}

                        {/* Footer Buttons: WhatsApp Chat, Bot Toggle & Stage Mover */}
                        <div className="pt-2 border-t border-purple-50 flex items-center justify-between gap-1.5 text-xs">
                          
                          {/* AI Bot Toggle */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLeadBot(lead.id);
                            }}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                              lead.aiBotEnabled
                                ? 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            }`}
                            title={lead.aiBotEnabled ? 'Bot IA respondiendo en WhatsApp' : 'Atención manual por asesor'}
                          >
                            {lead.aiBotEnabled ? (
                              <>
                                <Bot className="w-3 h-3 text-purple-600" />
                                <span>Bot IA</span>
                              </>
                            ) : (
                              <>
                                <UserIcon className="w-3 h-3 text-slate-500" />
                                <span>Manual</span>
                              </>
                            )}
                          </button>

                          {/* Chat Opener */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenChatWithLead(lead.id);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[10px] font-bold transition-colors"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </button>

                          {/* Quick Advance Stage Button */}
                          {column.stepNumber < 4 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const nextStages: LeadStage[] = ['atendiendo', 'fue_a_consulta', 'en_cartera'];
                                const nextStage = nextStages[column.stepNumber - 1];
                                if (nextStage) updateLeadStage(lead.id, nextStage);
                              }}
                              className="p-1 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white border border-purple-200 transition-colors"
                              title="Avanzar al siguiente estado"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
