import React from 'react';
import { useCrm } from '../../context/CrmContext';
import { 
  LayoutDashboard, 
  Kanban, 
  Users, 
  MessageSquare, 
  CalendarDays, 
  Briefcase, 
  Sliders, 
  Bot, 
  QrCode,
  Sparkles,
  TrendingUp
} from 'lucide-react';

export type ActiveTab = 'kanban' | 'leads' | 'chat' | 'appointments' | 'cartera' | 'analytics' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenWhatsAppConnect: () => void;
  onOpenAgentSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenWhatsAppConnect,
  onOpenAgentSettings
}) => {
  const { leads, agentSettings, whatsAppConnection } = useCrm();

  const leadsInicio = leads.filter(l => l.stage === 'inicio').length;
  const leadsAtendiendo = leads.filter(l => l.stage === 'atendiendo').length;
  const leadsConsulta = leads.filter(l => l.stage === 'fue_a_consulta').length;
  const leadsCartera = leads.filter(l => l.stage === 'en_cartera').length;

  const navItems = [
    {
      id: 'kanban' as ActiveTab,
      label: 'Tablero Pipeline',
      sublabel: '3 Estados + Cartera',
      icon: <Kanban className="w-4 h-4" />,
      badge: leads.length,
      badgeColor: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'chat' as ActiveTab,
      label: 'Hub WhatsApp & IA',
      sublabel: 'Chats en vivo con Bot',
      icon: <MessageSquare className="w-4 h-4" />,
      badge: leadsAtendiendo + leadsInicio,
      badgeColor: 'bg-emerald-100 text-emerald-700',
      highlight: true
    },
    {
      id: 'leads' as ActiveTab,
      label: 'Todos los Leads',
      sublabel: 'Tabla y filtros avanzados',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'appointments' as ActiveTab,
      label: 'Citas & Consultas',
      sublabel: 'Agenda médica / citas',
      icon: <CalendarDays className="w-4 h-4" />,
      badge: leadsConsulta,
      badgeColor: 'bg-teal-100 text-teal-700'
    },
    {
      id: 'cartera' as ActiveTab,
      label: 'Gestión de Cartera',
      sublabel: 'Remarketing & Campañas',
      icon: <Briefcase className="w-4 h-4" />,
      badge: leadsCartera,
      badgeColor: 'bg-amber-100 text-amber-700'
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'Métricas & KPIs',
      sublabel: 'Conversión y ventas',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Configurar Agente IA',
      sublabel: 'Prompts y WhatsApp',
      icon: <Sliders className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-64 bg-[#FAF8FE] border-r border-purple-100/90 flex flex-col justify-between shrink-0 select-none h-screen sticky top-0 overflow-y-auto">
      
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center gap-3 px-5 border-b border-purple-100/70 bg-white/40">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#A78BFA] flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-slate-900 flex items-center gap-1.5">
              Aura CRM
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-700">IA</span>
            </span>
            <p className="text-[10px] text-purple-500 font-medium">WhatsApp Intelligence</p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-1">
          <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Navegación Principal
          </p>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150 text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white shadow-md shadow-purple-500/20'
                    : 'text-slate-600 hover:text-purple-900 hover:bg-purple-100/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20 text-white' : 'text-purple-600 bg-purple-100/70'}`}>
                    {item.icon}
                  </div>
                  <div className="truncate">
                    <p className="leading-tight truncate">{item.label}</p>
                    <p className={`text-[10px] font-normal truncate ${isActive ? 'text-purple-100' : 'text-slate-400'}`}>
                      {item.sublabel}
                    </p>
                  </div>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 3 Core Stages Summary Quick Widget */}
        <div className="mx-3 mt-3 p-3 rounded-2xl bg-white border border-purple-100 shadow-sm">
          <p className="text-[11px] font-bold text-slate-700 mb-2 flex items-center justify-between">
            <span>Flujo de Leads</span>
            <span className="text-[10px] text-purple-600 font-semibold">{leads.length} Totales</span>
          </p>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-1.5 rounded-xl bg-sky-50 text-sky-800">
              <span className="flex items-center gap-1.5 text-[11px] font-medium">
                <span className="w-2 h-2 rounded-full bg-sky-400" /> 1. Inicio
              </span>
              <span className="font-bold text-[11px]">{leadsInicio}</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-xl bg-amber-50 text-amber-800">
              <span className="flex items-center gap-1.5 text-[11px] font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> 2. Atendiendo
              </span>
              <span className="font-bold text-[11px]">{leadsAtendiendo}</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-xl bg-emerald-50 text-emerald-800">
              <span className="flex items-center gap-1.5 text-[11px] font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> 3. Fue a Consulta
              </span>
              <span className="font-bold text-[11px]">{leadsConsulta}</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-xl bg-purple-50 text-purple-800">
              <span className="flex items-center gap-1.5 text-[11px] font-medium">
                <span className="w-2 h-2 rounded-full bg-purple-400" /> 4. En Cartera
              </span>
              <span className="font-bold text-[11px]">{leadsCartera}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / WhatsApp Agent Mini-card */}
      <div className="p-3 border-t border-purple-100/80 bg-white/60">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200/80 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
              <Bot className="w-3.5 h-3.5 text-purple-600" /> {agentSettings.botName}
            </span>
            <span className={`w-2 h-2 rounded-full ${whatsAppConnection.isConnected ? 'bg-emerald-500 animate-ping' : 'bg-rose-400'}`} />
          </div>
          <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed mb-2">
            Auto-respondiendo dudas de precios y agendando consultas en WhatsApp.
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenWhatsAppConnect}
              className="flex-1 py-1 px-2 rounded-lg bg-white border border-purple-200 hover:bg-purple-100 text-[10px] font-bold text-purple-700 transition-colors text-center flex items-center justify-center gap-1"
            >
              <QrCode className="w-3 h-3" /> Conectar
            </button>
            <button
              onClick={onOpenAgentSettings}
              className="py-1 px-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-[10px] font-bold text-white transition-colors flex items-center justify-center"
              title="Configurar IA"
            >
              Ajustes
            </button>
          </div>
        </div>
      </div>

    </aside>
  );
};
