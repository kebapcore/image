import { GoogleGenAI, GenerateContentResponse, GenerateImagesResponse } from "@google/genai";
import { GEMINI_TEXT_MODEL, IMAGEN_MODEL as EXPORTED_IMAGEN_MODEL, PROMPT_ENHANCEMENT_SYSTEM_INSTRUCTION, PROMPT_VARIATION_SYSTEM_INSTRUCTION } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY for Gemini is not set. Please set the process.env.API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! }); 

export const enhancePrompt = async (
  userPrompt: string,
  aspectRatio: string,
  quality: string
): Promise<string> => {
  try {
    const fullPromptForEnhancement = `User's original prompt: "${userPrompt}"\nDesired aspect ratio: "${aspectRatio}"\nDesired quality: "${quality}"`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: fullPromptForEnhancement,
      config: {
        systemInstruction: PROMPT_ENHANCEMENT_SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingBudget: 0 } 
      },
    });
    
    let enhanced = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = enhanced.match(fenceRegex);
    if (match && match[2]) {
      enhanced = match[2].trim();
    }
    
    if (!enhanced) {
        console.warn("Gemini returned an empty enhanced prompt. Using original prompt as fallback.");
        return `An attempt to enhance the prompt for "${userPrompt}" (aspect ratio: ${aspectRatio}, quality: ${quality}) failed. Original prompt: ${userPrompt}`;
    }
    return enhanced;

  } catch (error) {
    console.error("Error enhancing prompt with Gemini:", error);
    if (error instanceof Error) {
        return `Error enhancing prompt: ${error.message}. Original prompt: ${userPrompt}`;
    }
    return `An unknown error occurred while enhancing prompt. Original prompt: ${userPrompt}`;
  }
};

export const generateImage = async (
  enhancedPrompt: string,
): Promise<string> => {
  try {
    const response: GenerateImagesResponse = await ai.models.generateImages({
      model: EXPORTED_IMAGEN_MODEL,
      prompt: enhancedPrompt,
      config: { 
        numberOfImages: 1, 
        outputMimeType: 'image/jpeg'
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image.imageBytes) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
      throw new Error("No image generated or image data missing from Imagen response.");
    }
  } catch (error) {
    console.error("Error generating image with Imagen:", error);
     if (error instanceof Error) {
        throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error("Failed to generate image due to an unknown error.");
  }
};

export const generatePromptVariation = async (
  basePrompt: string,
  previousVariations: string[] = [] // Added previousVariations parameter
): Promise<string> => {
  try {
    let contentForGemini = `Base Prompt: "${basePrompt}"\n\n`;
    if (previousVariations.length > 0) {
      contentForGemini += "Previously Generated Prompts (try to be different from these):\n";
      previousVariations.forEach(prev => {
        contentForGemini += `- ${prev}\n`;
      });
      contentForGemini += "\nGenerate a new, unique variation based on the Base Prompt:";
    } else {
      contentForGemini += "Generate a new, unique variation based on the Base Prompt:";
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: contentForGemini, // Use the constructed content
      config: {
        systemInstruction: PROMPT_VARIATION_SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingBudget: 0 } 
      },
    });
    
    let variedPrompt = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = variedPrompt.match(fenceRegex);
    if (match && match[2]) {
      variedPrompt = match[2].trim();
    }
    
    if (!variedPrompt) {
        const fallbackPrompt = `A highly detailed, artistic, and unique variation inspired by the concept: "${basePrompt}".`;
        console.warn(`Gemini returned an empty varied prompt for base: "${basePrompt}". Using fallback: "${fallbackPrompt}"`);
        return fallbackPrompt;
    }
    return variedPrompt;

  } catch (error) {
    console.error(`Error generating prompt variation for base "${basePrompt}":`, error);
    const fallbackErrorPrompt = `A creative and detailed scene based on: "${basePrompt}". (Error occurred during advanced variation).`;
    return fallbackErrorPrompt;
  }
};

export { EXPORTED_IMAGEN_MODEL as IMAGEN_MODEL };