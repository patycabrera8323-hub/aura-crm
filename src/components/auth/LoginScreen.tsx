import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { MessageSquare, ShieldCheck, Sparkles, UserCheck, ArrowRight, Stethoscope, Lock, Mail } from 'lucide-react';
import { User } from '../../types/crm';

export const LoginScreen: React.FC = () => {
  const { login, users } = useCrm();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [customName, setCustomName] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      login(existing);
      return;
    }

    const newUser: User = {
      id: 'usr_' + Date.now(),
      name: customName || email.split('@')[0] || 'Asesor Médico',
      email: email,
      role: 'Médico Especialista',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };
    login(newUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F2FC] via-[#EDE8F9] to-[#E5DEFB] flex items-center justify-center p-4 selection:bg-purple-200">
      <div className="w-full max-w-5xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-purple-500/10 border border-purple-100/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        
        {/* Left Side: Brand & Visual Overview */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle decorative pastel circles */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/30 text-white">
                <MessageSquare className="w-6 h-6 text-purple-100" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  Aura CRM <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 text-purple-100">WhatsApp IA</span>
                </h1>
                <p className="text-xs text-purple-200 font-medium">Gestión Inteligente de Leads & Pacientes</p>
              </div>
            </div>

            <div className="space-y-4 my-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-xs font-medium text-purple-100 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                Pipeline en 3 Estados Clave + Cartera
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight">
                Convierte leads en <span className="text-amber-200">consultas reales</span> con Inteligencia Artificial.
              </h2>
              <p className="text-purple-100 text-sm leading-relaxed">
                Conecta tu WhatsApp oficial, automatiza respuestas con nuestro Agente IA y gestiona el flujo completo: <strong className="text-white">Inicio</strong> → <strong className="text-white">Atendiendo</strong> → <strong className="text-white">Fue a Consulta</strong> o <strong className="text-white">En Cartera</strong>.
              </p>
            </div>
          </div>

          {/* 3 Status Pills Feature Highlights */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/20 text-xs">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
              <span className="font-bold text-white flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-sky-300"></span> 1. Inicio
              </span>
              <p className="text-purple-200 text-[11px]">Captura automática por WhatsApp, Ads o Webhook.</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
              <span className="font-bold text-white flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-amber-300"></span> 2. Atendiendo
              </span>
              <p className="text-purple-200 text-[11px]">Agente IA o asesor respondiendo en tiempo real.</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
              <span className="font-bold text-white flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-300"></span> 3. Fue a Consulta
              </span>
              <p className="text-purple-200 text-[11px]">Pacientes que asistieron y cerraron su servicio.</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
              <span className="font-bold text-white flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-violet-300"></span> 4. En Cartera
              </span>
              <p className="text-purple-200 text-[11px]">Seguimiento y remarketing automatizado.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form & Quick User Picker */}
        <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                Acceso al Sistema CRM
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-purple-500" /> Modo Seguro
              </span>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              {isRegisterMode ? 'Crear Nuevo Acceso' : 'Iniciar Sesión'}
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Selecciona un perfil preconfigurado de prueba o ingresa con tu correo.
            </p>

            {/* Quick Demo Profile Selectors (1-Click) */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-purple-600" />
                Acceso Rápido con 1 Clic (Perfiles Demo):
              </p>
              <div className="space-y-2">
                {users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => login(user)}
                    className="w-full text-left p-3 rounded-2xl border border-purple-100 bg-[#FAF8FD] hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-purple-200 shadow-sm"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-800 group-hover:text-purple-900 transition-colors">
                          {user.name}
                        </p>
                        <span className="text-[11px] font-medium text-purple-600 bg-purple-100/60 px-2 py-0.5 rounded-md">
                          {user.role}
                        </span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white border border-purple-200 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <span className="relative px-3 bg-white text-xs text-slate-400 font-medium uppercase">
                O ingresa con credenciales
              </span>
            </div>

            {/* Custom Login / Register Form */}
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              {isRegisterMode && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Ej. Dr. Alejandro Soto"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-sm transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu.correo@clinica.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contraseña</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2 text-sm mt-2"
              >
                <span>{isRegisterMode ? 'Registrar y Entrar al CRM' : 'Entrar al Panel'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <button
              type="button"
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="text-purple-600 hover:text-purple-800 font-semibold hover:underline"
            >
              {isRegisterMode ? '¿Ya tienes cuenta? Inicia sesión' : '¿Nuevo usuario? Crea un perfil'}
            </button>
            <span className="flex items-center gap-1 text-slate-400">
              <Stethoscope className="w-3.5 h-3.5 text-purple-400" /> Aura CRM v2.5
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
