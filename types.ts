import React from 'react';

export interface Theme {
  id: string;
  name: string;
  fontFamily: string;
  bgGradient: string;
  textColor: string;
  accentColor: string;
  headingColor: string;
  codeBg: string;
  css?: React.CSSProperties; // Custom overrides
}

export interface PresentationState {
  markdown: string;
  currentSlideIndex: number;
  selectedThemeId: string;
}

export type SlideLayout = 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface SlideData {
  id: string;
  content: string; // Display content (without layout metadata)
  raw: string; // Raw chunk content
  layout: SlideLayout;
}

export interface Coordinates {
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
}

export type CameraShape = 'circle' | 'square' | 'rounded' | 'portrait' | 'landscape';

export interface Project {
  id: string;
  name: string;
  markdown: string;
  themeId: string;
  lastModified: number;
}