'use client';

import React, { ReactNode, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { getOptimizedAnimation, staggerConfig } from '~/lib/animations';

interface StaggerGridProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  once?: boolean;
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

/**
 * Container for staggered grid animations
 */
export function StaggerGrid({
  children,
  className,
  staggerDelay = 0.15,
  once = true,
}: StaggerGridProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, staggerConfig.container.viewOptions);
  const [hasAnimated, setHasAnimated] = useState(false);

  const shouldAnimate = isInView || (once && hasAnimated);

  // Create custom transition with the specified stagger delay
  const transition = {
    ...staggerConfig.container.transition,
    staggerChildren: staggerDelay,
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={shouldAnimate ? "visible" : "hidden"}
      variants={staggerConfig.container.variants}
      transition={transition}
      onAnimationComplete={() => {
        if (once && isInView) {
          setHasAnimated(true);
        }
      }}
    >
      <div className={className}>
        {children}
      </div>
    </motion.div>
  );
}

/**
 * Individual item in a staggered grid
 */
export function StaggerItem({
  children,
  className,
}: StaggerItemProps) {
  const { variants, transition } = getOptimizedAnimation('staggerItem');

  return (
    <motion.div
      variants={variants}
      transition={transition}
    >
      <div className={className}>
        {children}
      </div>
    </motion.div>
  );
} 