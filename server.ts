import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

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
  // 1. If Whapi Token is present, prioritize Whapi.cloud (QR Web bridge)
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

  // 2. Otherwise fallback to Meta WhatsApp Cloud API
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
      console.log(`[Meta WhatsApp Sent] Mensaje enviado a ${cleanTo}:`, result);
      return result;
    } catch (err: any) {
      console.error('[WhatsApp Send Error]:', err.message || err);
      return null;
    }
  }

  console.warn('[WhatsApp Send] Ni WHAPI_TOKEN ni credenciales de Meta están configuradas en las variables de entorno.');
  return null;
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

    const from = whapiMessage?.chat_id || whapiMessage?.from || metaMessage?.from || req.body?.from;
    const text = whapiMessage?.text?.body || whapiMessage?.body || metaMessage?.text?.body || req.body?.text;
    const senderName = whapiMessage?.from_name || metaContact?.profile?.name || req.body?.senderName || 'Paciente';

    if (!from || !text) {
      return;
    }

    console.log(`[WhatsApp Webhook] Mensaje recibido de ${from} (${senderName}): "${text}"`);

    // Generate intelligent AI response
    let replyText = '';
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: `Mensaje de WhatsApp de ${senderName}:\n"${text}"\n\nResponde como asistente de Clínica Aura:`,
          config: {
            systemInstruction: 'Eres AuraBot, asistente virtual de Clínica Aura Especialistas. Brindas atención empática, respondes dudas de consultas/precios y orientas para agendar citas. Mensajes breves (máx 2 párrafos) con emojis sutiles aptos para WhatsApp.',
            temperature: 0.7,
          }
        });
        replyText = response.text || generateSmartFallbackReply(text, 'AuraBot', 'Clínica Aura Especialistas');
      } catch (e: any) {
        console.error('Error generando respuesta con Gemini:', e.message);
        replyText = generateSmartFallbackReply(text, 'AuraBot', 'Clínica Aura Especialistas');
      }
    } else {
      replyText = generateSmartFallbackReply(text, 'AuraBot', 'Clínica Aura Especialistas');
    }

    // Send the reply back to the patient's phone
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
