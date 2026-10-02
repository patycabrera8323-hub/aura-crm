import React from 'react';
import { useCrm } from '../../context/CrmContext';
import { 
  Search, 
  Plus, 
  Bot, 
  Smartphone, 
  Sparkles, 
  LogOut, 
  RefreshCw,
  Bell,
  Wifi,
  WifiOff
} from 'lucide-react';

interface NavbarProps {
  onOpenNewLeadModal: () => void;
  onOpenWhatsAppConnect: () => void;
  onOpenAgentSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewLeadModal,
  onOpenWhatsAppConnect,
  onOpenAgentSettings
}) => {
  const { 
    currentUser, 
    logout, 
    searchQuery, 
    setSearchQuery, 
    whatsAppConnection, 
    agentSettings,
    simulateInboundLeadMessage,
    leads 
  } = useCrm();

  const totalLeads = leads.length;
  const inConsultation = leads.filter(l => l.stage === 'fue_a_consulta').length;

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-purple-100/80 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm shadow-purple-500/5">
      
      {/* Left: Search input & quick stats */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, teléfono, servicio o estado..."
            className="w-full pl-9 pr-4 py-2 bg-[#F7F5FC] border border-purple-100 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Center / Right: WhatsApp Connection & Quick Actions */}
      <div className="flex items-center gap-2.5">
        
        {/* WhatsApp Connection Status Badge */}
        <button
          onClick={onOpenWhatsAppConnect}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            whatsAppConnection.isConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
          }`}
          title="Ver estado de conexión de WhatsApp"
        >
          {whatsAppConnection.isConnected ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp Conectado</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp Desconectado</span>
            </>
          )}
        </button>

        {/* AI Agent Settings Button */}
        <button
          onClick={onOpenAgentSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold transition-all shadow-sm"
          title="Configurar Agente IA de WhatsApp"
        >
          <Bot className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
          <span className="hidden md:inline">{agentSettings.botName}</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-purple-200 text-purple-800 rounded-md font-bold">IA</span>
        </button>

        {/* Quick Simulator Button: Simular Mensaje Entrante */}
        <button
          onClick={() => simulateInboundLeadMessage()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold transition-all"
          title="Simular un mensaje entrante de un paciente real por WhatsApp"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span className="hidden lg:inline">Simular Entrada WhatsApp</span>
        </button>

        {/* New Lead Button */}
        <button
          onClick={onOpenNewLeadModal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white text-xs font-bold rounded-xl shadow-md shadow-purple-500/20 hover:shadow-purple-500/30 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nuevo Lead</span>
        </button>

        {/* User Info & Logout */}
        <div className="h-6 w-px bg-purple-200/80 mx-1 hidden sm:block" />

        <div className="flex items-center gap-2.5 pl-1">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={currentUser?.name || 'Usuario'}
            className="w-8 h-8 rounded-full object-cover border-2 border-purple-300 shadow-sm"
          />
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser?.name}</p>
            <p className="text-[10px] text-purple-600 font-medium">{currentUser?.role}</p>
          </div>

          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors ml-1"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>

    </header>
  );
};
