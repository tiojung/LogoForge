import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "sk-placeholder"
});

interface LogoGenerationRequest {
  businessName: string;
  description?: string;
  style?: string;
  industry?: string;
  colors?: string[];
  referenceImages?: string[];
}

interface LogoVariation {
  id: string;
  concept: string;
  style: string;
  colors: string[];
  description: string;
  prompt: string;
}

export async function generateLogoVariations(request: LogoGenerationRequest): Promise<LogoVariation[]> {
  try {
    const systemPrompt = `You are an expert logo designer and brand strategist. Generate 6 diverse logo concepts based on the user's requirements. 

    Consider:
    - Brand personality and values
    - Target audience appropriateness
    - Scalability and versatility
    - Modern design trends while maintaining timelessness
    - Industry conventions and differentiation opportunities

    Respond with JSON containing an array of logo concepts with these fields:
    - id: unique identifier
    - concept: brief concept description
    - style: design style (modern, classic, playful, organic, minimal, bold, etc.)
    - colors: array of hex color codes
    - description: detailed description for AI image generation
    - prompt: optimized DALL-E prompt for logo creation

    Each concept should be distinctly different in approach, style, and execution.`;

    const userPrompt = `Business Name: ${request.businessName}
    ${request.description ? `Description: ${request.description}` : ''}
    ${request.style ? `Preferred Style: ${request.style}` : ''}
    ${request.industry ? `Industry: ${request.industry}` : ''}
    ${request.colors?.length ? `Preferred Colors: ${request.colors.join(', ')}` : ''}

    Generate 6 diverse logo concepts that would work well for this business.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return result.concepts || [];
  } catch (error) {
    console.error("Error generating logo variations:", error);
    throw new Error("Failed to generate logo variations: " + (error as Error).message);
  }
}

export async function generateLogoImage(concept: LogoVariation): Promise<{ url: string }> {
  try {
    const optimizedPrompt = `Professional logo design: ${concept.prompt}. Clean vector-style design, transparent background, high contrast, scalable, minimal, modern typography if text included. Commercial quality logo design.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: optimizedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "natural"
    });

    return { url: response.data?.[0]?.url || "" };
  } catch (error) {
    console.error("Error generating logo image:", error);
    throw new Error("Failed to generate logo image: " + (error as Error).message);
  }
}

export async function analyzeLogoReference(base64Image: string): Promise<{
  style: string;
  colors: string[];
  elements: string[];
  recommendations: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a logo design expert. Analyze the uploaded logo and provide insights about its style, colors, design elements, and recommendations for improvements. Respond with JSON format."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this logo design and provide: style classification, color palette (hex codes), key design elements, and improvement recommendations. Format as JSON with fields: style, colors, elements, recommendations."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    return JSON.parse(response.choices[0].message.content!);
  } catch (error) {
    console.error("Error analyzing logo reference:", error);
    throw new Error("Failed to analyze logo reference: " + (error as Error).message);
  }
}

export async function generateLogoModifications(
  originalConcept: LogoVariation,
  modifications: {
    changeColors?: boolean;
    addText?: boolean;
    refineShapes?: boolean;
    changeStyle?: boolean;
    customRequest?: string;
  }
): Promise<LogoVariation> {
  try {
    const systemPrompt = `You are a logo design expert tasked with modifying an existing logo concept based on specific requests. Generate a new logo variation that incorporates the requested changes while maintaining design coherence.`;

    const modificationRequests = [];
    if (modifications.changeColors) modificationRequests.push("change color scheme");
    if (modifications.addText) modificationRequests.push("add or modify text elements");
    if (modifications.refineShapes) modificationRequests.push("refine and improve shapes");
    if (modifications.changeStyle) modificationRequests.push("change overall design style");
    if (modifications.customRequest) modificationRequests.push(modifications.customRequest);

    const userPrompt = `Original Logo Concept:
    - Concept: ${originalConcept.concept}
    - Style: ${originalConcept.style}
    - Colors: ${originalConcept.colors.join(', ')}
    - Description: ${originalConcept.description}

    Requested Modifications: ${modificationRequests.join(', ')}

    Create a modified version that incorporates these changes. Respond with JSON containing the new logo concept with fields: id, concept, style, colors, description, prompt.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return result;
  } catch (error) {
    console.error("Error generating logo modifications:", error);
    throw new Error("Failed to generate logo modifications: " + (error as Error).message);
  }
}
