import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { 
  getOrCreateUser, 
  getOrCreateConversation, 
  saveMessage, 
  updateConversationStatus, 
  matchRule, 
  recordAiUsage, 
  getRecentMessages 
} from './src/services/supabase.js';
import { generateCascadeResponse, AIMessage } from './src/services/aiProvider.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());

// Initialize Gemini Client (User-Agent header required by guidelines)
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const ai = geminiApiKey ? new GoogleGenAI({
  apiKey: geminiApiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
}) : null;

// Helper for fallback responses if API key is missing or offline
function generateSmartFallbackReply(userMessage: string, botName: string, businessName: string, service?: string): string {
  const lower = userMessage.toLowerCase();
  if (lower.includes('hola') || lower.includes('buenas') || lower.includes('buenos dias') || lower.includes('tardes')) {
    return `¡Hola! Con mucho gusto te atiendo. Soy ${botName}, asistente de ${businessName}. ¿En qué podemos ayudarte hoy respecto a tus consultas y tratamientos? 😊`;
  }
  if (lower.includes('precio') || lower.includes('costo') || lower.includes('cuanto vale') || lower.includes('tarifa')) {
    return `Nuestra consulta de valoración para ${service || 'nuestros servicios'} incluye diagnóstico completo y plan personalizado por solo $45 USD / $850 MXN. ¿Te gustaría agendar un espacio para esta semana? 📅`;
  }
  if (lower.includes('cita') || lower.includes('agenda') || lower.includes('horario') || lower.includes('turno') || lower.includes('agendar')) {
    return `¡Excelente decisión! Tenemos disponibilidad para consulta presencial y virtual este jueves a las 10:30 AM o viernes a las 4:00 PM. ¿Cuál horario te queda mejor? 🩺✨`;
  }
  if (lower.includes('ubicacion') || lower.includes('donde estan') || lower.includes('direccion')) {
    return `Estamos ubicados en Av. Las Palmas #450, Consultorio 302, Edificio Platinum Medical. Contamos con estacionamiento y fácil acceso. ¿Deseas que te reservemos cita?`;
  }
  if (lower.includes('gracias') || lower.includes('ok') || lower.includes('perfecto') || lower.includes('listo')) {
    return `¡Con todo el gusto! Quedo muy atento a cualquier otra duda. Si confirmas tu horario, te aparto el cupo de inmediato. 💜`;
  }
  return `Muchas gracias por tu mensaje. En ${businessName} nos especializamos en brindarte la mejor atención. Con gusto te ayudamos a programar tu consulta o resolver cualquier duda. ¿Para qué fecha u horario preferirías tu cita?`;
}

