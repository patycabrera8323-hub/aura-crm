import dotenv from 'dotenv';

dotenv.config();

export interface AIResponse {
  text: string;
  inputTokens: number;
  outputTokens: number;
  provider: string;
  model: string;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Configuración de endpoints y modelos oficiales
const PROVIDER_CONFIGS: Record<string, { baseURL: string; models: string[]; getApiKey: () => string | undefined }> = {
  nvidia: {
    baseURL: 'https://integrate.api.nvidia.com/v1',
    models: [
      'nvidia/nemotron-3.5-lightning-30b-a3b', // Ultra rápido y gratuito de tu consola NVIDIA
      'deepseek-ai/deepseek-v4.1-flash'
    ],
    getApiKey: () => process.env.NVIDIA_API_KEY ? process.env.NVIDIA_API_KEY.trim().replace(/^["']|["']$/g, '') : undefined
  },
  groq: {
    baseURL: 'https://api.groq.com/openai/v1',
    models: [
      'llama-3.3-70b-versatile', // Modelo estrella de Meta en Groq: multilingüe nativo (español, inglés, coreano, etc.)
      'llama-3.1-8b-instant',
      'qwen-2.5-32b'
    ],
    getApiKey: () => process.env.GROQ_API_KEY || process.env.GROK_API_KEY
  },
  cerebras: {
    baseURL: 'https://api.cerebras.ai/v1',
    models: [
      'gpt-oss-120b',
      'qwen-3.8-27b',
      'llama-3.3-70b'
    ],
    getApiKey: () => process.env.CEREBRAS_API_KEY
  }
};

/**
 * Llamada genérica a APIs compatibles con el estándar OpenAI (Cerebras, Groq, NVIDIA)
 */
async function callOpenAICompatible(
  provider: 'groq' | 'cerebras' | 'nvidia',
  messages: AIMessage[],
  systemInstruction?: string
): Promise<AIResponse> {
  const config = PROVIDER_CONFIGS[provider];
  const apiKey = config.getApiKey();

  if (!apiKey) {
    throw new Error(`[AI Provider] Falta la API Key para ${provider} en las variables de entorno.`);
  }

  const formattedMessages = systemInstruction 
    ? [{ role: 'system' as const, content: systemInstruction }, ...messages]
    : messages;

  let lastError = '';

  // Probar cada modelo de la lista del proveedor si alguno da 404
  for (const model of config.models) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 segundos timeout para DeepSeek/NVIDIA

    try {
      const res = await fetch(`${config.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          temperature: 0.7,
          max_tokens: 600
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errText = await res.text();
        lastError = `[${provider}] Error HTTP ${res.status} con modelo ${model}: ${errText}`;
        console.warn(lastError);
        continue; // Probar siguiente modelo del mismo proveedor
      }

      const data = await res.json();
      const rawContent = data.choices?.[0]?.message?.content || '';
      let replyText = rawContent;

      // Si el modelo incluye su proceso de pensamiento (Reasoning/Thinking block), extraer la respuesta final
      if (replyText.includes("<think>") || replyText.includes("</think>") || replyText.includes("**Draft") || replyText.includes("thinking process") || replyText.includes("**Final Response")) {
        // 1. Quitar cualquier etiqueta <think>...</think>
        replyText = replyText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

        // 2. Si tiene sección explícita de Final Response o Draft Response:
        const finalMatch = replyText.match(/\*\*(?:Final Response|Draft Response|Response)[^*]*\*\*:\s*([\s\S]*?)(?=\n\s*(?:Check against rules|Rules applied|\*\*|$))/i);
        if (finalMatch && finalMatch[1]?.trim()) {
          replyText = finalMatch[1].trim();
        } else {
          // 3. Tomar el texto después de la última línea de análisis
          const cleanParagraphs = replyText.split(/\n\n+/).filter((p: string) => 
            !p.trim().startsWith('1.') && 
            !p.trim().startsWith('2.') && 
            !p.trim().startsWith('3.') && 
            !p.trim().startsWith('4.') && 
            !p.trim().startsWith('5.') && 
            !p.trim().startsWith('**') &&
            !p.toLowerCase().includes('reasoning') &&
            !p.toLowerCase().includes('analyzing')
          );
          if (cleanParagraphs.length > 0) {
            replyText = cleanParagraphs[cleanParagraphs.length - 1].trim();
          }
        }
      }

      // Si después del filtro quedó vacío o solo espacios, usar el rawContent limpio o un mensaje directo
      if (!replyText || replyText.trim().length === 0) {
        replyText = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim() || rawContent.trim();
      }

      console.log(`[AI Provider: ${provider}] Modelo ${model} respondió: "${replyText.substring(0, 100)}..."`);

      const inputTokens = data.usage?.prompt_tokens || 0;
      const outputTokens = data.usage?.completion_tokens || 0;

      return {
        text: replyText.trim(),
        inputTokens,
        outputTokens,
        provider,
        model
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err.message;
    }
  }

  throw new Error(lastError || `Ningún modelo de ${provider} respondió exitosamente.`);
}

/**
 * Orquestador en Cascada:
 * Permite configurar el proveedor primario con AI_PRIMARY_PROVIDER (groq, nvidia, cerebras).
 * Por defecto: 1° Groq (Llama 3.3 multilingüe) -> 2° NVIDIA -> 3° Cerebras
 */
export async function generateCascadeResponse(
  messages: AIMessage[],
  systemInstruction: string
): Promise<AIResponse> {
  // Obtener proveedor primario preferido por variable de entorno si existe
  const envPrimary = (process.env.AI_PRIMARY_PROVIDER || 'groq').toLowerCase().trim() as 'groq' | 'nvidia' | 'cerebras';
  
  // Lista de prioridad asegurando que el primario va primero
  const defaultOrder: Array<'groq' | 'nvidia' | 'cerebras'> = ['groq', 'nvidia', 'cerebras'];
  const providers: Array<'groq' | 'nvidia' | 'cerebras'> = [
    envPrimary,
    ...defaultOrder.filter(p => p !== envPrimary)
  ];

  for (const provider of providers) {
    try {
      console.log(`[AI Cascade] Intentando proveedor: ${provider}...`);
      const result = await callOpenAICompatible(provider, messages, systemInstruction);
      console.log(`[AI Cascade] ✅ Éxito con proveedor: ${provider} (Modelo: ${result.model})`);
      return result;
    } catch (err: any) {
      console.warn(`[AI Cascade] ⚠️ Falló ${provider}: ${err.message?.substring(0, 120)}. Intentando siguiente...`);
    }
  }

  throw new Error('Todos los proveedores de la cascada (Groq, Cerebras, NVIDIA) fallaron.');
}
