import React, { useState, useRef, useEffect, useCallback } from 'react';
import { InputStep } from '../types';
import { DEFAULT_ASPECT_RATIOS, DEFAULT_QUALITIES } from '../constants';
import { ChevronDownIcon, SparklesIcon } from './Icon';

interface PromptInputProps {
  onSubmit: (prompt: string, aspectRatio: string, quality: string) => void;
  isLoading: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, isLoading }) => {
  const [currentInputStep, setCurrentInputStep] = useState<InputStep>(InputStep.PROMPT);
  const [userPrompt, setUserPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState(DEFAULT_ASPECT_RATIOS[0]);
  const [quality, setQuality] = useState(DEFAULT_QUALITIES[0]);
  
  const [tempPromptValue, setTempPromptValue] = useState('');

  const [isRatioDropdownOpen, setIsRatioDropdownOpen] = useState(false);
  const [isQualityDropdownOpen, setIsQualityDropdownOpen] = useState(false);

  const promptInputRef = useRef<HTMLInputElement>(null);
  const ratioDropdownRef = useRef<HTMLDivElement>(null);
  const qualityDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentInputStep === InputStep.PROMPT && promptInputRef.current) {
      promptInputRef.current.focus();
    }
  }, [currentInputStep]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (ratioDropdownRef.current && !ratioDropdownRef.current.contains(event.target as Node)) {
      setIsRatioDropdownOpen(false);
    }
    if (qualityDropdownRef.current && !qualityDropdownRef.current.contains(event.target as Node)) {
      setIsQualityDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const handlePromptInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempPromptValue(e.target.value);
  };

  const handlePromptKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault();
      if (tempPromptValue.trim() !== '') {
        setUserPrompt(tempPromptValue.trim());
        setCurrentInputStep(InputStep.RATIO); // Move to next step (showing dropdowns)
      }
    }
  };
  
  const handleFinalSubmit = () => {
     if (userPrompt && aspectRatio && quality && !isLoading) {
      onSubmit(userPrompt, aspectRatio, quality);
    }
  };

  const renderPromptField = () => (
    <div className="mb-6">
      <label htmlFor="prompt" className="block text-sm font-medium text-sky-300 mb-1.5">
        1. Describe Your Vision
      </label>
      <input
        id="prompt"
        ref={promptInputRef}
        type="text"
        value={tempPromptValue}
        onChange={handlePromptInputChange}
        onKeyDown={handlePromptKeyDown}
        placeholder="e.g., A majestic dragon flying over a cyberpunk city at night"
        className="w-full p-3 bg-slate-800/70 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all duration-150 shadow-inner"
        disabled={isLoading || currentInputStep !== InputStep.PROMPT}
      />
      {currentInputStep === InputStep.PROMPT && tempPromptValue.trim() === '' && (
         <p className="text-xs text-slate-400 mt-2">Press Enter after typing your prompt to proceed.</p>
      )}
    </div>
  );

  const renderDropdownSelector = <T extends string,>(
    id: string,
    label: string,
    options: T[],
    selectedValue: T,
    setSelectedValue: (value: T) => void,
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void,
    dropdownRef: React.RefObject<HTMLDivElement>,
    disabled: boolean
  ) => (
    <div className="relative w-full sm:flex-1" ref={dropdownRef}>
      <label htmlFor={id} className="block text-sm font-medium text-sky-300 mb-1.5">
        {label}
      </label>
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-slate-800/70 border border-slate-700 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all duration-150 shadow-inner disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={disabled || isLoading}
      >
        <span>{selectedValue}</span>
        <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-slate-800 border border-slate-600 rounded-md shadow-2xl max-h-52 overflow-auto py-1">
          {options.map((option) => (
            <div
              key={option}
              onClick={() => {
                setSelectedValue(option);
                setIsOpen(false);
              }}
              className="px-3 py-2 text-sm text-slate-200 hover:bg-sky-600/80 cursor-pointer"
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-3">
      {renderPromptField()}
      
      {(currentInputStep === InputStep.RATIO || currentInputStep === InputStep.QUALITY || userPrompt !== '') && (
        <div className={`transition-opacity duration-700 ease-in-out ${userPrompt ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden pointer-events-none'}`}>
          {userPrompt && (
            <div className="mb-4 p-3 bg-slate-800/50 border border-slate-700 rounded-md">
              <p className="text-xs text-slate-400">Your prompt:</p>
              <p className="font-medium text-sky-200">{userPrompt}</p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 items-start">
            {renderDropdownSelector("aspectRatio", "2. Select Aspect Ratio", DEFAULT_ASPECT_RATIOS, aspectRatio, setAspectRatio, isRatioDropdownOpen, setIsRatioDropdownOpen, ratioDropdownRef, currentInputStep === InputStep.PROMPT)}
            {renderDropdownSelector("quality", "3. Select Quality", DEFAULT_QUALITIES, quality, setQuality, isQualityDropdownOpen, setIsQualityDropdownOpen, qualityDropdownRef, currentInputStep === InputStep.PROMPT)}
          </div>
        </div>
      )}

      {(userPrompt !== '' && aspectRatio && quality) && (
        <button
          onClick={handleFinalSubmit}
          disabled={isLoading || !userPrompt || !aspectRatio || !quality}
          className="mt-6 w-full flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 transition-all duration-200 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <SparklesIcon className="w-5 h-5 mr-2.5" />
          {isLoading ? 'Conjuring Magic...' : 'Generate Image'}
        </button>
      )}
    </div>
  );
};

export default PromptInput;
