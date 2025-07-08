'use client';

import React, { ReactNode, memo, useMemo } from 'react';
import type { Variant, Transition, UseInViewOptions } from 'motion/react';
import { InView } from './in-view';
import { 
  animationPresets, 
  getOptimizedVariants,
  getOptimizedTransition,
  type AnimationPresetKey 
} from '~/lib/animation-presets';

/**
 * Props for the AnimatedSection component
 */
interface AnimatedSectionProps {
  children: ReactNode;
  preset?: AnimationPresetKey;
  delay?: number;
  once?: boolean;
  className?: string;
  as?: React.ElementType;
  respectReducedMotion?: boolean;
  optimizeForMobile?: boolean;
  // Override options with proper typing
  customVariants?: {
    hidden: Variant;
    visible: Variant;
  };
  customTransition?: Transition;
  customViewOptions?: UseInViewOptions;
}

/**
 * AnimatedSection component that applies scroll-triggered animations
 * with automatic performance and accessibility optimizations
 */
export const AnimatedSection = memo<AnimatedSectionProps>(function AnimatedSection({
  children,
  preset = 'fadeInUp',
  delay = 0,
  once = true,
  className,
  as,
  respectReducedMotion = true,
  optimizeForMobile = true,
  customVariants,
  customTransition,
  customViewOptions,
}) {
  // Memoize animation configuration for performance
  const animationConfig = useMemo(() => {
    // Validate preset exists, fallback to fadeInUp if not
    const validPreset = preset in animationPresets ? preset : 'fadeInUp';
    const presetConfig = animationPresets[validPreset];

    // Get optimized variants based on device capabilities
    const variants = customVariants || getOptimizedVariants(
      validPreset, 
      respectReducedMotion, 
      optimizeForMobile
    );
    
    // Get optimized transition with delay applied
    const baseTransition = customTransition || getOptimizedTransition(validPreset);
    const transition: Transition = delay > 0 
      ? { ...baseTransition, delay }
      : baseTransition;

    // Use custom view options or preset defaults
    const viewOptions = customViewOptions || presetConfig.viewOptions;

    return { variants, transition, viewOptions };
  }, [preset, delay, customVariants, customTransition, customViewOptions, respectReducedMotion, optimizeForMobile]);

  return (
    <InView
      variants={animationConfig.variants}
      transition={animationConfig.transition}
      viewOptions={animationConfig.viewOptions}
      as={as}
      once={once}
    >
      {className ? <div className={className}>{children}</div> : children}
    </InView>
  );
});

/**
 * Hook for creating stagger animation configurations
 */
interface StaggerAnimationConfig {
  staggerDelay?: number;
  delayChildren?: number;
  respectReducedMotion?: boolean;
}

export const useStaggerAnimation = ({
  staggerDelay = 0.15,
  delayChildren = 0.1,
  respectReducedMotion = true,
}: StaggerAnimationConfig = {}) => {
  return useMemo(() => {
    // Get optimized variants for stagger items
    const childVariants = getOptimizedVariants('staggerItem', respectReducedMotion, true);
    
    // Create parent variants for stagger container
    const parentVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    };

    const parentTransition: Transition = {
      staggerChildren: staggerDelay,
      delayChildren,
      ease: [0.25, 0.1, 0.25, 1] as const,
    };

    return { parentVariants, parentTransition, childVariants };
  }, [staggerDelay, delayChildren, respectReducedMotion]);
};

/**
 * Props for AnimatedGrid component
 */
interface AnimatedGridProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  once?: boolean;
  respectReducedMotion?: boolean;
}

/**
 * AnimatedGrid component for staggered grid animations
 */
export const AnimatedGrid = memo<AnimatedGridProps>(function AnimatedGrid({
  children,
  className,
  staggerDelay = 0.15,
  once = true,
  respectReducedMotion = true,
}) {
  const { parentVariants, parentTransition } = useStaggerAnimation({ 
    staggerDelay, 
    respectReducedMotion 
  });

  return (
    <InView
      variants={parentVariants}
      transition={parentTransition}
      viewOptions={animationPresets.staggerChildren.viewOptions}
      once={once}
    >
      <div className={className}>
        {children}
      </div>
    </InView>
  );
});

/**
 * Props for AnimatedGridItem component
 */
interface AnimatedGridItemProps {
  children: ReactNode;
  className?: string;
  respectReducedMotion?: boolean;
}

/**
 * AnimatedGridItem component for individual grid items in staggered animations
 */
export const AnimatedGridItem = memo<AnimatedGridItemProps>(function AnimatedGridItem({
  children,
  className,
  respectReducedMotion = true,
}) {
  const variants = useMemo(() => 
    getOptimizedVariants('staggerItem', respectReducedMotion, true),
    [respectReducedMotion]
  );

  return (
    <InView variants={variants} transition={{ duration: 0.5, ease: 'easeOut' }}>
      <div className={className}>
        {children}
      </div>
    </InView>
  );
}); 