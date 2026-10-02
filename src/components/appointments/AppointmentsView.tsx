import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Lead } from '../../types/crm';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  User, 
  Phone, 
  Plus, 
  Filter, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface AppointmentsViewProps {
  onSelectLead: (lead: Lead) => void;
  onOpenChat: (leadId: string) => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  onSelectLead,
  onOpenChat
}) => {
  const { leads, updateLead, updateLeadStage, sendMessage, addToast } = useCrm();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const leadsWithAppointments = leads.filter(l => l.appointmentDate);

  const filteredAppointments = leadsWithAppointments.filter(l => {
    if (filterStatus === 'all') return true;
    return l.appointmentStatus === filterStatus;
  });

  const handleSendReminder = async (lead: Lead) => {
    const dateFormatted = new Date(lead.appointmentDate!).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });
    const timeFormatted = new Date(lead.appointmentDate!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const reminderMsg = `¡Hola ${lead.name.split(' ')[0]}! 🩺 Te saludamos de Clínica Aura para recordarte tu consulta programada para el ${dateFormatted} a las ${timeFormatted}. ¿Nos confirmas tu asistencia? ¡Te esperamos!`;

    await sendMessage(lead.id, reminderMsg, 'agent');
    addToast('success', 'Recordatorio Enviado', `Se envió el recordatorio de WhatsApp a ${lead.name}.`);
    onOpenChat(lead.id);
  };

  const handleMarkAsAttended = (lead: Lead) => {
    updateLead(lead.id, { appointmentStatus: 'asistio' });
    updateLeadStage(lead.id, 'fue_a_consulta');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-4 lg:p-6 bg-[#FAF8FE]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Agenda de Consultas & Citas</h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
              {leadsWithAppointments.length} Programadas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Seguimiento de pacientes citados, recordatorios automáticos de WhatsApp y confirmaciones.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-purple-100 shadow-sm text-xs">
          {[
            { id: 'all', label: 'Todas' },
            { id: 'confirmada', label: 'Confirmadas' },
            { id: 'pendiente', label: 'Pendientes' },
            { id: 'asistio', label: 'Asistieron (Fue a Consulta)' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterStatus === st.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-purple-700'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Appointment Cards Grid */}
      <div className="flex-1 overflow-y-auto">
        {filteredAppointments.length === 0 ? (
          <div className="h-64 bg-white rounded-3xl border border-purple-100 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <CalendarIcon className="w-12 h-12 text-purple-200 mb-2" />
            <p className="font-bold text-slate-700 text-sm">No hay consultas en este filtro</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Agenda una fecha y hora desde la ficha de cualquier lead en etapa "Atendiendo" o desde el chat de WhatsApp.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAppointments.map((lead) => {
              const aptDate = new Date(lead.appointmentDate!);
              const statusStyles = {
                confirmada: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                pendiente: 'bg-amber-100 text-amber-800 border-amber-200',
                asistio: 'bg-teal-100 text-teal-800 border-teal-200',
                reprogramada: 'bg-sky-100 text-sky-800 border-sky-200',
                cancelada: 'bg-rose-100 text-rose-800 border-rose-200'
              };

              return (
                <div
                  key={lead.id}
                  className="bg-white rounded-3xl p-5 border border-purple-100 shadow-sm hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top: Date box & Status */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="p-2.5 rounded-2xl bg-purple-50 border border-purple-100 flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex flex-col items-center justify-center font-extrabold text-xs shadow-sm">
                          <span>{aptDate.getDate()}</span>
                          <span className="text-[9px] uppercase">{aptDate.toLocaleDateString([], { month: 'short' })}</span>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">
                            {aptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[10px] text-purple-600 font-medium capitalize">
                            {aptDate.toLocaleDateString([], { weekday: 'long' })}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${statusStyles[lead.appointmentStatus || 'pendiente']}`}>
                        {lead.appointmentStatus === 'asistio' ? 'Fue a Consulta 🎉' : (lead.appointmentStatus || 'Pendiente')}
                      </span>
                    </div>

                    {/* Patient info */}
                    <div className="flex items-center gap-3 my-3">
                      <img
                        src={lead.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.name}`}
                        alt={lead.name}
                        className="w-10 h-10 rounded-full object-cover border border-purple-200"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{lead.name}</h4>
                        <p className="text-[11px] text-purple-600 font-semibold truncate">{lead.service}</p>
                        <p className="text-[10px] text-slate-400">{lead.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-purple-50 flex items-center justify-between gap-2 text-xs">
                    <button
                      onClick={() => handleSendReminder(lead)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 transition-colors flex items-center justify-center gap-1.5 text-[11px]"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Recordatorio WhatsApp</span>
                    </button>

                    {lead.stage !== 'fue_a_consulta' && (
                      <button
                        onClick={() => handleMarkAsAttended(lead)}
                        className="py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors flex items-center justify-center gap-1 text-[11px]"
                        title="Marcar que el paciente acudió a la consulta"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Asistió</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
