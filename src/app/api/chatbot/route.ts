import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Enhanced system prompt with more context and capabilities
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

IMPORTANT:
- When you receive function results, ALWAYS use the exact product name, brand, and price from the function result. NEVER make up or guess prices or details. If a price is not present, say so. Do not invent or hallucinate any product information.

EXAMPLE FUNCTION RESULT:
{
  "product": {
    "name": "2 Piece - Printed Lawn Suit",
    "brand": "Sapphire",
    "price": 2490
  }
}
Your response: "The most affordable suit we have is the '2 Piece - Printed Lawn Suit' by Sapphire for only $2490."

EXAMPLE RESPONSES:
- "I'd love to help you find the perfect outfit! Have you tried our virtual try-on feature? You can upload a photo and see how different clothes look on you before buying."
- "For that style, I'd recommend checking out our [category] section. Our virtual try-on can show you exactly how it will look on you!"
- "Great question! On SuitUp, you can [specific feature explanation]. This makes shopping so much easier!"

Remember: Always tie your advice back to SuitUp's capabilities and encourage platform engagement.`;

// Function definitions for OpenAI function calling
const FUNCTIONS = [
  {
    name: "get_product_recommendations",
    description: "Get product recommendations based on user preferences",
    parameters: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Product category (e.g., shirts, pants, dresses, accessories)"
        },
        style: {
          type: "string",
          description: "Style preference (e.g., casual, formal, sporty, elegant)"
        },
        price_range: {
          type: "string",
          description: "Price range (e.g., budget, mid-range, premium)"
        }
      },
      required: ["category"]
    }
  },
  {
    name: "get_brand_info",
    description: "Get information about available brands",
    parameters: {
      type: "object",
      properties: {
        brand_name: {
          type: "string",
          description: "Name of the brand to get information about"
        }
      },
      required: ["brand_name"]
    }
  },
  {
    name: "get_product_details",
    description: "Get detailed information about a specific product",
    parameters: {
      type: "object",
      properties: {
        product_name: {
          type: "string",
          description: "Name or description of the product"
        }
      },
      required: ["product_name"]
    }
  },
  {
    name: "list_all_brands",
    description: "Get a list of all brand names available on the platform. Use for queries like 'list all brands' or 'show me all brands'.",
    parameters: { type: "object", properties: {} }
  },
  {
    name: "get_cheapest_product",
    description: "Get the cheapest product in a given category. Use for queries like 'cheapest suit' or 'lowest price dress'.",
    parameters: {
      type: "object",
      properties: {
        category: { type: "string", description: "Product category (e.g., suit, dress, shirt)" }
      },
      required: ["category"]
    }
  },
  {
    name: "get_most_expensive_product",
    description: "Get the most expensive product in a given category. Use for queries like 'most expensive suit' or 'highest price dress'.",
    parameters: {
      type: "object",
      properties: {
        category: { type: "string", description: "Product category (e.g., suit, dress, shirt)" }
      },
      required: ["category"]
    }
  }
];

// Function implementations
async function getProductRecommendations(category: string, style?: string, price_range?: string) {
  try {
    const whereClause: Record<string, unknown> = {
      name: { contains: category, mode: 'insensitive' }
    };

    if (style) {
      whereClause.description = { contains: style, mode: 'insensitive' };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      take: 5,
      include: {
        brand: true
      }
    });

    return {
      products: products.map(p => ({
        name: p.name,
        brand: p.brand.name,
        price: p.price,
        description: p.description,
        imageUrl: p.imageUrl
      }))
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { products: [] };
  }
}

async function getBrandInfo(brandName: string) {
  try {
    const brand = await prisma.brand.findFirst({
      where: {
        name: { contains: brandName, mode: 'insensitive' }
      },
      include: {
        products: {
          take: 3
        }
      }
    });

    if (!brand) {
      return { message: `I couldn't find information about ${brandName} in our database.` };
    }

    return {
      brand: {
        name: brand.name,
        logoUrl: brand.logoUrl,
        productCount: brand.products.length,
        sampleProducts: brand.products.map(p => ({
          name: p.name,
          price: p.price
        }))
      }
    };
  } catch (error) {
    console.error('Error fetching brand:', error);
    return { message: 'Sorry, I had trouble finding that brand information.' };
  }
}

