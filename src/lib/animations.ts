import type { Variant, Transition, UseInViewOptions } from 'motion/react';

/**
 * Simple animation presets for landing page
 * Includes reduced motion and basic mobile optimization
 */

// Check for reduced motion preference
const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Basic mobile detection
const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

export interface AnimationPreset {
  variants: {
    hidden: Variant;
    visible: Variant;
  };
  transition: Transition;
  viewOptions: UseInViewOptions;
}

// Simple easing curves
const EASING = {
  standard: [0.25, 0.1, 0.25, 1] as const,
  bounce: [0.34, 1.56, 0.64, 1] as const,
};

// Create animation preset with accessibility and mobile support
const createPreset = (
  hidden: Variant,
  visible: Variant,
  transition: Transition,
  viewOptions: UseInViewOptions = { margin: '0px 0px -100px 0px' }
): AnimationPreset => ({
  variants: { hidden, visible },
  transition,
  viewOptions,
});

// Animation presets used on landing page
export const animations = {
  fadeInUp: createPreset(
    { opacity: 0, y: 60, filter: 'blur(4px)' },
    { opacity: 1, y: 0, filter: 'blur(0px)' },
    { duration: 0.6, ease: EASING.standard }
  ),

  hero: createPreset(
    { opacity: 0, y: 30, filter: 'blur(6px)' },
    { opacity: 1, y: 0, filter: 'blur(0px)' },
    { duration: 0.8, ease: EASING.standard },
    { margin: '0px 0px -50px 0px' }
  ),

  scaleUp: createPreset(
    { opacity: 0, scale: 0.8 },
    { opacity: 1, scale: 1 },
    { duration: 0.5, ease: EASING.bounce }
  ),

  slideInLeft: createPreset(
    { opacity: 0, x: -60 },
    { opacity: 1, x: 0 },
    { duration: 0.6, ease: EASING.standard }
  ),

  slideInRight: createPreset(
    { opacity: 0, x: 60 },
    { opacity: 1, x: 0 },
    { duration: 0.6, ease: EASING.standard }
  ),

  staggerItem: createPreset(
    { opacity: 0, y: 40, filter: 'blur(4px)' },
    { opacity: 1, y: 0, filter: 'blur(0px)' },
    { duration: 0.5, ease: EASING.standard }
  ),
} as const;

export type AnimationName = keyof typeof animations;

/**
 * Get optimized animation variants based on user preferences and device
 */
export const getOptimizedAnimation = (name: AnimationName): AnimationPreset => {
  const preset = animations[name];
  
  // Respect reduced motion preference
  if (prefersReducedMotion()) {
    return {
      ...preset,
      variants: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      },
    };
  }
  
  // Remove blur on mobile for better performance
  if (isMobile()) {
    const mobileVariants = {
      hidden: { ...preset.variants.hidden },
      visible: { ...preset.variants.visible },
    };
    
    // Remove filter property if it exists
    if ('filter' in mobileVariants.hidden) {
      delete mobileVariants.hidden.filter;
    }
    if ('filter' in mobileVariants.visible) {
      delete mobileVariants.visible.filter;
    }
    
    return {
      ...preset,
      variants: mobileVariants,
    };
  }
  
  return preset;
};

/**
 * Stagger animation configuration
 */
export const staggerConfig = {
  container: {
    variants: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
    viewOptions: { margin: '0px 0px -100px 0px' },
  },
} as const; 