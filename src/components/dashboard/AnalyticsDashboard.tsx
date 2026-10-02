import React from 'react';
import { useCrm } from '../../context/CrmContext';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  MessageSquare, 
  CheckCircle2, 
  Bot, 
  Sparkles, 
  Clock,
  ArrowUpRight,
  PieChart,
  Activity
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { leads, agentSettings } = useCrm();

  const totalLeads = leads.length;
  const leadsInicio = leads.filter(l => l.stage === 'inicio').length;
  const leadsAtendiendo = leads.filter(l => l.stage === 'atendiendo').length;
  const leadsConsulta = leads.filter(l => l.stage === 'fue_a_consulta').length;
  const leadsCartera = leads.filter(l => l.stage === 'en_cartera').length;

  const totalClosedValue = leads.filter(l => l.stage === 'fue_a_consulta').reduce((acc, c) => acc + (c.value || 0), 0);
  const totalPipelineValue = leads.reduce((acc, c) => acc + (c.value || 0), 0);
  const conversionRate = totalLeads > 0 ? Math.round((leadsConsulta / totalLeads) * 100) : 0;
  const botAutomatedLeads = leads.filter(l => l.aiBotEnabled).length;
  const botAutomationRate = totalLeads > 0 ? Math.round((botAutomatedLeads / totalLeads) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 lg:p-6 bg-[#FAF8FE] space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Panel de Métricas & Rendimiento</h2>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
            Aura Analytics
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Monitorea la conversión de tus 3 estados clave, el rendimiento del Agente de WhatsApp y los ingresos.
        </p>
      </div>

      {/* Top 4 Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Leads */}
        <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Leads Captados</span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{totalLeads}</h3>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +18% este mes
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Conversion Rate */}
        <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tasa a Consulta</span>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{conversionRate}%</h3>
            <span className="text-[11px] font-semibold text-slate-500 mt-1">
              {leadsConsulta} de {totalLeads} pacientes
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Revenue Generated */}
        <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Ingresos en Consulta</span>
            <h3 className="text-2xl font-extrabold text-purple-700 mt-1">${totalClosedValue} USD</h3>
            <span className="text-[11px] font-semibold text-purple-500 mt-1">
              Pipeline total: ${totalPipelineValue} USD
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Bot Automation */}
        <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Automatización IA</span>
            <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">{botAutomationRate}%</h3>
            <span className="text-[11px] font-semibold text-indigo-500 mt-1">
              {agentSettings.botName} activo
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Bot className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Conversion Funnel & Stage Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Funnel: 3 Core Stages + Cartera */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-purple-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" />
              Embudo de Conversión de Pacientes (3 Fases + Cartera)
            </h3>
            <span className="text-xs text-purple-600 font-bold">100% Leads Registrados</span>
          </div>

          <div className="space-y-3 pt-2">
            
            {/* Stage 1: Inicio */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-sky-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> 1. Inicio (Nuevos)
                </span>
                <span>{leadsInicio} leads ({totalLeads > 0 ? Math.round((leadsInicio / totalLeads) * 100) : 0}%)</span>
              </div>
              <div className="h-3 bg-sky-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sky-400 rounded-full transition-all duration-500" 
                  style={{ width: `${totalLeads > 0 ? (leadsInicio / totalLeads) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Stage 2: Atendiendo */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-amber-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> 2. Atendiendo (En Gestión / IA)
                </span>
                <span>{leadsAtendiendo} leads ({totalLeads > 0 ? Math.round((leadsAtendiendo / totalLeads) * 100) : 0}%)</span>
              </div>
              <div className="h-3 bg-amber-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-400 rounded-full transition-all duration-500" 
                  style={{ width: `${totalLeads > 0 ? (leadsAtendiendo / totalLeads) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Stage 3: Fue a Consulta */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> 3. Fue a Consulta (Ganado 🎉)
                </span>
                <span className="text-emerald-700 font-extrabold">{leadsConsulta} consultas ({conversionRate}%)</span>
              </div>
              <div className="h-3 bg-emerald-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${totalLeads > 0 ? (leadsConsulta / totalLeads) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Stage 4: En Cartera */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-purple-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> 4. En Cartera (Nutrición / Remarketing)
                </span>
                <span>{leadsCartera} leads ({totalLeads > 0 ? Math.round((leadsCartera / totalLeads) * 100) : 0}%)</span>
              </div>
              <div className="h-3 bg-purple-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full transition-all duration-500" 
                  style={{ width: `${totalLeads > 0 ? (leadsCartera / totalLeads) * 100 : 0}%` }}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Channels & Bot Impact */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-purple-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            Rendimiento Agente IA
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between">
              <span className="font-semibold text-slate-700">Tiempo de Respuesta Promedio:</span>
              <span className="font-extrabold text-purple-800">1.2 segundos</span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
              <span className="font-semibold text-slate-700">Satisfacción de Pacientes:</span>
              <span className="font-extrabold text-emerald-800">4.9 / 5.0 ⭐</span>
            </div>

            <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-center justify-between">
              <span className="font-semibold text-slate-700">Citas Pre-agendadas por Bot:</span>
              <span className="font-extrabold text-sky-800">85% del total</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
