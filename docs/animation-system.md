# Animation System Documentation

A production-ready animation system built with performance, accessibility, and maintainability in mind.

## 🎯 System Overview

This animation system provides three core capabilities:
1. **Scroll-triggered animations** for section reveals
2. **Interactive animations** for hover, click, and state changes  
3. **Page transitions** for navigation and modals

## 📁 File Structure

```
src/lib/
├── device-utils.ts          # Device detection & caching
├── animation-presets.ts     # Scroll animation presets
└── animation-utilities.ts   # Interactive animations

src/components/shared/
├── in-view.tsx             # Base InView component
└── animated-section.tsx    # Section animation components
```

## 🚀 Quick Start

### Basic Section Animation
```tsx
import { AnimatedSection } from '~/components/shared/animated-section';

<AnimatedSection preset="fadeInUp" delay={0.2}>
  <h2>Your content</h2>
</AnimatedSection>
```

### Grid with Staggered Animation
```tsx
import { AnimatedGrid, AnimatedGridItem } from '~/components/shared/animated-section';

<AnimatedGrid staggerDelay={0.1}>
  {items.map((item, index) => (
    <AnimatedGridItem key={index}>
      <Card {...item} />
    </AnimatedGridItem>
  ))}
</AnimatedGrid>
```

### Interactive Button
```tsx
import { motion } from 'motion/react';
import { getButtonAnimationProps } from '~/lib/animation-utilities';

<motion.button {...getButtonAnimationProps()}>
  Click me
</motion.button>
```

## 📋 Animation Presets

### Scroll Animations
| Preset | Use Case | Performance |
|--------|----------|-------------|
| `fadeInUp` | General content sections | Medium (includes blur) |
| `fadeInUpSimple` | Mobile-optimized content | High (no blur) |
| `scaleUp` | Call-to-action buttons | High |
| `slideInLeft/Right` | Side-by-side layouts | High |
| `hero` | Main hero sections | Medium (includes blur) |

### Interactive Animations
| Animation | Trigger | Mobile Behavior |
|-----------|---------|-----------------|
| `hoverAnimations.scale` | Hover/tap | Disabled on mobile |
| `hoverAnimations.lift` | Hover | Disabled on mobile |
| `stateAnimations.spin` | Loading states | Always active |
| `stateAnimations.pulse` | Loading states | Always active |

## ⚡ Performance Features

### Automatic Optimizations
- **Device Detection**: Caches results for performance
- **Mobile Optimization**: Removes expensive effects (blur, 3D transforms)
- **Low-end Device Support**: Reduces animation duration by 30%
- **GPU Acceleration**: All animations use `translateZ(0)`

### Accessibility
- **Reduced Motion**: Automatically detects `prefers-reduced-motion`
- **Fallback Animations**: Opacity-only for sensitive users
- **No Motion Sickness**: Avoids rapid or jarring movements

## 🔧 Advanced Usage

### Custom Animation
```tsx
<AnimatedSection
  customVariants={{
    hidden: { opacity: 0, rotateY: -90 },
    visible: { opacity: 1, rotateY: 0 },
  }}
  customTransition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
>
  <div>Custom content</div>
</AnimatedSection>
```

### Performance Control
```tsx
// Force high performance (disable mobile optimizations)
<AnimatedSection 
  preset="fadeInUp" 
  optimizeForMobile={false}
  respectReducedMotion={true}
>
  <div>Always full animation</div>
</AnimatedSection>
```

### Custom Stagger Hook
```tsx
import { useStaggerAnimation } from '~/components/shared/animated-section';

const MyComponent = () => {
  const { parentVariants, parentTransition } = useStaggerAnimation({
    staggerDelay: 0.1,
    respectReducedMotion: true,
  });

  return (
    <InView variants={parentVariants} transition={parentTransition}>
      {/* Your staggered content */}
    </InView>
  );
};
```

## 🧪 Testing

### Device Testing
```typescript
import { clearDeviceCache } from '~/lib/device-utils';

// Test with different device capabilities
beforeEach(() => {
  clearDeviceCache();
});

// Mock low-end device
Object.defineProperty(navigator, 'hardwareConcurrency', { value: 2 });
Object.defineProperty(navigator, 'deviceMemory', { value: 1 });
```

### Reduced Motion Testing
```typescript
// Mock reduced motion preference
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockImplementation(query => ({
    matches: query === '(prefers-reduced-motion: reduce)',
    media: query,
  })),
});
```

## 📏 Best Practices

### Animation Timing
- **Hero elements**: 0.8s duration, 0.1-0.3s delays
- **Content sections**: 0.5-0.6s duration, 0.2s delays  
- **Interactive elements**: 0.2-0.3s duration
- **Stagger delay**: 0.1-0.15s between items

### Performance Guidelines
- Use `fadeInUpSimple` for mobile-heavy audiences
- Prefer `AnimatedGrid` over manual stagger implementations
- Test on low-end devices (< 4GB RAM, < 4 CPU cores)
- Avoid animating large images without optimization

### Accessibility Guidelines
- Always use `respectReducedMotion={true}` (default)
- Provide meaningful content without animation dependencies
- Test with motion preferences disabled
- Keep animations subtle and purposeful

## 🔄 Migration Guide

### From Previous Version
```tsx
// Old (complex, error-prone)
<InView
  variants={animationPresets.staggerChildren.variants}
  transition={animationPresets.staggerChildren.transition}
  viewOptions={animationPresets.staggerChildren.viewOptions}
>
  {/* complex stagger setup */}
</InView>

// New (simple, optimized)
<AnimatedGrid>
  <AnimatedGridItem>Content</AnimatedGridItem>
</AnimatedGrid>
```

## 🏗️ Architecture Decisions

### Separation of Concerns
- **device-utils.ts**: Pure device detection with caching
- **animation-presets.ts**: Scroll animation configurations
- **animation-utilities.ts**: Interactive animation patterns
- **animated-section.tsx**: React components with proper memoization

### Performance Philosophy
1. **Mobile-first**: Optimizations enabled by default
2. **Progressive enhancement**: Full animations on capable devices
3. **Graceful degradation**: Fallbacks for all scenarios
4. **User respect**: Honor accessibility preferences

### Type Safety
- Strict TypeScript with proper Framer Motion types
- No `any` types in public APIs
- Readonly configurations prevent mutations
- Compile-time validation of animation presets

This system is production-ready and follows industry standards for performance, accessibility, and maintainability. 