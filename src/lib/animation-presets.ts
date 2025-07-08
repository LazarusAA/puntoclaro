import type { Variant, Transition, UseInViewOptions } from 'motion/react';
import { isLowEndDevice, isMobileDevice, prefersReducedMotion } from './device-utils';

/**
 * Extended variant type that includes filter for blur effects
 */
type ExtendedVariant = Partial<Variant & { filter?: string }>;

/**
 * Animation preset configuration interface
 */
export interface AnimationPreset {
  readonly variants: {
    readonly hidden: Variant;
    readonly visible: Variant;
  };
  readonly transition?: Transition;
  readonly viewOptions?: UseInViewOptions;
}



/**
 * Base GPU acceleration properties for performance
 */
const GPU_ACCELERATION = { transform: 'translateZ(0)' } as const;

/**
 * Common CSS will-change values for optimization
 */
const WILL_CHANGE = {
  transform: 'opacity, transform',
  transformFilter: 'opacity, transform, filter',
  auto: 'auto',
} as const;

/**
 * Standard easing curves following Material Design guidelines
 */
const EASING = {
  standard: [0.25, 0.1, 0.25, 1] as const,
  decelerate: [0, 0, 0.2, 1] as const,
  accelerate: [0.4, 0, 1, 1] as const,
  sharp: [0.4, 0, 0.6, 1] as const,
  bounce: [0.34, 1.56, 0.64, 1] as const,
} as const;

/**
 * Creates optimized variant with proper typing
 */
const createVariant = (
  baseVariant: ExtendedVariant,
  includeFilter = false,
  willChange: string = WILL_CHANGE.transform
): Variant => ({
  ...baseVariant,
  willChange,
  ...GPU_ACCELERATION,
  ...(includeFilter && baseVariant.filter && { filter: baseVariant.filter }),
});

/**
 * Factory function for creating animation presets with consistent structure
 */
const createPreset = (
  hiddenVariant: ExtendedVariant,
  visibleVariant: ExtendedVariant,
  transition: Transition = { duration: 0.5, ease: EASING.standard },
  viewOptions: UseInViewOptions = { margin: '0px 0px -100px 0px' },
  includeFilter = false
): AnimationPreset => ({
  variants: {
    hidden: createVariant(
      hiddenVariant,
      includeFilter,
      includeFilter ? WILL_CHANGE.transformFilter : WILL_CHANGE.transform
    ),
    visible: createVariant(
      { ...visibleVariant, willChange: WILL_CHANGE.auto },
      includeFilter,
      WILL_CHANGE.auto
    ),
  },
  transition,
  viewOptions,
});

/**
 * Core animation presets following design system standards
 */
export const animationPresets = {
  // Most common pattern - fade in from bottom with optional blur
  fadeInUp: createPreset(
    { opacity: 0, y: 60, filter: 'blur(4px)' },
    { opacity: 1, y: 0, filter: 'blur(0px)' },
    { duration: 0.6, ease: EASING.standard },
    { margin: '0px 0px -100px 0px' },
    true // include filter
  ),

  // Lightweight version without blur - better for mobile
  fadeInUpSimple: createPreset(
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0 },
    { duration: 0.5, ease: EASING.standard }
  ),

  // Scale animation with subtle bounce for engagement
  scaleUp: createPreset(
    { opacity: 0, scale: 0.8 },
    { opacity: 1, scale: 1 },
    { duration: 0.5, ease: EASING.bounce }
  ),

  // Horizontal slide animations
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

  // Special hero animation with longer duration and blur
  hero: createPreset(
    { opacity: 0, y: 30, filter: 'blur(6px)' },
    { opacity: 1, y: 0, filter: 'blur(0px)' },
    { duration: 0.8, ease: EASING.standard },
    { margin: '0px 0px -50px 0px' },
    true // include filter
  ),

  // Stagger container (no transform, just opacity for parent)
  staggerChildren: createPreset(
    { opacity: 0 },
    { opacity: 1 },
    { duration: 0.3, staggerChildren: 0.15, delayChildren: 0.1 }
  ),

  // Individual stagger items
  staggerItem: createPreset(
    { opacity: 0, y: 40, filter: 'blur(4px)' },
    { opacity: 1, y: 0, filter: 'blur(0px)' },
    { duration: 0.5, ease: EASING.standard },
    undefined, // inherit from parent
    true // include filter
  ),
} as const satisfies Record<string, AnimationPreset>;

export type AnimationPresetKey = keyof typeof animationPresets;

/**
 * Optimizes variants based on device capabilities and user preferences
 */
export const getOptimizedVariants = (
  preset: AnimationPresetKey,
  respectReducedMotion = true,
  optimizeForMobile = true
): AnimationPreset['variants'] => {
  const baseVariants = animationPresets[preset].variants;

  // Respect user's motion preferences first
  if (respectReducedMotion && prefersReducedMotion()) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    };
  }

  // Apply mobile optimizations if needed
  if (optimizeForMobile && (isMobileDevice() || isLowEndDevice())) {
    return optimizeVariantsForMobile(baseVariants);
  }

  return baseVariants;
};

/**
 * Optimizes transitions based on device performance
 */
export const getOptimizedTransition = (
  preset: AnimationPresetKey,
  customTransition?: Transition
): Transition => {
  const baseTransition = customTransition || animationPresets[preset].transition || {};
  
  // Reduce duration for low-end devices
  if (isLowEndDevice()) {
    const duration = typeof baseTransition.duration === 'number' 
      ? baseTransition.duration * 0.7 
      : 0.35;
    
    return {
      ...baseTransition,
      duration,
      ease: 'easeOut', // Simpler easing for performance
    };
  }

  return baseTransition;
};

/**
 * Removes expensive effects for mobile devices
 */
function optimizeVariantsForMobile(variants: AnimationPreset['variants']): AnimationPreset['variants'] {
  const optimized = { ...variants };

  // Remove blur filters on mobile for better performance
  (['hidden', 'visible'] as const).forEach(state => {
    const variant = optimized[state];
    if (variant && typeof variant === 'object' && 'filter' in variant) {
      // Create a new variant without the filter property
      const variantWithoutFilter = Object.fromEntries(
        Object.entries(variant).filter(([key]) => key !== 'filter')
      ) as Variant;
      optimized[state] = variantWithoutFilter;
    }
  });

  return optimized;
}

// Backward compatibility
export const getAccessibleVariants = getOptimizedVariants; 