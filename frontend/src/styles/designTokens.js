// Design Token System for LLM Analyzer Dashboard
// Professional, catchy design that makes complex data accessible

export const designTokens = {
  // Color Psychology: Each parameter has its own personality
  colors: {
    // Primary brand colors
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe', 
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',  // Main brand
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e'
    },

    // Quality score color psychology
    quality: {
      excellent: {
        50: '#f0fdf4',
        500: '#22c55e',  // 90-100% - Vibrant green
        600: '#16a34a'
      },
      good: {
        50: '#fefce8', 
        500: '#eab308',  // 70-89% - Warm amber
        600: '#ca8a04'
      },
      fair: {
        50: '#fef2f2',
        500: '#ef4444',  // 50-69% - Alert orange
        600: '#dc2626'
      },
      poor: {
        50: '#fdf2f8',
        500: '#ec4899',  // 0-49% - Strong red
        600: '#db2777'
      }
    },

    // Parameter personality colors
    parameter: {
      temperature: {
        50: '#fef2f2',
        500: '#ef4444',  // Red - Heat/creativity
        600: '#dc2626',
        gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
      },
      top_p: {
        50: '#eff6ff',
        500: '#3b82f6',  // Blue - Focus/precision  
        600: '#2563eb',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
      },
      max_tokens: {
        50: '#f0fdf4',
        500: '#22c55e',  // Green - Length/completeness
        600: '#16a34a',
        gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
      }
    },

    // Semantic colors
    semantic: {
      success: '#22c55e',
      warning: '#f59e0b', 
      error: '#ef4444',
      info: '#3b82f6'
    },

    // Neutral grays for professional look
    neutral: {
      0: '#ffffff',
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712'
    }
  },

  // Typography system for clear hierarchy
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
      display: ['Cal Sans', 'Inter', 'sans-serif']
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
      sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
      base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
      lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
      xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
      '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
      '5xl': ['3rem', { lineHeight: '1' }]           // 48px
    },
    fontWeight: {
      light: '300',
      normal: '400', 
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800'
    }
  },

  // Spacing system for consistent layout
  spacing: {
    px: '1px',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    12: '3rem',       // 48px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    32: '8rem'        // 128px
  },

  // Border radius for modern feel
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px'
  },

  // Professional shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    glow: '0 0 20px rgba(59, 130, 246, 0.15)' // Blue glow for focus
  },

  // Animation system for smooth interactions
  animation: {
    duration: {
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: '200ms',
      300: '300ms',
      500: '500ms',
      700: '700ms',
      1000: '1000ms'
    },
    ease: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)', 
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  },

  // Z-index layers for proper stacking
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800
  }
};

// Helper functions for design token usage
export const getQualityColor = (score) => {
  if (score >= 90) return designTokens.colors.quality.excellent[500];
  if (score >= 70) return designTokens.colors.quality.good[500];
  if (score >= 50) return designTokens.colors.quality.fair[500];
  return designTokens.colors.quality.poor[500];
};

export const getQualityColorWithOpacity = (score, opacity = 1) => {
  const color = getQualityColor(score);
  return color.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
};

export const getParameterColor = (paramName) => {
  return designTokens.colors.parameter[paramName]?.[500] || designTokens.colors.neutral[500];
};

export const getParameterGradient = (paramName) => {
  return designTokens.colors.parameter[paramName]?.gradient || 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
};

// Responsive breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px', 
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

export default designTokens;
