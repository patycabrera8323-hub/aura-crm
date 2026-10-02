import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { 
  X, 
  QrCode, 
  Smartphone, 
  CheckCircle2, 
  RefreshCw, 
  Copy, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Server,
  Layers,
  HelpCircle,
  ExternalLink,
  Check,
  Star
} from 'lucide-react';

interface WhatsAppConnectModalProps {
  onClose: () => void;
}

export const WhatsAppConnectModal: React.FC<WhatsAppConnectModalProps> = ({ onClose }) => {
  const { 
    whatsAppConnection, 
    toggleWhatsAppConnection, 
    reconnectWhatsAppQr, 
    simulateInboundLeadMessage,
    addToast 
  } = useCrm();

  const [activeTab, setActiveTab] = useState<'qr' | 'alternativas' | 'webhook'>('qr');
  const [copied, setCopied] = useState(false);

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(whatsAppConnection.webhookUrl);
    setCopied(true);
    addToast('success', 'URL Copiada', 'Endpoint de Webhook copiado al portapapeles.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl border border-purple-100 shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-purple-100 bg-gradient-to-r from-purple-50 via-white to-purple-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                Conexión WhatsApp & Agente IA
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${whatsAppConnection.isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  {whatsAppConnection.isConnected ? '● Conectado' : '○ Desconectado'}
                </span>
              </h3>
              <p className="text-xs text-slate-500">Opciones recomendadas con y sin la API oficial de Meta.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 px-6 border-b border-purple-100 bg-[#FAF8FE] text-xs font-bold">
          <button
            onClick={() => setActiveTab('qr')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'qr'
                ? 'border-purple-600 text-purple-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-purple-700'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>1. Escaneo QR (Sin Meta API)</span>
          </button>

          <button
            onClick={() => setActiveTab('alternativas')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'alternativas'
                ? 'border-purple-600 text-purple-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-purple-700'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span>2. Mejores Opciones Recomendadas</span>
          </button>

          <button
            onClick={() => setActiveTab('webhook')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'webhook'
                ? 'border-purple-600 text-purple-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-purple-700'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>3. Webhooks & Meta Oficial</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          
          {/* TAB 1: QR CODE BRIDGE */}
          {activeTab === 'qr' && (
            <div className="space-y-5">
              
              {/* Status Banner */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                whatsAppConnection.isConnected 
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                  : 'bg-amber-50/70 border-amber-200 text-amber-950'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${whatsAppConnection.isConnected ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}>
                    {whatsAppConnection.isConnected ? <CheckCircle2 className="w-5 h-5" /> : <RefreshCw className="w-5 h-5 animate-spin" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">
                      {whatsAppConnection.isConnected ? whatsAppConnection.displayName : 'Esperando escaneo QR...'}
                    </h4>
                    <p className="text-xs opacity-80">
                      {whatsAppConnection.isConnected ? `Línea activa: ${whatsAppConnection.phoneNumber} • ${whatsAppConnection.lastSync}` : 'Abre WhatsApp en tu teléfono > Dispositivos vinculados.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={toggleWhatsAppConnection}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-colors ${
                    whatsAppConnection.isConnected 
                      ? 'bg-white text-rose-600 border-rose-200 hover:bg-rose-50' 
                      : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                  }`}
                >
                  {whatsAppConnection.isConnected ? 'Desconectar' : 'Reconectar'}
                </button>
              </div>

              {/* QR Code Container */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                <div className="flex flex-col items-center justify-center p-6 bg-[#FAF8FE] rounded-2xl border border-purple-100 text-center">
                  <div className="w-44 h-44 bg-white p-3 rounded-2xl shadow-md border border-purple-200 flex flex-col items-center justify-center relative group">
                    <div className="w-full h-full bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl flex items-center justify-center text-white relative overflow-hidden">
                      <QrCode className="w-28 h-28 text-white opacity-90 group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-purple-500/10 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="bg-white/90 text-purple-900 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow">
                          AURA QR LIVE
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={reconnectWhatsAppQr}
                    className="mt-3 text-purple-600 hover:text-purple-800 font-bold text-xs flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Regenerar código QR
                  </button>
                </div>

                <div className="space-y-3 text-slate-600">
                  <h4 className="font-bold text-slate-800 text-sm">¿Cómo conectar sin Meta API?</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Funciona exactamente igual que <strong>WhatsApp Web</strong>: conectas tu número actual escaneando un código QR en segundos.
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
                    <li>Abre <strong>WhatsApp</strong> en tu teléfono.</li>
                    <li>Toca <strong>Menú (⋮)</strong> o <strong>Configuración</strong>.</li>
                    <li>Selecciona <strong>Dispositivos vinculados</strong>.</li>
                    <li>Escanea el código QR de la izquierda.</li>
                  </ol>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        simulateInboundLeadMessage();
                        onClose();
                      }}
                      className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Probar Recepción con Lead Simulado</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: BEST ALTERNATIVES TO META API */}
          {activeTab === 'alternativas' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100">
                <h4 className="font-bold text-purple-950 text-xs flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500" />
                  Las 4 mejores opciones si NO tienes la API oficial de Meta:
                </h4>
                <p className="text-[11px] text-purple-700 mt-0.5">
                  No necesitas pasar por la verificación de documentos ni trámites complejos de Facebook Business Manager.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                
                {/* Option 1: Evolution API */}
                <div className="p-4 rounded-2xl bg-white border border-purple-200 shadow-sm space-y-2 relative">
                  <span className="absolute top-3 right-3 text-[10px] font-extrabold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                    Gratis / Open Source
                  </span>
                  <h5 className="font-bold text-slate-900 text-sm">1. Evolution API / Baileys</h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    La pasarela más popular del mundo para WhatsApp Web. Se instala en tu propio servidor (o en Railway/Render) y te genera un código QR y Webhooks REST listos para conectar a este CRM.
                  </p>
                  <div className="pt-1 flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                    <Check className="w-3.5 h-3.5" /> 100% Gratis sin límite de mensajes.
                  </div>
                </div>

                {/* Option 2: Whapi.cloud / UltraMsg / Z-API */}
                <div className="p-4 rounded-2xl bg-white border border-purple-200 shadow-sm space-y-2 relative">
                  <span className="absolute top-3 right-3 text-[10px] font-extrabold px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">
                    Plug & Play (Sin Servidor)
                  </span>
                  <h5 className="font-bold text-slate-900 text-sm">2. Whapi.cloud o UltraMsg</h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Servicios en la nube donde te creas una cuenta, escaneas el QR desde su web y te dan una URL de Webhook para pegar directamente en tu CRM.
                  </p>
                  <div className="pt-1 flex items-center gap-1 text-[10px] text-purple-700 font-bold">
                    <Check className="w-3.5 h-3.5" /> Listo en 2 minutos sin configurar código.
                  </div>
                </div>

                {/* Option 3: Meta Cloud API Gratuita (Primeros 1,000 chats) */}
                <div className="p-4 rounded-2xl bg-white border border-purple-200 shadow-sm space-y-2 relative">
                  <span className="absolute top-3 right-3 text-[10px] font-extrabold px-2 py-0.5 bg-sky-100 text-sky-800 rounded-full">
                    Meta Oficial
                  </span>
                  <h5 className="font-bold text-slate-900 text-sm">3. Meta Cloud API (Tier Gratuito)</h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Meta ofrece <strong>1,000 conversaciones mensuales gratis</strong>. Ya no exige verificación de empresa estricta para números de prueba o negocios pequeños.
                  </p>
                  <div className="pt-1 flex items-center gap-1 text-[10px] text-sky-700 font-bold">
                    <Check className="w-3.5 h-3.5" /> Sin riesgo de bloqueo de línea.
                  </div>
                </div>

                {/* Option 4: Webhooks desde Facebook Ads / Typeform */}
                <div className="p-4 rounded-2xl bg-white border border-purple-200 shadow-sm space-y-2 relative">
                  <span className="absolute top-3 right-3 text-[10px] font-extrabold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                    Entrada Directa
                  </span>
                  <h5 className="font-bold text-slate-900 text-sm">4. Webhooks de Formularios / Ads</h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Conecta tus formularios de Facebook/Instagram o tu sitio web al webhook de Aura CRM. El lead entra a "Inicio" y el asesor lo abre con 1 clic en WhatsApp Web.
                  </p>
                  <div className="pt-1 flex items-center gap-1 text-[10px] text-amber-700 font-bold">
                    <Check className="w-3.5 h-3.5" /> Cero costo y 100% compatible.
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: WEBHOOKS & META OFICIAL STEP-BY-STEP */}
          {activeTab === 'webhook' && (
            <div className="space-y-4">
              
              {/* Credentials to Copy */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 space-y-3">
                <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-purple-600" /> Datos de tu CRM para pegar en Meta Developers:
                </span>
                
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    1. URL de Devolución de Llamada (Webhook Callback URL):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={whatsAppConnection.webhookUrl}
                      className="flex-1 px-3 py-1.5 bg-white border border-purple-200 rounded-xl text-[11px] font-mono text-purple-900 select-all"
                    />
                    <button
                      onClick={handleCopyWebhook}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 font-bold flex items-center gap-1 text-[11px] transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    2. Token de Verificación (Verify Token):
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white px-3 py-1.5 rounded-xl border border-purple-200 font-mono text-purple-900 text-[11px]">
                      {whatsAppConnection.verifyToken}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(whatsAppConnection.verifyToken);
                        addToast('success', 'Token Copiado', 'Token de verificación copiado.');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white border border-purple-200 text-purple-700 hover:bg-purple-100 font-bold text-[11px] transition-colors"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              </div>

              {/* Step by step numbered list */}
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-purple-100 text-slate-700">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Guía Paso a Paso para configurar Meta Cloud API (1,000 chats Gratis):
                </h4>

                <div className="space-y-2.5 text-xs leading-relaxed">
                  <div className="p-2.5 rounded-xl bg-[#FAF8FE] border border-purple-50">
                    <strong className="text-purple-900">Paso 1: Entrar a Meta for Developers</strong>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Ingresa a <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="text-purple-600 font-bold underline">developers.facebook.com</a> e inicia sesión con tu cuenta de Facebook.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FAF8FE] border border-purple-50">
                    <strong className="text-purple-900">Paso 2: Crear una App de tipo "Negocios / Business"</strong>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Haz clic en <em>Mis apps &gt; Crear app</em>, selecciona el tipo <strong>"Otro" o "Negocios"</strong> y ponle de nombre (ej. <em>Aura CRM WhatsApp</em>).
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FAF8FE] border border-purple-50">
                    <strong className="text-purple-900">Paso 3: Agregar el producto "WhatsApp"</strong>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      En el panel de la app, busca el cuadro de <strong>WhatsApp</strong> y haz clic en <em>"Configurar"</em>. Meta te dará un número de prueba y un token temporal al instante.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FAF8FE] border border-purple-50">
                    <strong className="text-purple-900">Paso 4: Configurar el Webhook</strong>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      En el menú lateral ve a <em>WhatsApp &gt; Configuración</em>. Haz clic en <strong>"Editar"</strong> en la sección de Webhooks, pega la <strong>URL del Webhook</strong> y el <strong>Token de verificación</strong> de arriba y haz clic en <em>"Verificar y Guardar"</em>.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FAF8FE] border border-purple-50">
                    <strong className="text-purple-900">Paso 5: Suscribirse al campo "messages"</strong>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      En los campos del Webhook, activa la casilla <strong>"messages"</strong>. ¡Listo! Cualquier mensaje que envíen tus clientes llegará en tiempo real a este CRM y será atendido por el Agente IA.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
