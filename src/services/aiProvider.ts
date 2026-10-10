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
const PROVIDER_CONFIGS: Record<string, { baseURL: string; defaultModel: string; apiKeyEnv: string }> = {
  groq: {
    baseURL: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    apiKeyEnv: 'GROQ_API_KEY'
  },
  cerebras: {
    baseURL: 'https://api.cerebras.ai/v1',
    defaultModel: 'llama-3.3-70b',
    apiKeyEnv: 'CEREBRAS_API_KEY'
  },
  nvidia: {
    baseURL: 'https://integrate.api.nvidia.com/v1',
    defaultModel: 'meta/llama-3.1-8b-instruct',
    apiKeyEnv: 'NVIDIA_API_KEY'
  }
};

/**
 * Llamada genérica a APIs compatibles con el estándar OpenAI (Cerebras, Grok, NVIDIA)
 */
async function callOpenAICompatible(
  provider: 'groq' | 'cerebras' | 'nvidia',
  messages: AIMessage[],
  systemInstruction?: string
): Promise<AIResponse> {
  const config = PROVIDER_CONFIGS[provider];
  const apiKey = process.env[config.apiKeyEnv];

  if (!apiKey) {
    throw new Error(`[AI Provider] Falta la variable de entorno ${config.apiKeyEnv}`);
  }

  const formattedMessages = systemInstruction 
    ? [{ role: 'system' as const, content: systemInstruction }, ...messages]
    : messages;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 segundos timeout

  try {
    const res = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.defaultModel,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 350
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`[${provider}] Error HTTP ${res.status}: ${errText}`);
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
      model: config.defaultModel
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw err;
  }
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
      console.log(`[AI Cascade] Éxito con proveedor: ${provider} (Modelo: ${result.model})`);
      return result;
    } catch (err: any) {
      console.warn(`[AI Cascade] Falló ${provider}: ${err.message}. Intentando siguiente en cascada...`);
    }
  }

  throw new Error('Todos los proveedores de la cascada (NVIDIA, Groq, Cerebras) fallaron.');
}
