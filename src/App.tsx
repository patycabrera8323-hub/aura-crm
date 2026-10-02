import React, { useState } from 'react';
import { CrmProvider, useCrm } from './context/CrmContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { PipelineKanban } from './components/leads/PipelineKanban';
import { LeadsListView } from './components/leads/LeadsListView';
import { LeadDetailModal } from './components/leads/LeadDetailModal';
import { NewLeadModal } from './components/leads/NewLeadModal';
import { WhatsAppChatHub } from './components/whatsapp/WhatsAppChatHub';
import { WhatsAppConnectModal } from './components/whatsapp/WhatsAppConnectModal';
import { AiAgentSettingsModal } from './components/whatsapp/AiAgentSettingsModal';
import { AppointmentsView } from './components/appointments/AppointmentsView';
import { CarteraMarketingView } from './components/cartera/CarteraMarketingView';
import { AnalyticsDashboard } from './components/dashboard/AnalyticsDashboard';
import { ToastContainer } from './components/common/ToastContainer';
import { Lead } from './types/crm';

const CrmMainApp: React.FC = () => {
  const { currentUser, selectedLead, setSelectedLead, setActiveChatLeadId } = useCrm();

  const [activeTab, setActiveTab] = useState<ActiveTab>('kanban');
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [isWhatsAppConnectOpen, setIsWhatsAppConnectOpen] = useState(false);
  const [isAgentSettingsOpen, setIsAgentSettingsOpen] = useState(false);

  // If not logged in, show pastel login screen
  if (!currentUser) {
    return (
      <>
        <LoginScreen />
        <ToastContainer />
      </>
    );
  }

  const handleOpenChatWithLead = (leadId: string) => {
    setActiveChatLeadId(leadId);
    setActiveTab('chat');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAF8FE] text-slate-800">
      
      {/* Pastel Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenWhatsAppConnect={() => setIsWhatsAppConnectOpen(true)}
        onOpenAgentSettings={() => setIsAgentSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        
        {/* Pastel Navbar */}
        <Navbar
          onOpenNewLeadModal={() => setIsNewLeadModalOpen(true)}
          onOpenWhatsAppConnect={() => setIsWhatsAppConnectOpen(true)}
          onOpenAgentSettings={() => setIsAgentSettingsOpen(true)}
        />

        {/* View Switcher */}
        <main className="flex-1 overflow-hidden relative">
          {activeTab === 'kanban' && (
            <PipelineKanban
              onSelectLead={(lead) => setSelectedLead(lead)}
              onOpenNewLeadModal={() => setIsNewLeadModalOpen(true)}
              onOpenChatWithLead={handleOpenChatWithLead}
            />
          )}

          {activeTab === 'chat' && (
            <WhatsAppChatHub
              onOpenLeadModal={(lead) => setSelectedLead(lead)}
              onOpenAgentSettings={() => setIsAgentSettingsOpen(true)}
            />
          )}

          {activeTab === 'leads' && (
            <LeadsListView
              onSelectLead={(lead) => setSelectedLead(lead)}
              onOpenNewLeadModal={() => setIsNewLeadModalOpen(true)}
              onOpenChatWithLead={handleOpenChatWithLead}
            />
          )}

          {activeTab === 'appointments' && (
            <AppointmentsView
              onSelectLead={(lead) => setSelectedLead(lead)}
              onOpenChat={handleOpenChatWithLead}
            />
          )}

          {activeTab === 'cartera' && (
            <CarteraMarketingView
              onSelectLead={(lead) => setSelectedLead(lead)}
              onOpenChat={handleOpenChatWithLead}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsDashboard />
          )}

          {activeTab === 'settings' && (
            <div className="p-6">
              <AiAgentSettingsModal onClose={() => setActiveTab('kanban')} />
            </div>
          )}
        </main>

      </div>

      {/* Modals */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onOpenChat={handleOpenChatWithLead}
        />
      )}

      {isNewLeadModalOpen && (
        <NewLeadModal
          onClose={() => setIsNewLeadModalOpen(false)}
          onOpenChat={handleOpenChatWithLead}
        />
      )}

      {isWhatsAppConnectOpen && (
        <WhatsAppConnectModal
          onClose={() => setIsWhatsAppConnectOpen(false)}
        />
      )}

      {isAgentSettingsOpen && activeTab !== 'settings' && (
        <AiAgentSettingsModal
          onClose={() => setIsAgentSettingsOpen(false)}
        />
      )}

      {/* Floating Notifications */}
      <ToastContainer />

    </div>
  );
};

export default function App() {
  return (
    <CrmProvider>
      <CrmMainApp />
    </CrmProvider>
  );
}
