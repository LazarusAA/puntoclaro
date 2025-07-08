'use client';

import type { Transition } from 'motion/react';
import { isMobileDevice } from './device-utils';

/**
 * Animation configurations for different interaction types
 * Optimized for performance and mobile devices
 */

// Standard easing curves
const EASING = {
  smooth: 'easeOut',
  spring: [0.34, 1.56, 0.64, 1],
  standard: [0.25, 0.1, 0.25, 1],
} as const;

/**
 * Hover animations (disabled on mobile for performance)
 */
export const hoverAnimations = {
  scale: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { duration: 0.2, ease: EASING.smooth },
  },
  
  lift: {
    whileHover: { y: -4, boxShadow: '0 8px 25px rgba(0,0,0,0.15)' },
    transition: { duration: 0.3, ease: EASING.smooth },
  },
  
  glow: {
    whileHover: { boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' },
    transition: { duration: 0.3, ease: EASING.smooth },
  },
} as const;

/**
 * Loading and state animations
 */
export const stateAnimations = {
  spin: {
    animate: { rotate: 360 },
    transition: { duration: 1, repeat: Infinity, ease: 'linear' },
  },
  
  pulse: {
    animate: { scale: [1, 1.1, 1], opacity: [1, 0.7, 1] },
    transition: { duration: 1.5, repeat: Infinity, ease: EASING.smooth },
  },
  
  bounce: {
    animate: { scale: [1, 1.1, 1] },
    transition: { duration: 0.3, ease: EASING.spring },
  },
} as const;

/**
 * Page and modal transition animations
 */
export const transitionAnimations = {
  // Page transitions
  fadeSlide: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3, ease: EASING.smooth },
  },
  
  // Modal animations
  modal: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.3, ease: EASING.smooth },
  },
  
  // Toast notifications
  toast: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
    transition: { duration: 0.3, ease: EASING.smooth },
  },
} as const;

/**
 * Form interaction animations
 */
export const formAnimations = {
  errorShake: {
    animate: { x: [0, -10, 10, -10, 10, 0] },
    transition: { duration: 0.5, ease: EASING.smooth },
  },
  
  success: {
    animate: { scale: [1, 1.05, 1] },
    transition: { duration: 0.3, ease: EASING.smooth },
  },
} as const;

/**
 * Utility to disable hover animations on mobile devices
 */
export const mobileOptimizedHover = <T extends Record<string, any>>(
  hoverProps: T
): Partial<T> => {
  return isMobileDevice() ? {} : hoverProps;
};

/**
 * Helper functions to get animation props for common use cases
 */
export const getButtonAnimationProps = () => ({
  ...mobileOptimizedHover(hoverAnimations.scale),
});

export const getCardAnimationProps = () => ({
  ...mobileOptimizedHover(hoverAnimations.lift),
});

export const getLoadingSpinnerProps = () => ({
  ...stateAnimations.spin,
});

/**
 * Creates a custom transition with mobile optimization
 * Note: ease parameter uses any type due to Framer Motion's complex easing type system
 */
export const createOptimizedTransition = (
  baseDuration: number,
  ease: any = EASING.smooth
): Transition => {
  const duration = isMobileDevice() ? baseDuration * 0.8 : baseDuration;
  return { duration, ease };
}; 