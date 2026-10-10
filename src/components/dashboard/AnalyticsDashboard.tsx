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
    <div className="w-full flex flex-col p-4 lg:p-6 bg-[#FAF8FE] space-y-6">
      
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

      {/* Live AI Token & Cost Tracker Section */}
      <AiUsageTrackerSection />

    </div>
  );
};

// Subcomponente: Contador de Tokens y Costo Estimado en Tiempo Real
const AiUsageTrackerSection: React.FC = () => {
  const [stats, setStats] = React.useState<{
    totalCalls: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalTokens: number;
    totalCost: number;
    recentRecords: any[];
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/ai-usage/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching AI stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000); // Actualizar cada 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Consumo de IA & Contador de Tokens (NVIDIA / Groq / Cerebras)
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 animate-pulse">
              En Vivo
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas de gasto de tokens, llamadas ejecutadas y costo estimado en dólares ($USD) registradas en Supabase.
          </p>
        </div>
        <button 
          onClick={fetchStats}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
        >
          {isLoading ? 'Actualizando...' : '↻ Refrescar Métricas'}
        </button>
      </div>

      {/* Grid de 4 Métricas de Tokens */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Llamadas a IA</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats?.totalCalls ?? 0}</p>
          <span className="text-[10px] text-slate-500 font-medium">Interacciones generativas</span>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
          <span className="text-[11px] font-bold text-purple-500 uppercase tracking-wider block">Input Tokens</span>
          <p className="text-2xl font-black text-purple-900 mt-1">{(stats?.totalInputTokens ?? 0).toLocaleString()}</p>
          <span className="text-[10px] text-purple-600 font-medium">Contexto + historial</span>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
          <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider block">Output Tokens</span>
          <p className="text-2xl font-black text-indigo-900 mt-1">{(stats?.totalOutputTokens ?? 0).toLocaleString()}</p>
          <span className="text-[10px] text-indigo-600 font-medium">Respuestas generadas</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Costo Estimado</span>
          <p className="text-2xl font-black text-emerald-900 mt-1">
            ${(stats?.totalCost ?? 0).toFixed(4)} <span className="text-xs font-bold text-emerald-700">USD</span>
          </p>
          <span className="text-[10px] text-emerald-700 font-medium">
            Total tokens: {(stats?.totalTokens ?? 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Historial Reciente de Llamadas */}
      {stats?.recentRecords && stats.recentRecords.length > 0 && (
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Últimas Interacciones de IA Registradas:</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2 px-3">Proveedor</th>
                  <th className="py-2 px-3">Modelo</th>
                  <th className="py-2 px-3 text-right">Input</th>
                  <th className="py-2 px-3 text-right">Output</th>
                  <th className="py-2 px-3 text-right">Total Tokens</th>
                  <th className="py-2 px-3 text-right">Costo Estimado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {stats.recentRecords.map((r, i) => (
                  <tr key={r.id || i} className="hover:bg-purple-50/40 transition-colors">
                    <td className="py-2 px-3 font-bold text-purple-700 uppercase">{r.provider}</td>
                    <td className="py-2 px-3 text-slate-800">{r.model}</td>
                    <td className="py-2 px-3 text-right text-slate-500">{r.input_tokens}</td>
                    <td className="py-2 px-3 text-right text-slate-500">{r.output_tokens}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">{r.total_tokens}</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-600">
                      ${Number(r.estimated_cost || 0).toFixed(5)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

