import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

if (!supabase) {
  console.warn('[Supabase] Advertencia: SUPABASE_URL o SUPABASE_KEY no están configuradas.');
} else {
  console.log('[Supabase] Cliente inicializado correctamente.');
}

// 1. Obtener o crear usuario por teléfono
export async function getOrCreateUser(phone: string, name?: string) {
  if (!supabase) return null;
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (existingUser) {
      if (name && existingUser.name !== name) {
        await supabase.from('users').update({ name }).eq('id', existingUser.id);
      }
      return existingUser;
    }

    const { data: newUser, error } = await supabase
      .from('users')
      .insert({ phone: cleanPhone, name: name || 'Paciente' })
      .select()
      .single();

    if (error) throw error;
    return newUser;
  } catch (err: any) {
    console.error('[Supabase getOrCreateUser Error]:', err.message);
    return null;
  }
}

// 2. Obtener o crear conversación activa para un usuario
export async function getOrCreateConversation(userId: string) {
  if (!supabase) return null;

  try {
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingConv) {
      return existingConv;
    }

    const { data: newConv, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        status: 'bot_active',
        structured_memory: {},
        summary: ''
      })
      .select()
      .single();

    if (error) throw error;
    return newConv;
  } catch (err: any) {
    console.error('[Supabase getOrCreateConversation Error]:', err.message);
    return null;
  }
}

// 3. Guardar un mensaje (de usuario o de bot)
export async function saveMessage(conversationId: string, sender: 'user' | 'bot', text: string) {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender,
        text
      })
      .select()
      .single();

    // Actualizar updated_at de la conversación
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    if (error) throw error;
    return data;
  } catch (err: any) {
    console.error('[Supabase saveMessage Error]:', err.message);
    return null;
  }
}

// 4. Cambiar el estado de la conversación (ej: human_handoff o bot_active)
export async function updateConversationStatus(conversationId: string, status: 'bot_active' | 'human_handoff') {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('conversations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', conversationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err: any) {
    console.error('[Supabase updateConversationStatus Error]:', err.message);
    return null;
  }
}

// 5. Evaluar reglas activas desde la base de datos (0 Tokens)
export async function matchRule(text: string) {
  if (!supabase) return null;
  const lower = text.toLowerCase().trim();

  try {
    const { data: rules } = await supabase
      .from('rules')
      .select('*')
      .eq('is_active', true);

    if (!rules || rules.length === 0) return null;

    for (const rule of rules) {
      const keyword = rule.keyword.toLowerCase().trim();
      if (rule.match_type === 'exact' && lower === keyword) {
        return rule;
      } else if (rule.match_type === 'contains' && lower.includes(keyword)) {
        return rule;
      }
    }

    return null;
  } catch (err: any) {
    console.error('[Supabase matchRule Error]:', err.message);
    return null;
  }
}

// 6. Registrar consumo de tokens y costo estimado
export async function recordAiUsage(params: {
  conversationId?: string;
  userId?: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCost?: number;
}) {
  if (!supabase) return null;

  try {
    const totalTokens = params.inputTokens + params.outputTokens;
    const { data, error } = await supabase
      .from('ai_usage')
      .insert({
        conversation_id: params.conversationId,
        user_id: params.userId,
        provider: params.provider,
        model: params.model,
        input_tokens: params.inputTokens,
        output_tokens: params.outputTokens,
        total_tokens: totalTokens,
        estimated_cost: params.estimatedCost || 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err: any) {
    console.error('[Supabase recordAiUsage Error]:', err.message);
    return null;
  }
}

// 7. Obtener los últimos N mensajes para la memoria corta
export async function getRecentMessages(conversationId: string, limit = 6) {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).reverse(); // Orden cronológico
  } catch (err: any) {
    console.error('[Supabase getRecentMessages Error]:', err.message);
    return [];
  }
}

// 8. Obtener estadísticas de consumo de tokens y costos para el CRM
export async function getAiUsageStats() {
  if (!supabase) {
    return {
      totalCalls: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalTokens: 0,
      totalCost: 0,
      recentRecords: []
    };
  }

  try {
    const { data, error } = await supabase
      .from('ai_usage')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const records = data || [];
    const totalCalls = records.length;
    const totalInputTokens = records.reduce((acc, r) => acc + (r.input_tokens || 0), 0);
    const totalOutputTokens = records.reduce((acc, r) => acc + (r.output_tokens || 0), 0);
    const totalTokens = totalInputTokens + totalOutputTokens;
    const totalCost = records.reduce((acc, r) => acc + Number(r.estimated_cost || 0), 0);

    return {
      totalCalls,
      totalInputTokens,
      totalOutputTokens,
      totalTokens,
      totalCost,
      recentRecords: records.slice(0, 10)
    };
  } catch (err: any) {
    console.error('[Supabase getAiUsageStats Error]:', err.message);
    return {
      totalCalls: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalTokens: 0,
      totalCost: 0,
      recentRecords: []
    };
  }
}

// 9. Obtener Leads reales en vivo desde Supabase (usuarios, conversaciones y mensajes)
export async function getLiveLeadsWithMessages() {
  if (!supabase) return [];

  try {
    // Consultar conversaciones con datos del usuario relacionado
    const { data: convs, error: convError } = await supabase
      .from('conversations')
      .select(`
        id,
        status,
        updated_at,
        created_at,
        summary,
        user_id,
        users (
          id,
          phone,
          name
        )
      `)
      .order('updated_at', { ascending: false });

    if (convError) throw convError;
    if (!convs || convs.length === 0) return [];

    // Para cada conversación, obtener sus mensajes
    const liveLeads = await Promise.all(
      convs.map(async (conv: any) => {
        const { data: msgList } = await supabase
          .from('messages')
          .select('id, sender, text, created_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: true });

        const u = conv.users || {};
        const formattedChat = (msgList || []).map((m: any) => ({
          id: m.id,
          sender: m.sender === 'user' ? ('lead' as const) : ('bot' as const),
          senderName: m.sender === 'user' ? (u.name || 'Paciente') : 'AuraBot',
          text: m.text || '',
          timestamp: m.created_at || new Date().toISOString(),
          status: 'delivered' as const
        }));

        const isHandoff = conv.status === 'human_handoff';

        return {
          id: `lead_live_${conv.id}`,
          conversationId: conv.id,
          name: u.name || 'Paciente WhatsApp',
          phone: u.phone ? (u.phone.startsWith('+') ? u.phone : `+${u.phone}`) : '+52 000 000 0000',
          email: `${u.phone || 'paciente'}@whatsapp.com`,
          avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`,
          stage: isHandoff ? ('atendiendo' as const) : ('inicio' as const),
          value: 850,
          service: 'Consulta de Valoración',
          source: 'whatsapp_direct' as const,
          priority: isHandoff ? ('alta' as const) : ('media' as const),
          createdAt: conv.created_at || new Date().toISOString(),
          updatedAt: conv.updated_at || new Date().toISOString(),
          lastActivity: conv.updated_at || new Date().toISOString(),
          notes: [],
          tags: ['WhatsApp Live', isHandoff ? 'Asesor Requerido' : 'Bot Activo'],
          whatsappChat: formattedChat,
          unreadCount: 0,
          aiScore: 85,
          aiSummary: conv.summary || 'Paciente activo en WhatsApp vía AuraBot.',
          aiBotEnabled: !isHandoff,
          assignedTo: 'Dr. Roberto M.'
        };
      })
    );

    return liveLeads;
  } catch (err: any) {
    console.error('[Supabase getLiveLeadsWithMessages Error]:', err.message);
    return [];
  }
}

