import { NextRequest } from 'next/server';

const SYSTEM_PROMPT = `You are SuitUp AI, an intelligent virtual assistant for a premium virtual try-on and e-commerce platform. 

CORE CAPABILITIES:
- Virtual Try-On: Users can upload photos and try on clothes virtually using AI
- Product Recommendations: Suggest clothing based on style preferences and body type
- Shopping Assistance: Help with product discovery, sizing, and purchase decisions
- Style Advice: Provide fashion tips and outfit coordination suggestions
- Order Support: Help with order tracking, returns, and customer service

PERSONALITY:
- Friendly, professional, and fashion-forward
- Always encourage users to try the virtual try-on feature
- Provide specific, actionable advice
- Be enthusiastic about fashion and technology
- Use fashion terminology appropriately

RESPONSE GUIDELINES:
- Keep responses concise but informative (150-300 words max)
- Always mention SuitUp's unique virtual try-on feature when relevant
- Suggest specific actions users can take on the platform
- If asked about features, explain how they work on SuitUp
- For fashion advice, consider different body types and styles
- Encourage engagement with the platform's features

Remember: Always tie your advice back to SuitUp's capabilities and encourage platform engagement.`;

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await req.json();
    
    if (!message) {
      return new Response('No message provided.', { status: 400 });
    }

    // Build conversation context
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-10),
      { role: 'user', content: message }
    ];

    // Choose model based on message complexity
    const model = message.length > 200 || 
                  message.toLowerCase().includes('explain') || 
                  message.toLowerCase().includes('how') || 
                  message.toLowerCase().includes('why')
                  ? 'gpt-4' 
                  : 'gpt-3.5-turbo';

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model,
              messages,
              max_tokens: 400,
              temperature: 0.8,
              top_p: 0.9,
              frequency_penalty: 0.1,
              presence_penalty: 0.1,
              stream: true,
            }),
          });

          if (!response.ok) {
            await response.text();
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'OpenAI API error' })}\n\n`));
            controller.close();
            return;
          }

          const reader = response.body?.getReader();
          if (!reader) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'No response body' })}\n\n`));
            controller.close();
            return;
          }

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.choices?.[0]?.delta?.content) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                      content: parsed.choices[0].delta.content 
                    })}\n\n`));
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }

          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Streaming error' })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (err) {
    console.error('Chatbot stream error:', err);
    return new Response('Internal server error', { status: 500 });
  }
} 