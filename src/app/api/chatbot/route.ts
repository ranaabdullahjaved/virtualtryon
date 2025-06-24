import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'No message provided.' }, { status: 400 });
    }

    // Prepare OpenAI API call
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are SuitUp AI, a helpful assistant for a virtual try-on and e-commerce platform. Answer questions about virtual try-on, clothing brands, products, shopping, and the SuitUp platform. Be friendly, concise, and helpful. If asked about features, always relate them to SuitUp's capabilities.`
          },
          { role: 'user', content: message },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!openaiRes.ok) {
      const error = await openaiRes.text();
      return NextResponse.json({ error: 'OpenAI error: ' + error }, { status: 500 });
    }
    const data = await openaiRes.json();
    const aiMessage = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
    return NextResponse.json({ aiMessage });
  } catch (err) {
    return NextResponse.json({ error: 'Chatbot error.' }, { status: 500 });
  }
} 