'use client';

import React, { ReactNode, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { getOptimizedAnimation, type AnimationName } from '~/lib/animations';

interface AnimateOnScrollProps {
  children: ReactNode;
  animation?: AnimationName;
  delay?: number;
  once?: boolean;
  className?: string;
  as?: React.ElementType;
}

/**
 * Simple scroll-triggered animation component
 * Automatically handles reduced motion and mobile optimization
 */
export function AnimateOnScroll({
  children,
  animation = 'fadeInUp',
  delay = 0,
  once = true,
  className,
  as = 'div',
}: AnimateOnScrollProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, getOptimizedAnimation(animation).viewOptions);
  const [hasAnimated, setHasAnimated] = useState(false);

  const { variants, transition } = getOptimizedAnimation(animation);
  
  // Apply delay to transition
  const finalTransition = delay > 0 
    ? { ...transition, delay }
    : transition;

  // Determine if should show animation
  const shouldAnimate = isInView || (once && hasAnimated);

  const MotionComponent = motion[as as keyof typeof motion] as typeof motion.div;

  return (
    <MotionComponent
      ref={ref}
      initial="hidden"
      animate={shouldAnimate ? "visible" : "hidden"}
      variants={variants}
      transition={finalTransition}
      onAnimationComplete={() => {
        if (once && isInView) {
          setHasAnimated(true);
        }
      }}
    >
      {className ? <div className={className}>{children}</div> : children}
    </MotionComponent>
  );
} 