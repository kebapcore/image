import React, { useState, useCallback } from 'react';
import PromptInput from './PromptInput';
import ImageDisplay from './ImageDisplay';
import LoadingSpinner from './LoadingSpinner';
import { enhancePrompt, generateImage } from '../services/geminiService';

const ImageGeneratorTab: React.FC = () => {
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmitPrompt = useCallback(async (prompt: string, aspectRatio: string, quality: string) => {
    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl(null); // Clear previous image
    setEnhancedPrompt(null);    // Clear previous enhanced prompt

    if (!process.env.API_KEY) {
      setError("API Key is not configured. Please set process.env.API_KEY.");
      setIsLoading(false);
      return;
    }

    try {
      setLoadingMessage('Enhancing your prompt with AI creativity...');
      const newEnhancedPrompt = await enhancePrompt(prompt, aspectRatio, quality);
      // Check if enhancement itself returned an error message (as a string)
      if (newEnhancedPrompt.toLowerCase().startsWith('error enhancing prompt:') || newEnhancedPrompt.toLowerCase().startsWith('an unknown error occurred while enhancing prompt.')) {
        throw new Error(newEnhancedPrompt);
      }
      setEnhancedPrompt(newEnhancedPrompt);
      
      setLoadingMessage('Generating your masterpiece with Imagen...');
      const imageUrl = await generateImage(newEnhancedPrompt);
      setGeneratedImageUrl(imageUrl);

    } catch (err) {
      console.error("Error in generation process:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during image generation.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, []);

  return (
    <div className="p-4 sm:p-6 md:p-8 min-h-full bg-slate-800/80 text-slate-100">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500 tracking-tight">
            Aero Image Studio
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base">
            Craft stunning visuals with AI. Describe your vision, choose parameters, and let us bring it to life.
          </p>
        </header>

        <div className="p-5 sm:p-6 bg-slate-900/60 backdrop-blur-lg rounded-xl shadow-2xl border border-slate-700/40">
          <PromptInput onSubmit={handleSubmitPrompt} isLoading={isLoading} />
        </div>
        
        {isLoading && (
            <div className="mt-8">
                <LoadingSpinner message={loadingMessage} />
            </div>
        )}
        
        {/* ImageDisplay will show error or image or placeholder */}
        <ImageDisplay 
          imageUrl={generatedImageUrl} 
          enhancedPrompt={enhancedPrompt}
          isLoading={isLoading} 
          error={error}
        />
      </div>
    </div>
  );
};

export default ImageGeneratorTab;