// 1. WhatsApp AI Chat Auto-Reply Endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, leadName, service, botSettings } = req.body;
    
    const botName = botSettings?.botName || 'AuraBot';
    const businessName = botSettings?.businessName || 'Clínica Aura Especialistas';
    const tone = botSettings?.tone || 'empático y profesional';
    const customPrompt = botSettings?.customPrompt || 'Eres un asistente médico y comercial de WhatsApp diseñado para brindar calidez, resolver dudas de precios/ubicación y agendar citas o consultas con empatía.';
    const consultationPrice = botSettings?.consultationPrice || '$45 USD / $850 MXN';
    const locationAddress = botSettings?.locationAddress || 'Av. Médica Central #500, Torre B, Piso 3';

    // Format chat history
    const lastUserMessage = messages && messages.length > 0 
      ? messages[messages.length - 1].text 
      : 'Hola, quiero información';

    if (!ai) {
      const fallback = generateSmartFallbackReply(lastUserMessage, botName, businessName, service);
      return res.json({ reply: fallback, source: 'fallback' });
    }

    const conversationHistoryStr = (messages || [])
      .slice(-8)
      .map((m: any) => `${m.sender === 'lead' ? (leadName || 'Lead') : 'Agente/Bot'}: ${m.text}`)
      .join('\n');

    const systemInstruction = `
Eres "${botName}", el asistente virtual oficial de WhatsApp para "${businessName}".
Tu objetivo principal es atender al cliente/paciente con tono ${tone}, responder sus preguntas de manera cálida, concisa (máximo 2 a 3 oraciones por respuesta, apto para WhatsApp con emojis sutiles), y guiarlo para agendar su consulta o mantener el contacto.

Datos del negocio:
- Empresa: ${businessName}
- Servicio/Interés del lead: ${service || 'Consulta General y Especialidades'}
- Precio de consulta: ${consultationPrice}
- Ubicación: ${locationAddress}
- Instrucciones especiales: ${customPrompt}

Reglas clave para WhatsApp:
1. Responde de forma muy natural, empática y conversacional, como un asesor experto por WhatsApp.
2. Mantén los mensajes breves y fáciles de leer en pantalla de celular (1-3 párrafos cortos).
3. Si el cliente pregunta por costos, horarios o citas, dale opciones claras y pregunta si desea apartar su espacio.
4. Si ya confirmó cita, felicítalo y dale la bienvenida.
5. Usa español natural y profesional.
`;

    const prompt = `Historial de la conversación en WhatsApp:\n${conversationHistoryStr}\n\nResponde como ${botName} al último mensaje del lead:`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || generateSmartFallbackReply(lastUserMessage, botName, businessName, service);
    return res.json({ reply: replyText.trim(), source: 'gemini' });
  } catch (error: any) {
    console.error('Gemini chat error:', error?.message || error);
    const fallback = generateSmartFallbackReply(
      req.body?.messages?.slice(-1)?.[0]?.text || 'Hola', 
      req.body?.botSettings?.botName || 'AuraBot', 
      req.body?.botSettings?.businessName || 'Clínica Aura',
      req.body?.service
    );
    return res.json({ reply: fallback, source: 'fallback_on_error', error: error?.message });
  }
});

// 2. Suggest 3 Quick Replies for Human Advisor
app.post('/api/gemini/suggest-reply', async (req, res) => {
  try {
    const { messages, leadName, service } = req.body;
    const lastMsg = messages?.slice(-1)?.[0]?.text || 'Hola';

    if (!ai) {
      return res.json({
        suggestions: [
          `¡Hola ${leadName || ''}! Con gusto te comparto los horarios disponibles para consulta. ¿Te queda bien esta semana?`,
          `Nuestra consulta para ${service || 'atención'} incluye valoración completa. ¿Deseas agendar por la mañana o por la tarde?`,
          `Quedo a tus órdenes para apartar tu espacio. ¿Prefieres pago en línea o en recepción al llegar?`
        ]
      });
    }

    const prompt = `
Contexto de chat en WhatsApp con el cliente "${leadName || 'Paciente'}".
Servicio de interés: ${service || 'Consulta General'}.
Último mensaje recibido: "${lastMsg}"

Genera exactamente 3 respuestas cortas, profesionales y altamente efectivas en formato JSON array de strings para que el asesor humano elija con 1 clic y envíe por WhatsApp.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        systemInstruction: 'Devuelve un JSON array de exactamente 3 strings en español listos para enviar por WhatsApp.',
      },
    });

    let suggestions = [];
    try {
      suggestions = JSON.parse(response.text || '[]');
    } catch {
      suggestions = [
        `¡Hola ${leadName || ''}! Con gusto te agendamos tu consulta para esta semana.`,
        `Te comparto nuestra disponibilidad de horarios disponibles para tu valoración.`,
        `¿Te gustaría que te reservemos el espacio para mañana a las 4:00 PM?`
      ];
    }

    return res.json({ suggestions });
  } catch (error: any) {
    return res.json({
      suggestions: [
        `¡Hola! Con gusto te apoyamos con tu consulta. ¿Qué horario te acomoda mejor?`,
        `Tenemos disponibilidad este jueves y viernes para valoración. ¿Te reservamos lugar?`,
        `Cualquier duda sobre el procedimiento o costo estamos a tus órdenes.`
      ]
    });
  }
});

// 3. AI Lead Analysis, Summary & Stage Recommender
app.post('/api/gemini/analyze-lead', async (req, res) => {
  try {
    const { chatHistory, leadName, currentStage, service } = req.body;
    
    if (!ai) {
      return res.json({
        recommendedStage: currentStage || 'atendiendo',
        score: 78,
        summary: `Lead interesado en ${service || 'consulta'}. Muestra alta intención de agendar según la interacción reciente en WhatsApp.`,
        nextAction: 'Enviar recordatorio de horarios disponibles o confirmación de fecha.',
      });
    }

    const prompt = `
Analiza la siguiente conversación de CRM/WhatsApp con el lead "${leadName}":
Servicio: ${service || 'General'}
Estado actual en CRM: ${currentStage}
Historial:
${JSON.stringify(chatHistory)}

Devuelve un JSON con:
- recommendedStage: uno de ["inicio", "atendiendo", "fue_a_consulta", "en_cartera"]
- score: número del 0 al 100 indicando probabilidad de conversión/asistencia
- summary: resumen de 2 frases del perfil del cliente y necesidades
- nextAction: recomendación accionable para el asesor de ventas o médico
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        systemInstruction: 'Eres un analista experto de CRM y ventas médicas. Responde estrictamente en formato JSON.',
      }
    });

    const data = JSON.parse(response.text || '{}');
    return res.json({
      recommendedStage: data.recommendedStage || 'atendiendo',
      score: data.score || 75,
      summary: data.summary || 'Lead activo en conversación vía WhatsApp.',
      nextAction: data.nextAction || 'Continuar seguimiento y ofrecer horarios de consulta.',
    });
  } catch (error) {
    return res.json({
      recommendedStage: 'atendiendo',
      score: 70,
      summary: 'Lead en proceso de atención personalizada.',
      nextAction: 'Dar seguimiento a la solicitud de información.',
    });
  }
});

