
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GeneratedInfinityItem, ExportedInfinityItem } from '../types';
import { generatePromptVariation, generateImage } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { InfinityIcon as InfinitySymbolIcon, SparklesIcon, StopIcon, DownloadIcon, PhotoIcon } from './Icon';

const infinityScrollbarStyles = `
  .no-scrollbar-content::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }
  .no-scrollbar-content {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;

const MAX_PREVIOUS_PROMPTS_TO_CONSIDER = 20; // Max prompts to send to Gemini for context
const LOCAL_PROMPT_HISTORY_SIZE = 40; // Max prompts to keep in local state (slightly more than sent)


const InfinityImageGeneratorTab: React.FC = () => {
  const [basePrompt, setBasePrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedItems, setGeneratedItems] = useState<GeneratedInfinityItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [totalGeneratedCount, setTotalGeneratedCount] = useState<number>(0);
  const [imagesPerSecond, setImagesPerSecond] = useState<number>(0);
  const [previousVariationPrompts, setPreviousVariationPrompts] = useState<string[]>([]); // Stores recent variation prompts

  const generationStartTimeRef = useRef<number | null>(null);
  const isGeneratingRef = useRef<boolean>(false); 
  const ipsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;
    const styleId = 'infinity-noscrollbar-styles';
    if (!document.getElementById(styleId) && typeof window !== 'undefined') {
      const styleSheet = document.createElement("style");
      styleSheet.id = styleId;
      styleSheet.type = "text/css";
      styleSheet.innerText = infinityScrollbarStyles;
      document.head.appendChild(styleSheet);
    }

    return () => {
      mountedRef.current = false;
      if (ipsIntervalRef.current) clearInterval(ipsIntervalRef.current);
      isGeneratingRef.current = false; 
    };
  }, []);

  const updateIPS = useCallback(() => {
    if (generationStartTimeRef.current && totalGeneratedCount > 0) {
      const elapsedSeconds = (Date.now() - generationStartTimeRef.current) / 1000;
      if (elapsedSeconds > 0) {
        setImagesPerSecond(parseFloat((totalGeneratedCount / elapsedSeconds).toFixed(2)));
      }
    }
  }, [totalGeneratedCount]);

  useEffect(() => {
    if (isGenerating) {
      if (!ipsIntervalRef.current) {
        ipsIntervalRef.current = setInterval(updateIPS, 1000); 
      }
    } else {
      if (ipsIntervalRef.current) {
        clearInterval(ipsIntervalRef.current);
        ipsIntervalRef.current = null;
      }
       if (totalGeneratedCount > 0 && generationStartTimeRef.current) updateIPS(); 
    }
  }, [isGenerating, updateIPS, totalGeneratedCount]);

  const generationLoop = async () => {
    if (!process.env.API_KEY) {
      if (mountedRef.current) setError("API Key is not configured. Please set process.env.API_KEY.");
      if (mountedRef.current) setIsGenerating(false);
      isGeneratingRef.current = false;
      return;
    }

    let localErrorCount = 0;
    const MAX_CONSECUTIVE_ERRORS = 5;
    
    // Use a local copy of previous prompts for the current loop session to ensure consistency within the loop
    let currentLoopPreviousPrompts = [...previousVariationPrompts];


    while (isGeneratingRef.current) {
      try {
        if (!mountedRef.current) break;

        const contextPrompts = currentLoopPreviousPrompts.slice(-MAX_PREVIOUS_PROMPTS_TO_CONSIDER);
        const variationPrompt = await generatePromptVariation(basePrompt, contextPrompts);
        
        if (!isGeneratingRef.current || !mountedRef.current) break;

        const imageUrl = await generateImage(variationPrompt);
        if (!isGeneratingRef.current || !mountedRef.current) break;

        const newItem: GeneratedInfinityItem = {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          basePrompt,
          variationPrompt,
          imageUrl,
          timestamp: Date.now(),
        };
        
        if (mountedRef.current) {
            setGeneratedItems(prevItems => [newItem, ...prevItems].slice(0, 100)); 
            setTotalGeneratedCount(prevCount => prevCount + 1);
            
            // Update the shared state for previous prompts, accessible by subsequent loop iterations if this one finishes
            // and for the next full "Start Generation" cycle.
            setPreviousVariationPrompts(prev => [...prev, variationPrompt].slice(-LOCAL_PROMPT_HISTORY_SIZE));
            // Also update the local copy for the current active loop
            currentLoopPreviousPrompts = [...currentLoopPreviousPrompts, variationPrompt].slice(-LOCAL_PROMPT_HISTORY_SIZE);

        }
        localErrorCount = 0; 
      } catch (err) {
        localErrorCount++;
        console.error("Error in generation loop:", err);
        if (mountedRef.current) setError(err instanceof Error ? err.message : 'An error occurred during generation.');
        if (localErrorCount >= MAX_CONSECUTIVE_ERRORS) {
            if (mountedRef.current) setError(`Too many consecutive errors (${MAX_CONSECUTIVE_ERRORS}). Stopping generation.`);
            isGeneratingRef.current = false;
            if (mountedRef.current) setIsGenerating(false);
            break;
        }
        if (isGeneratingRef.current) await new Promise(resolve => setTimeout(resolve, 1000));
      }
      if (!mountedRef.current) break;
    }
    if (mountedRef.current) setIsGenerating(false); 
  };

  const handleStartGeneration = () => {
    if (!basePrompt.trim()) {
      setError("Please enter a base prompt to start generation.");
      return;
    }
    setError(null);
    setGeneratedItems([]); 
    setTotalGeneratedCount(0);
    setImagesPerSecond(0);
    setPreviousVariationPrompts([]); // Reset history for a new base prompt session
    generationStartTimeRef.current = Date.now();
    isGeneratingRef.current = true;
    setIsGenerating(true);
    generationLoop();
  };

  const handleStopGeneration = () => {
    isGeneratingRef.current = false;
    setIsGenerating(false); 
  };

  const handleExportJson = () => {
    handleStopGeneration();
    if (generatedItems.length === 0) {
      alert("No images were generated to export.");
      return;
    }

    const dataToExport: ExportedInfinityItem[] = generatedItems.map(item => ({
      prompt: item.variationPrompt,
      link: item.imageUrl,
    })).reverse(); 

    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `infinity_images_export_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 min-h-full bg-slate-800/80 text-slate-100 flex flex-col">
      <div className="max-w-5xl mx-auto w-full">
        <header className="mb-6 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start mb-1">
            <InfinitySymbolIcon className="w-8 h-8 mr-2 text-sky-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500 tracking-tight">
              Infinity Mode
            </h1>
          </div>
          <p className="text-slate-300 text-sm sm:text-base">
            Enter a base idea, and watch AI generate endless variations.
          </p>
        </header>

        <div className="p-5 sm:p-6 bg-slate-900/60 backdrop-blur-lg rounded-xl shadow-2xl border border-slate-700/40 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <input
              type="text"
              value={basePrompt}
              onChange={(e) => setBasePrompt(e.target.value)}
              placeholder="e.g., A futuristic warrior, mystical forest, cute alien pet"
              className="flex-grow p-3 bg-slate-800/70 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all duration-150 shadow-inner disabled:opacity-50"
              disabled={isGenerating}
            />
            {!isGenerating ? (
              <button
                onClick={handleStartGeneration}
                disabled={!basePrompt.trim()}
                className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 transition-all duration-200 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <SparklesIcon className="w-5 h-5 mr-2" />
                Start Generation
              </button>
            ) : (
              <button
                onClick={handleStopGeneration}
                className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-75 transition-all duration-200 ease-in-out"
              >
                <StopIcon className="w-5 h-5 mr-2" />
                Stop
              </button>
            )}
          </div>
          {isGenerating && basePrompt && (
            <p className="text-xs text-slate-400 mt-3">Generating variations for: <span className="font-medium text-sky-300">"{basePrompt}"</span></p>
          )}
        </div>

        {(isGenerating || totalGeneratedCount > 0) && (
          <div className="mb-6 p-4 bg-slate-900/50 backdrop-blur-md rounded-lg border border-slate-700/30 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm text-slate-300">Images Generated: <span className="font-bold text-sky-400 text-lg">{totalGeneratedCount}</span></p>
              <p className="text-sm text-slate-300">Speed: <span className="font-bold text-sky-400 text-lg">{imagesPerSecond.toFixed(2)} IPS</span></p>
            </div>
            <button
              onClick={handleExportJson}
              disabled={generatedItems.length === 0 && !isGenerating}
              className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <DownloadIcon className="w-5 h-5 mr-2" />
              Export JSON
            </button>
          </div>
        )}
      </div>

      {error && !isGenerating && (
        <div className="my-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm max-w-5xl mx-auto w-full">
          <p className="font-semibold text-red-100">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {isGenerating && totalGeneratedCount === 0 && !error && (
         <div className="flex-grow flex items-center justify-center">
            <LoadingSpinner message="Igniting the creative engine..." />
         </div>
      )}

      {totalGeneratedCount === 0 && !isGenerating && !error && (
        <div className="flex-grow flex flex-col items-center justify-center text-slate-400 p-6 max-w-5xl mx-auto w-full">
            <PhotoIcon className="w-20 h-20 opacity-30 mb-4" />
            <p className="text-lg">Generated images will appear here in an endless stream.</p>
            <p className="text-sm text-slate-500">Enter your base prompt above and click "Start Generation".</p>
        </div>
      )}

      {generatedItems.length > 0 && (
        <div className="flex-grow overflow-y-auto pb-8 pt-2 no-scrollbar-content">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-7xl mx-auto px-2">
            {generatedItems.map((item) => (
              <div key={item.id} className="group relative aspect-square bg-slate-900/70 rounded-lg overflow-hidden shadow-lg border border-slate-700/50 transition-all duration-300 hover:shadow-sky-500/30 hover:shadow-2xl hover:border-sky-500/70">
                <img 
                    src={item.imageUrl} 
                    alt={item.variationPrompt.substring(0,100)} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex flex-col justify-end">
                  <p className="text-xs text-slate-200 line-clamp-3 leading-tight">{item.variationPrompt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InfinityImageGeneratorTab;