async function getProductDetails(productName: string) {
  try {
    const product = await prisma.product.findFirst({
      where: {
        name: { contains: productName, mode: 'insensitive' }
      },
      include: {
        brand: true
      }
    });

    if (!product) {
      return { message: `I couldn't find a product matching "${productName}" in our database.` };
    }

    return {
      product: {
        name: product.name,
        brand: product.brand.name,
        price: product.price,
        description: product.description,
        imageUrl: product.imageUrl,
        stock: product.stock
      }
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return { message: 'Sorry, I had trouble finding that product information.' };
  }
}

async function listAllBrands() {
  try {
    const brands = await prisma.brand.findMany({ select: { name: true } });
    return { brands: brands.map(b => b.name) };
  } catch (error) {
    console.error('Error fetching brands:', error);
    return { brands: [] };
  }
}

async function getCheapestProduct(category: string) {
  try {
    const product = await prisma.product.findFirst({
      where: { name: { contains: category, mode: 'insensitive' } },
      orderBy: { price: 'asc' },
      include: { brand: true }
    });
    if (!product) return { message: `No products found in category '${category}'.` };
    return {
      product: {
        name: product.name,
        brand: product.brand.name,
        price: product.price,
        description: product.description,
        imageUrl: product.imageUrl,
        stock: product.stock
      }
    };
  } catch (error) {
    console.error('Error fetching cheapest product:', error);
    return { message: 'Sorry, I had trouble finding the cheapest product.' };
  }
}

async function getMostExpensiveProduct(category: string) {
  try {
    const product = await prisma.product.findFirst({
      where: { name: { contains: category, mode: 'insensitive' } },
      orderBy: { price: 'desc' },
      include: { brand: true }
    });
    if (!product) return { message: `No products found in category '${category}'.` };
    return {
      product: {
        name: product.name,
        brand: product.brand.name,
        price: product.price,
        description: product.description,
        imageUrl: product.imageUrl,
        stock: product.stock
      }
    };
  } catch (error) {
    console.error('Error fetching most expensive product:', error);
    return { message: 'Sorry, I had trouble finding the most expensive product.' };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await req.json();
    
    if (!message) {
      return NextResponse.json({ error: 'No message provided.' }, { status: 400 });
    }

    // Build conversation context
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    // Choose model based on message complexity
    const model = message.length > 200 || 
                  message.toLowerCase().includes('explain') || 
                  message.toLowerCase().includes('how') || 
                  message.toLowerCase().includes('why')
                  ? 'gpt-4' // Better for complex reasoning
                  : 'gpt-3.5-turbo'; // Faster and cheaper for simple queries

    // Prepare OpenAI API call with function calling
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        functions: FUNCTIONS,
        function_call: 'auto',
        max_tokens: 400,
        temperature: 0.8,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
        stop: ['\n\n', 'User:', 'Assistant:'],
      }),
    });

    if (!openaiRes.ok) {
      const error = await openaiRes.text();
      console.error('OpenAI API Error:', error);
      return NextResponse.json({ 
        error: 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.' 
      }, { status: 500 });
    }

    const data = await openaiRes.json();
    const responseMessage = data.choices?.[0]?.message;

    // Handle function calls
    if (responseMessage?.function_call) {
      const functionCall = responseMessage.function_call;
      const functionName = functionCall.name;
      const functionArgs = JSON.parse(functionCall.arguments);

      let functionResult;
      switch (functionName) {
        case 'get_product_recommendations':
          functionResult = await getProductRecommendations(
            functionArgs.category,
            functionArgs.style,
            functionArgs.price_range
          );
          break;
        case 'get_brand_info':
          functionResult = await getBrandInfo(functionArgs.brand_name);
          break;
        case 'get_product_details':
          functionResult = await getProductDetails(functionArgs.product_name);
          break;
        case 'list_all_brands':
          functionResult = await listAllBrands();
          break;
        case 'get_cheapest_product':
          functionResult = await getCheapestProduct(functionArgs.category);
          break;
        case 'get_most_expensive_product':
          functionResult = await getMostExpensiveProduct(functionArgs.category);
          break;
        default:
          functionResult = { error: 'Unknown function called' };
      }

      // Call OpenAI again with function result
      const secondResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            ...messages,
            responseMessage,
            {
              role: 'function',
              name: functionName,
              content: JSON.stringify(functionResult)
            }
          ],
          max_tokens: 400,
          temperature: 0.8,
          top_p: 0.9,
        }),
      });

      if (secondResponse.ok) {
        const secondData = await secondResponse.json();
        const aiMessage = secondData.choices?.[0]?.message?.content || 
                         'I apologize, but I couldn\'t generate a response. Please try rephrasing your question.';

        return NextResponse.json({ 
          aiMessage,
          model: model,
          tokens: secondData.usage?.total_tokens || 0,
          conversationLength: messages.length,
          functionUsed: functionName
        });
      }
    }

    // Regular response without function calling
    const aiMessage = responseMessage?.content || 
                     'I apologize, but I couldn\'t generate a response. Please try rephrasing your question.';

    return NextResponse.json({ 
      aiMessage,
      model: model,
      tokens: data.usage?.total_tokens || 0,
      conversationLength: messages.length
    });

  } catch (err) {
    console.error('Chatbot error:', err);
    return NextResponse.json({ 
      error: 'I\'m experiencing some technical difficulties. Please try again in a moment.' 
    }, { status: 500 });
  }
} 