// Helper to send messages back to user through Whapi.cloud OR Meta Cloud API
async function sendWhatsAppMessage(to: string, messageText: string) {
  const whapiToken = process.env.WHAPI_TOKEN;
  if (whapiToken) {
    try {
      const url = 'https://gate.whapi.cloud/messages/text';
      const cleanTo = to.includes('@') ? to : `${to.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whapiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: cleanTo,
          body: messageText,
        }),
      });
      const result = await res.json();
      console.log(`[Whapi Sent] Mensaje enviado a ${cleanTo}:`, result);
      return result;
    } catch (err: any) {
      console.error('[Whapi Send Error]:', err.message || err);
    }
  }

  // Fallback to Meta WhatsApp Cloud API
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (token && phoneId) {
    try {
      const cleanTo = to.replace(/[^0-9]/g, '');
      const url = `https://graph.facebook.com/v26.0/${phoneId}/messages`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanTo,
          type: 'text',
          text: { body: messageText },
        }),
      });
      const result = await res.json();
      return result;
    } catch (err: any) {
      console.error('[WhatsApp Send Error]:', err.message || err);
      return null;
    }
  }

  return null;
}

// Helper para enviar Botones Interactivos en WhatsApp vía Whapi (0 Tokens)
async function sendWhapiButtons(to: string, headerText: string, buttons: Array<{ id: string; title: string }>) {
  const whapiToken = process.env.WHAPI_TOKEN;
  if (!whapiToken) {
    // Si no hay Whapi, enviar como texto plano con lista
    const fallbackText = `${headerText}\n\n` + buttons.map((b, i) => `${i + 1}. ${b.title}`).join('\n');
    return await sendWhatsAppMessage(to, fallbackText);
  }

  try {
    const url = 'https://gate.whapi.cloud/messages/interactive';
    const cleanTo = to.includes('@') ? to : `${to.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whapiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: cleanTo,
        type: 'button',
        body: {
          text: headerText
        },
        action: {
          buttons: buttons.map(b => ({
            id: b.id,
            title: b.title.slice(0, 20),
            type: 'reply'
          }))
        }
      }),
    });

    if (!res.ok) {
      const errBody = await res.json();
      throw new Error(JSON.stringify(errBody));
    }

    const result = await res.json();
    console.log(`[Whapi Buttons Sent] Botones enviados a ${cleanTo}:`, result);
    return result;
  } catch (err: any) {
    console.error('[Whapi Buttons Error]:', err.message || err);
    // Si falla el interactive, enviamos como texto plano
    const fallbackText = `${headerText}\n\n` + buttons.map((b, i) => `${i + 1}. ${b.title}`).join('\n');
    return await sendWhatsAppMessage(to, fallbackText);
  }
}

// 4. Webhook Receiver for Meta & Whapi.cloud WhatsApp & Auto-responder
app.post('/api/webhook/whatsapp', async (req, res) => {
  // Always return 200 OK immediately so providers don't retry
  res.status(200).json({
    status: 'success',
    received: true,
  });

  try {
    // Whapi format check
    const whapiMessage = req.body?.messages?.[0];
    if (whapiMessage?.from_me) {
      // Do not reply to messages sent by the bot itself
      return;
    }

    // Meta format check
    const metaEntry = req.body?.entry?.[0]?.changes?.[0]?.value;
    const metaMessage = metaEntry?.messages?.[0];
    const metaContact = metaEntry?.contacts?.[0];

    // If it's a status notification (delivered, read, sent), do not reply
    if (!metaMessage && !whapiMessage && (req.body?.entry?.[0]?.changes?.[0]?.value?.statuses || req.body?.statuses)) {
      return;
    }

    // Extraer texto o ID de botón presionado (soporta Whapi interactive, buttons y texto estándar)
    const buttonId = whapiMessage?.interactive?.button_reply?.id || 
                     whapiMessage?.button_reply?.id || 
                     whapiMessage?.action?.reply?.id;
    const buttonTitle = whapiMessage?.interactive?.button_reply?.title || 
                        whapiMessage?.button_reply?.title;

    const rawText = buttonId || buttonTitle || 
                    whapiMessage?.text?.body || 
                    whapiMessage?.body || 
                    metaMessage?.text?.body || 
                    req.body?.text;

    const from = whapiMessage?.chat_id || whapiMessage?.from || metaMessage?.from || req.body?.from;
    const senderName = whapiMessage?.from_name || metaContact?.profile?.name || req.body?.senderName || 'Paciente';

    if (!from || !rawText) {
      return;
    }

    const text = rawText.toString().trim();
    console.log(`[WhatsApp Webhook] Mensaje recibido de ${from} (${senderName}): "${text}"`);

    // 1. Base de Datos: Identificar usuario y conversación
    const user = await getOrCreateUser(from, senderName);
    const conversation = user ? await getOrCreateConversation(user.id) : null;

    if (conversation) {
      await saveMessage(conversation.id, 'user', text);

      // Si está transferido a un humano, el bot no responde
      if (conversation.status === 'human_handoff') {
        console.log(`[Bot Silenciado] La conversación ${conversation.id} está en manos de un asesor humano.`);
        return;
      }
    }

    // 2. Motor de Reglas y Botones Interactivos (0 Tokens de IA)
    const lowerText = text.toLowerCase().trim();

    // Respuestas a opciones numéricas o botones:
    // Opción 1: Precios
    const isPriceQuery = lowerText === '1' || 
                         lowerText === 'btn_precios' || 
                         lowerText.includes('ver precio') || 
                         lowerText.includes('precio') || 
                         lowerText.includes('costo') || 
                         lowerText.includes('cuanto vale') ||
                         lowerText.includes('tarifa');

    // Opción 2: Citas
    const isAppointmentQuery = lowerText === '2' || 
                              lowerText === 'btn_citas' || 
                              lowerText.includes('agendar') || 
                              lowerText.includes('cita') || 
                              lowerText.includes('horario') || 
                              lowerText.includes('turno');

    // Opción 3: Asesor
    const isHandoffQuery = lowerText === '3' || 
                          lowerText === 'btn_asesor' || 
                          lowerText.includes('asesor') || 
                          lowerText.includes('humano') || 
                          lowerText.includes('persona');

    // Opción 4: Ubicación
    const isLocationQuery = lowerText === '4' || 
                           lowerText === 'btn_ubicacion' || 
                           lowerText.includes('ubicacion') || 
                           lowerText.includes('donde estan') || 
                           lowerText.includes('direccion');

    // Flujo de Precios (Opción 1)
    if (isPriceQuery) {
      const priceText = `🩺 *Precios de Consulta y Valoración:*\n\n• Consulta General y Diagnóstico: *$45 USD / $850 MXN*\n• Incluye revisión médica completa y plan personalizado de tratamiento.\n\n¿Deseas apartar tu espacio para esta semana?\n\nResponde con:\n*2.* 📅 Agendar Cita\n*4.* 📍 Ubicación de la clínica`;
      const buttons = [
        { id: 'btn_citas', title: '📅 Agendar Cita' },
        { id: 'btn_ubicacion', title: '📍 Ubicación' }
      ];
      if (conversation) await saveMessage(conversation.id, 'bot', priceText);
      await sendWhapiButtons(from, priceText, buttons);
      return;
    }

    // Flujo de Citas (Opción 2)
    if (isAppointmentQuery) {
      const appointmentText = `📅 *Disponibilidad de Citas:*\n\nContamos con espacios disponibles esta semana:\n• *Jueves:* 10:30 AM o 4:00 PM\n• *Viernes:* 11:00 AM o 5:30 PM\n\n¿Cuál horario te queda mejor? Si prefieres otro día, indícanoslo y con gusto te buscamos cupo.`;
      if (conversation) await saveMessage(conversation.id, 'bot', appointmentText);
      await sendWhatsAppMessage(from, appointmentText);
      return;
    }

    // Flujo de Asesor Humano (Opción 3)
    if (isHandoffQuery) {
      const handoffText = `👨‍⚕️ Entendido, ${senderName}. He transferido esta conversación a uno de nuestros asesores humanos. En breve te responderán directamente por aquí.`;
      if (conversation) {
        await updateConversationStatus(conversation.id, 'human_handoff');
        await saveMessage(conversation.id, 'bot', handoffText);
      }
      await sendWhatsAppMessage(from, handoffText);
      return;
    }

    // Flujo de Ubicación (Opción 4)
    if (isLocationQuery) {
      const locationText = `📍 *Ubicación de Clínica Aura:*\n\nEstamos ubicados en: *Av. Médica Central #500, Torre B, Piso 3*.\nContamos con estacionamiento para pacientes y acceso para personas con movilidad reducida.\n\n¿Te gustaría programar tu visita?`;
      if (conversation) await saveMessage(conversation.id, 'bot', locationText);
      await sendWhatsAppMessage(from, locationText);
      return;
    }

    // Saludo inicial o palabra 'menu': Enviar menú principal
    if (lowerText.includes('hola') || lowerText.includes('buenos dias') || lowerText.includes('buenas tardes') || lowerText === 'menu' || lowerText === 'inicio') {
      const welcomeText = `¡Hola ${senderName}! 👋 Bienvenido a Clínica Aura Especialistas.\n\n¿Cómo podemos ayudarte hoy? Elige una opción o escribe su número:\n\n*1.* 💰 Ver Precios\n*2.* 📅 Agendar Cita\n*3.* 👨‍⚕️ Hablar con Asesor`;
      const buttons = [
        { id: 'btn_precios', title: '💰 Ver Precios' },
        { id: 'btn_citas', title: '📅 Agendar Cita' },
        { id: 'btn_asesor', title: '👨‍⚕️ Hablar con Asesor' }
      ];

      if (conversation) {
        await saveMessage(conversation.id, 'bot', welcomeText);
      }
      await sendWhapiButtons(from, welcomeText, buttons);
      return;
    }

    // Reglas dinámicas adicionales desde la base de datos de Supabase
    const matchedRule = await matchRule(text);
    if (matchedRule) {
      console.log(`[Regla Coincidente] Ejecutando regla para "${matchedRule.keyword}" (Acción: ${matchedRule.action})`);

      if (matchedRule.action === 'handoff' && conversation) {
        await updateConversationStatus(conversation.id, 'human_handoff');
      }

      const ruleResponse = matchedRule.response_text;
      if (conversation) {
        await saveMessage(conversation.id, 'bot', ruleResponse);
      }
      await sendWhatsAppMessage(from, ruleResponse);
      return; // Fin del flujo sin gastar tokens
    }

    // 3. IA Generativa en Cascada (Cerebras -> Grok -> NVIDIA)
    // Recuperar memoria corta (últimos 6 mensajes de la conversación)
    let aiMessages: AIMessage[] = [];
    if (conversation) {
      const recentMessages = await getRecentMessages(conversation.id, 6);
      aiMessages = recentMessages.map((m: any) => ({
        role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.text
      }));
    } else {
      aiMessages = [{ role: 'user', content: text }];
    }

    const systemInstruction = `Eres AuraBot, el asistente médico y de atención de Clínica Aura Especialistas.
Tu labor es responder dudas con calidez, empatía y brevedad (máximo 2 párrafos cortos aptos para pantalla de WhatsApp).
Reglas estrictas de seguridad:
- No inventes precios ni procedimientos no confirmados.
- Si no estás seguro de algo médico o administrativo, sugiere hablar con un asesor humano.
- Usa tono profesional y empático.`;

    let replyText = '';
    let inputTokens = 0;
    let outputTokens = 0;
    let providerUsed = 'fallback';
    let modelUsed = 'smart-template';
    let estimatedCost = 0;

    // Ejecutar Cascada de IA (Cerebras / Grok / NVIDIA)
    try {
      const cascadeResult = await generateCascadeResponse(aiMessages, systemInstruction);
      replyText = cascadeResult.text;
      inputTokens = cascadeResult.inputTokens;
      outputTokens = cascadeResult.outputTokens;
      providerUsed = cascadeResult.provider;
      modelUsed = cascadeResult.model;

      // Cálculo de costo estimado según proveedor
      if (providerUsed === 'cerebras') {
        estimatedCost = (inputTokens + outputTokens) * 0.0000001; // Cerebras ultrabarato
      } else if (providerUsed === 'grok') {
        estimatedCost = (inputTokens * 0.000002) + (outputTokens * 0.00001);
      } else if (providerUsed === 'nvidia') {
        estimatedCost = (inputTokens + outputTokens) * 0.0000002;
      }
    } catch (aiErr: any) {
      console.warn('[AI Cascade Warning] Falló la cascada, usando fallback local:', aiErr.message);
      // Respaldo con Gemini si estuviera disponible, o plantilla inteligente
      if (ai) {
        try {
          const geminiRes = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: `Mensaje de ${senderName}: "${text}"\n\nResponde como asistente de Clínica Aura:`,
            config: { systemInstruction, temperature: 0.7 }
          });
          replyText = geminiRes.text || generateSmartFallbackReply(text, 'AuraBot', 'Clínica Aura Especialistas');
          providerUsed = 'google';
          modelUsed = 'gemini-2.0-flash';
        } catch {
          replyText = generateSmartFallbackReply(text, 'AuraBot', 'Clínica Aura Especialistas');
        }
      } else {
        replyText = generateSmartFallbackReply(text, 'AuraBot', 'Clínica Aura Especialistas');
      }
    }

    // 4. Guardar respuesta y registrar consumo en ai_usage
    if (conversation) {
      await saveMessage(conversation.id, 'bot', replyText);

      if (inputTokens > 0 || outputTokens > 0) {
        await recordAiUsage({
          conversationId: conversation.id,
          userId: user?.id,
          provider: providerUsed,
          model: modelUsed,
          inputTokens,
          outputTokens,
          estimatedCost
        });
      }
    }

    // 5. Enviar mensaje por WhatsApp
    if (from && replyText) {
      await sendWhatsAppMessage(from, replyText);
    }
  } catch (error: any) {
    console.error('[WhatsApp Webhook Handler Error]:', error.message || error);
  }
});

app.get('/api/webhook/whatsapp', (req, res) => {
  // Meta Hub challenge verification
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'aura_crm_whatsapp_secret_2026';

  if (mode === 'subscribe' && token === expectedToken) {
    console.log(`[WhatsApp Webhook] Verificación exitosa de Meta. Challenge enviado.`);
    return res.status(200).send(challenge);
  }

  if (!mode && !token) {
    return res.status(200).send('WhatsApp Webhook Active & Ready');
  }

  console.warn(`[WhatsApp Webhook] Verificación fallida: modo=${mode}, token=${token}`);
  return res.status(403).send('Forbidden');
});

// Vite Middleware Setup for Dev & Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
