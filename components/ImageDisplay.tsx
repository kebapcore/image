import React from 'react';
import { PhotoIcon } from './Icon';

interface ImageDisplayProps {
  imageUrl: string | null;
  enhancedPrompt: string | null;
  isLoading: boolean; // Parent still controls overall loading state for other UI elements
  error: string | null;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrl, enhancedPrompt, isLoading, error }) => {
  // isLoading prop might be used here if this component had its own internal loading states,
  // but for now, it primarily reacts to imageUrl and error.
  // The global loading spinner is handled by the parent (ImageGeneratorTab).

  if (error && !isLoading) { // Show error only if not actively loading a new image
    return (
      <div className="mt-8 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200 animate-fadeIn">
        <p className="font-semibold text-red-100">Generation Error:</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!imageUrl && !isLoading && !error) { // Initial state or after a successful clear
    return (
        <div className="mt-8 flex flex-col items-center justify-center text-slate-400 h-72 
                        bg-slate-900/30 backdrop-blur-sm border border-dashed border-slate-700 rounded-xl p-6 animate-fadeIn">
            <PhotoIcon className="w-16 h-16 opacity-40 mb-4" />
            <p className="text-slate-400">Your beautifully generated image will appear here.</p>
            <p className="text-xs text-slate-500 mt-1">Describe your vision above to get started.</p>
        </div>
    );
  }

  if (imageUrl) {
    return (
      <div className="mt-8 p-4 sm:p-6 bg-slate-900/40 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/50 animate-fadeInUp">
        <h3 className="text-xl font-semibold text-sky-300 mb-4">Your Masterpiece</h3>
        <div className="aspect-[16/9] w-full max-w-3xl mx-auto rounded-lg overflow-hidden shadow-lg border border-slate-700">
             <img 
                src={imageUrl} 
                alt={enhancedPrompt || "AI Generated Image"} 
                className="w-full h-full object-contain bg-slate-950" // object-contain to see full image
             />
        </div>
       
        {enhancedPrompt && (
          <div className="mt-5 p-3.5 bg-slate-800/60 rounded-lg border border-slate-700">
            <p className="text-xs text-sky-400 mb-1 font-medium">Enhanced Prompt Used:</p>
            <p className="text-sm text-slate-200 leading-relaxed">{enhancedPrompt}</p>
          </div>
        )}
      </div>
    );
  }

  return null; // If loading, or other unhandled states, parent spinner takes precedence.
};

// Simple animation classes (can be added to tailwind.config.js if using JIT, or style tag for demo)
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
  .animate-fadeInUp { animation: fadeInUp 0.5s ease-out forwards; }
`;

// Inject animation styles dynamically (for this single-file setup)
if (typeof window !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = animationStyles;
    document.head.appendChild(styleSheet);
}


export default ImageDisplay;
