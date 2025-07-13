import OpenAI from "openai";
import type { ChatRequest, ChatResponse } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function generateFoodRecommendations(
  request: ChatRequest,
  menuItems: any[]
): Promise<ChatResponse> {
  try {
    const { message, spiceLevel, flavors, language } = request;
    
    const systemPrompt = language === 'es' 
      ? `Eres un chef AI experto que ayuda a los usuarios a encontrar la comida perfecta. Analiza sus preferencias y recomienda platos del menú disponible.`
      : `You are an expert AI chef that helps users find perfect food matches. Analyze their preferences and recommend dishes from the available menu.`;

    const userPrompt = language === 'es'
      ? `El usuario dice: "${message}"
         Nivel de picante preferido: ${spiceLevel}/5
         Sabores preferidos: ${flavors.join(', ')}
         
         Basándote en estas preferencias, recomienda platos del menú y proporciona una respuesta útil.
         Responde en formato JSON con esta estructura: { "message": "tu respuesta", "recommendations": ["id1", "id2", "id3"], "confidence": 0.8 }`
      : `User says: "${message}"
         Preferred spice level: ${spiceLevel}/5
         Preferred flavors: ${flavors.join(', ')}
         
         Based on these preferences, recommend dishes from the menu and provide a helpful response.
         Respond in JSON format with this structure: { "message": "your response", "recommendations": ["id1", "id2", "id3"], "confidence": 0.8 }`;

    const menuContext = `Available menu items: ${JSON.stringify(menuItems.map(item => ({
      _id: item._id,
      name: item.name[language],
      description: item.description[language],
      spiceLevel: item.spiceLevel,
      flavors: item.flavors,
      price: item.price,
      rating: item.rating
    })))}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `${userPrompt}\n\n${menuContext}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      message: result.message || (language === 'es' ? '¡Encontré algunas opciones geniales para ti!' : 'I found some great options for you!'),
      recommendations: result.recommendations || [],
      confidence: Math.max(0, Math.min(1, result.confidence || 0.8)),
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Fallback response
    const fallbackMessage = request.language === 'es' 
      ? 'Lo siento, no pude procesar tu solicitud en este momento. Por favor, intenta de nuevo.'
      : 'Sorry, I couldn\'t process your request right now. Please try again.';
    
    return {
      message: fallbackMessage,
      recommendations: [],
      confidence: 0.1,
    };
  }
}

export async function generateSurpriseRecommendation(
  spiceLevel: number,
  flavors: string[],
  language: string,
  menuItems: any[]
): Promise<ChatResponse> {
  const surpriseRequest: ChatRequest = {
    message: language === 'es' ? 'Sorpréndeme con algo delicioso' : 'Surprise me with something delicious',
    spiceLevel,
    flavors,
    language: language as 'en' | 'es',
  };

  return generateFoodRecommendations(surpriseRequest, menuItems);
}
