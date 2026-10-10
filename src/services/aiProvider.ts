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
      'deepseek-ai/deepseek-v4.1-flash' // Modelo oficial gratuito confirmado de tu consola NVIDIA
    ],
    getApiKey: () => process.env.NVIDIA_API_KEY
  },
  groq: {
    baseURL: 'https://api.groq.com/openai/v1',
    models: [
      'qwen/qwen3.8-27b',
      'openai/gpt-oss-120b',
      'deepseek-r1-distill-llama-70b'
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
          max_tokens: 350
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
      const replyText = data.choices?.[0]?.message?.content || '';
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
 * Intenta primero con AI_PRIMARY_PROVIDER (default: cerebras)
 * Si falla, salta a AI_FALLBACK_PROVIDER (default: grok o nvidia)
 */
export async function generateCascadeResponse(
  messages: AIMessage[],
  systemInstruction: string
): Promise<AIResponse> {
  // Jerarquía definida: 1° NVIDIA -> 2° Groq -> 3° Cerebras
  const providers: Array<'nvidia' | 'groq' | 'cerebras'> = ['nvidia', 'groq', 'cerebras'];

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
