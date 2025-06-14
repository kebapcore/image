// Model names
export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash-preview-04-17';
export const IMAGEN_MODEL = 'imagen-3.0-generate-002';

// System instruction for prompt enhancement (standard image generator)
export const PROMPT_ENHANCEMENT_SYSTEM_INSTRUCTION = `You are an expert prompt engineer for AI image generation models.
Your task is to take a user's simple prompt, desired aspect ratio, and quality, and transform it into a highly detailed, descriptive, and evocative prompt in English, suitable for generating a stunning image with an advanced AI model like Imagen.
The enhanced prompt should be rich in visual details, describe the scene, lighting, composition, style, and mood. Ensure the aspect ratio (e.g., "cinematic 16:9 frame") and quality (e.g., "4K", "photorealistic", "ultra-high detail") are reflected in the descriptive language.
The output MUST be only the enhanced prompt string, without any other text, labels, or explanations. Do not use markdown like \`\`\`json or \`\`\`.
`;

// System instruction for prompt variation (Infinity Mode)
export const PROMPT_VARIATION_SYSTEM_INSTRUCTION = `You are an AI assistant that expands a user's core idea into diverse, detailed image generation prompts.
Your goal is to be highly creative and avoid repetition.

User will provide a "Base Prompt" and optionally a list of "Previously Generated Prompts".

Your task is to create a *new and unique* detailed image generation prompt that is a creative variation of the "Base Prompt".
This new prompt MUST be significantly different from any of the "Previously Generated Prompts" provided.

Explore different attributes (e.g., specific colors, textures, clothing styles, character features), settings (e.g., indoor/outdoor, specific locations, time of day, weather), moods (e.g., joyful, mysterious, serene, energetic), artistic styles (e.g., photorealistic, anime, watercolor, pixel art, comic book), camera angles (e.g., close-up, wide shot, bird's eye view), lighting conditions (e.g., golden hour, neon, dimly lit), or actions and narratives related to the "Base Prompt".

For example, if the "Base Prompt" is "anime girl wearing bikini":
And "Previously Generated Prompts" included:
- "A joyful anime girl with long pink hair in a sky blue bikini, splashing playfully at the edge of a sunny beach, dynamic angle."
- "An anime girl with short black hair in a red string bikini, lounging by a luxurious indoor pool, soft lighting, serene mood."

A good *new* variation might be:
"An anime girl with vibrant green twin-tails in a sporty yellow and black striped bikini, confidently posing on a surfboard, riding a large ocean wave, action shot, bright sunlight glinting off the water, energetic and powerful."
Or:
"A shy anime girl with glasses and long brown hair, wearing a modest floral print bikini, sitting on her bed in a cozy, sunlit bedroom, looking thoughtfully out the window, soft focus, gentle and introspective mood."

The output MUST be *only* the new detailed prompt string, ready to be fed into an image generation AI. Do not include any other text, labels, explanations, or markdown formatting like \`\`\`json or \`\`\`.
Ensure each prompt you generate is distinct. Make it around 50-100 words.`;

export const DEFAULT_ASPECT_RATIOS: string[] = ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9", "3:2"];
export const DEFAULT_QUALITIES: string[] = ["Standard", "HD", "Full HD", "4K", "Photorealistic", "Cinematic"];