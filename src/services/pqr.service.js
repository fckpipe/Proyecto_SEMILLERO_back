const Anthropic = require('@anthropic-ai/sdk');

const SYSTEM_PROMPT = `Eres el asistente virtual de la Secretaría de Movilidad de Cali.
Conoces todo sobre comparendos, cursos pedagógicos, sedes y horarios.
Atiendes PQR: peticiones, quejas y reclamos.
Responde en español colombiano, tono amable e institucional.
Si no puedes resolver algo: escala a humano y da el número de contacto (602 445 9000 ext 1).
Nunca inventes información, solo responde con lo que sabes de trámites de tránsito en Cali.`;

exports.getAnthropicStream = async (history, message) => {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_key_if_missing', // Evitar caída cruda si no hay key
  });

  const messages = [...(history || [])];
  if (message) {
    messages.push({ role: 'user', content: message });
  }

  // Filtrar para asegurar que el formato cumpla con Anthropic API strict roles
  const formattedMessages = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'assistant' : 'user',
    content: msg.content
  }));

  try {
    const stream = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307', // Modelo más rápido y económico
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: formattedMessages,
      stream: true,
    });
    return stream;
  } catch (error) {
    console.error("Anthropic Error:", error);
    throw error;
  }
};
