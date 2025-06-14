import React from 'react';

export enum InputStep {
  PROMPT = 'prompt',
  RATIO = 'ratio',
  QUALITY = 'quality',
}

export interface Tab {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  content?: React.FC; // Optional dedicated content component for the tab
  type?: 'imageGenerator' | 'infinityGenerator' | 'placeholder'; // To distinguish tab types
}

// Minimal types for grounding
export interface GroundingChunkWeb {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web?: GroundingChunkWeb;
}

export interface GroundingMetadata {
  groundingMetadata?: GroundingChunk[];
}

// Types for Infinity Mode
export interface GeneratedInfinityItem {
  id: string;
  basePrompt: string;
  variationPrompt: string;
  imageUrl: string;
  timestamp: number;
}

export interface ExportedInfinityItem {
  prompt: string;
  link: string;
}
