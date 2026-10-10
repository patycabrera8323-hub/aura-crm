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
  cerebras: {
    baseURL: 'https://api.cerebras.ai/v1',
    defaultModel: 'llama3.1-8b',
    apiKeyEnv: 'CEREBRAS_API_KEY'
  },
  grok: {
    baseURL: 'https://api.x.ai/v1',
    defaultModel: 'grok-2-latest',
    apiKeyEnv: 'GROK_API_KEY'
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
  provider: 'cerebras' | 'grok' | 'nvidia',
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
  const primary = (process.env.AI_PRIMARY_PROVIDER || 'cerebras').toLowerCase() as 'cerebras' | 'grok' | 'nvidia';
  const fallback = (process.env.AI_FALLBACK_PROVIDER || 'grok').toLowerCase() as 'cerebras' | 'grok' | 'nvidia';

  // 1. Intentar proveedor principal
  try {
    console.log(`[AI Cascade] Ejecutando proveedor principal: ${primary}...`);
    return await callOpenAICompatible(primary, messages, systemInstruction);
  } catch (err: any) {
    console.warn(`[AI Cascade] Falló el proveedor principal (${primary}): ${err.message}. Saltando al fallback (${fallback})...`);
  }

  // 2. Intentar proveedor de respaldo
  try {
    console.log(`[AI Cascade] Ejecutando proveedor fallback: ${fallback}...`);
    return await callOpenAICompatible(fallback, messages, systemInstruction);
  } catch (fallbackErr: any) {
    console.error(`[AI Cascade] También falló el proveedor fallback (${fallback}): ${fallbackErr.message}`);
    throw fallbackErr;
  }
}
