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
    console.log("Generating logo variations for:", request);
    
    const systemPrompt = `You are an expert logo designer and brand strategist. Generate 6 diverse, professional logo concepts that will look clean and human-designed when created by AI.

    CRITICAL DESIGN PRINCIPLES for professional logos:
    - Use SIMPLE, geometric shapes and clean lines
    - Focus on TYPOGRAPHY-BASED designs or simple icons
    - Avoid complex illustrations, gradients, or detailed imagery
    - Use 1-3 solid colors maximum (include pure black monochrome options)
    - Design for scalability and vector conversion
    - Create logos that work in black and white
    - Include Nike-style minimalist concepts using only black color
    - Create iconic symbols that are instantly recognizable

    IMPORTANT: You must respond with valid JSON in exactly this format:
    {
      "concepts": [
        {
          "id": "unique-id-1",
          "concept": "brief concept description",
          "style": "design style",
          "colors": ["#hex1", "#hex2", "#hex3"],
          "description": "detailed description for AI image generation",
          "prompt": "optimized DALL-E prompt for logo creation"
        }
      ]
    }

    Each concept should be distinctly different in approach, style, and execution.`;

    const userPrompt = `Business Name: ${request.businessName}
    ${request.description ? `Description: ${request.description}` : ''}
    ${request.style ? `Preferred Style: ${request.style}` : ''}
    ${request.industry ? `Industry: ${request.industry}` : ''}
    ${request.colors?.length ? `Preferred Colors: ${request.colors.join(', ')}` : ''}

    Generate 6 diverse logo concepts that are CLEAN, PROFESSIONAL, and MEANINGFUL to the business purpose. Each prompt must create logos that look human-designed and relate to the business.

    CRITICAL REQUIREMENTS:
    - Make logos RELEVANT to the specific business described (analyze the business name and description to determine appropriate symbols/elements)
    - Use minimal geometric shapes that relate to the business purpose/industry
    - Include typography that reflects the business personality
    - Create concepts that work at any size
    
    PROMPT STRUCTURE:
    - Start with design type (wordmark, icon, monogram, etc.)
    - Specify the business-relevant elements to include
    - Use "vector style, clean geometric shapes, flat design"
    - Add "solid colors only, no gradients, no shadows"
    - Include specific color codes
    - End with "professional, scalable, memorable"

    FOCUS ON: Business-relevant minimal icons, clean wordmarks, meaningful monograms, simple geometric symbols related to the business purpose.
    AVOID: Generic shapes, complex illustrations, unrelated symbols.
    
    ESSENTIAL: Include 2-3 concepts that use ONLY BLACK COLOR (#000000) for ultra-minimalist approach - simple, iconic symbols that relate to the specific business.
    
    BUSINESS ANALYSIS: First analyze the business name and description to identify relevant symbols/elements (e.g., tech company = geometric circuits/nodes, food business = simple utensils/shapes, fitness = basic geometric body forms, etc.)
    
    FOR TYPOGRAPHY WORDMARKS: Create prompts that specify typography style appropriate for the business type and personality.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const content = response.choices[0].message.content!;
    console.log("OpenAI response content:", content);
    
    const result = JSON.parse(content);
    console.log("Parsed result:", result);
    
    return result.concepts || result.logos || result.variations || [];
  } catch (error) {
    console.error("Error generating logo variations:", error);
    console.error("Full error details:", JSON.stringify(error, null, 2));
    
    // Return fallback data for testing if OpenAI fails
    console.log("Returning fallback logo concepts for testing");
    return [
      {
        id: "fallback-1",
        concept: "Minimalist Business Icon",
        style: "geometric icon",
        colors: ["#000000"],
        description: "A simple geometric symbol that relates to the business purpose, using clean minimal shapes",
        prompt: `Minimalist business icon for ${request.businessName}, simple geometric symbol relevant to the business purpose, black (#000000) only, vector style, clean shapes, flat design, no text, professional symbol, scalable, memorable`
      },
      {
        id: "fallback-2", 
        concept: "Modern Typography Wordmark",
        style: "wordmark",
        colors: ["#000000"],
        description: "Clean, modern typography appropriate for the business type and personality",
        prompt: `Modern typography wordmark for ${request.businessName}, clean geometric sans-serif font, perfectly spaced letters, black (#000000) text only, professional typography design appropriate for business type, vector style, flat design, excellent kerning`
      },
      {
        id: "fallback-3",
        concept: "Business Monogram",
        style: "monogram",
        colors: ["#000000"],
        description: "Monogram using business initials with clean, professional styling",
        prompt: `Professional monogram using initials from ${request.businessName}, clean geometric letterforms, black (#000000) only, modern sans-serif style, vector illustration, sophisticated typography, overlapping or interlocked letters`
      }
    ];
  }
}

export async function generateLogoImage(concept: LogoVariation): Promise<{ url: string }> {
  try {
    // Use the concept's prompt directly since it's already optimized for professional quality
    const optimizedPrompt = concept.prompt;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: optimizedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "vivid" // Use vivid for better contrast and professional appearance
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
