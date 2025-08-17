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

    Generate 6 diverse logo concepts that are CLEAN and PROFESSIONAL. Each prompt must create logos that look human-designed, not AI-generated.
    
    CRITICAL PROMPT REQUIREMENTS:
    - Start each prompt with "Professional minimalist logo design for [business name]"
    - Include "vector style illustration, clean geometric shapes, flat design"
    - Add "solid colors only, no gradients, no shadows, no 3D effects"
    - Specify "white background, high contrast"
    - Use "corporate branding style, scalable design"
    - Include specific hex color codes
    - End with "simple and memorable, professional quality"

    FOCUS ON: Simple wordmarks, single geometric icons, typography-based designs, monogram logos, Nike-style minimalist symbols.
    AVOID: Complex illustrations, realistic imagery, multiple elements, busy compositions, photographic elements.
    
    ESSENTIAL: Include 2-3 concepts that use ONLY BLACK COLOR (#000000) for Nike-style minimalism - simple, iconic symbols that work standalone without text.
    
    FOR NIKE-STYLE CONCEPTS: Create prompts like "Single black geometric symbol for [business], Nike swoosh style, minimal curved line/shape, iconic standalone symbol, black (#000000) only, no text, vector illustration"
    
    FOR TYPOGRAPHY WORDMARKS: Create prompts like "Clean modern wordmark for [business], custom typography, geometric sans-serif font, perfectly spaced letters, black (#000000) text only, professional typography design"`;

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
        concept: "Nike-Style Minimalist Symbol",
        style: "minimalist icon",
        colors: ["#000000"],
        description: "An extremely simple, iconic black symbol that works standalone - inspired by Nike's swoosh approach",
        prompt: `Single black geometric symbol for ${request.businessName}, Nike swoosh style, minimal curved line or simple shape, iconic standalone symbol, black (#000000) only, no text, no company name, vector illustration, clean geometric form, flat design, white background, high contrast, extremely simple like Nike swoosh`
      },
      {
        id: "fallback-2", 
        concept: "Modern Black Wordmark",
        style: "typography",
        colors: ["#000000"],
        description: "Clean, modern typography using only black color for maximum impact and simplicity",
        prompt: `Clean modern wordmark for ${request.businessName}, custom typography, geometric sans-serif font, perfectly spaced letters, black (#000000) text only, professional typography design, vector style, flat design, white background, high contrast, modern font styling, excellent kerning and spacing`
      },
      {
        id: "fallback-3",
        concept: "Geometric Monogram",
        style: "monogram",
        colors: ["#000000"],
        description: "Simple geometric monogram using initials in pure black",
        prompt: `Geometric monogram using initials from ${request.businessName}, interlocking letters, black (#000000) only, clean geometric letterforms, modern sans-serif style, vector illustration, flat design, white background, high contrast, sophisticated typography, overlapping or connected letters`
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
