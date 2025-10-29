# Parameter Testing Lab - Design System

## 🎨 Color Palette

### Primary Colors
```css
/* Hero Section Gradient */
--hero-gradient: linear-gradient(to right, #3B82F6, #8B5CF6, #6366F1);
/* Blue-500, Purple-500, Indigo-500 */

/* Background */
--page-background: linear-gradient(to bottom right, #F8FAFC, #DBEAFE, #E0E7FF);
/* Slate-50, Blue-50, Indigo-50 */
```

### Component Colors
```css
/* Card Backgrounds */
--card-primary: rgba(255, 255, 255, 0.8);
--card-secondary: linear-gradient(to right, #EFF6FF, #F3E8FF);
/* Blue-50 to Purple-50 */

/* Text Colors */
--text-primary: #111827;    /* Gray-900 */
--text-secondary: #6B7280;  /* Gray-500 */
--text-hero: #FFFFFF;       /* White */
--text-hero-subtitle: rgba(255, 255, 255, 0.8);

/* Border Colors */
--border-light: rgba(255, 255, 255, 0.2);
--border-normal: #E5E7EB;   /* Gray-200 */
--border-accent: #3B82F6;   /* Blue-500 */
```

### Parameter Personality Colors
```css
/* Parameter Color Mapping */
--creativity: #EC4899;      /* Pink-500 */
--focus: #3B82F6;          /* Blue-500 */
--length: #10B981;         /* Emerald-500 */
--repetition: #F59E0B;     /* Amber-500 */
--novelty: #8B5CF6;        /* Purple-500 */
```

## 🖼️ Layout Structure

### Grid System
```css
/* Main Container */
.container {
  min-height: 100vh;
  padding: 1.5rem;
  gap: 1.5rem;
}

/* Row Layouts */
.row-1 { /* Parameter Presets */
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}
@media (min-width: 1024px) {
  .row-1 {
    grid-template-columns: repeat(4, 1fr);
  }
}

.row-2 { /* Model Selection & Controls */
  grid-template-columns: 1fr;
  gap: 0.75rem;
}
@media (min-width: 1024px) {
  .row-2-top {
    grid-template-columns: 1fr 3fr;
  }
  .row-2-bottom {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (min-width: 1280px) {
  .row-2-bottom {
    grid-template-columns: repeat(5, 1fr);
  }
}
```

### Component Hierarchy
```
Parameter Testing Lab
├── Hero Section
├── Parameter Presets (Row 1)
├── Model Selection & Parameter Controls (Row 2)
│   ├── Model Selection + Configuration Summary
│   └── Parameter Sliders
├── Test Prompt (Row 3)
├── Generate Button (Row 4)
└── Results Section (Row 5)
    ├── Generated Response
    └── Quality Metrics (when available)
```

## 🎯 Typography

### Font Families
```css
/* Primary Font Stack */
font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 
             "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", 
             sans-serif, "Apple Color Emoji", "Segoe UI Emoji", 
             "Segoe UI Symbol", "Noto Color Emoji";
```

### Text Scales
```css
/* Hero Section */
.hero-title {
  font-size: 1.875rem;    /* 3xl */
  font-weight: 700;       /* bold */
  line-height: 1.2;
  letter-spacing: -0.025em;
}

.hero-subtitle {
  font-size: 1.125rem;    /* lg */
  font-weight: 400;       /* normal */
}

/* Section Headers */
.section-header {
  font-size: 1.125rem;    /* lg */
  font-weight: 700;       /* bold */
  background: linear-gradient(to right, #111827, #374151);
  background-clip: text;
  color: transparent;
}

/* Component Titles */
.component-title {
  font-size: 0.875rem;    /* sm */
  font-weight: 700;       /* bold */
}

/* Body Text */
.body-text {
  font-size: 0.75rem;     /* xs */
  font-weight: 500;       /* medium */
  line-height: 1.4;
}

/* Parameter Values */
.parameter-value {
  font-size: 0.875rem;    /* sm */
  font-weight: 900;       /* black */
  background: linear-gradient(to right, #111827, #374151);
  background-clip: text;
  color: transparent;
}
```

## 🎭 Component Specifications

### Hero Section
```css
.hero {
  background: linear-gradient(to right, #3B82F6, #8B5CF6, #6366F1);
  padding: 2rem 1.5rem;
  color: white;
}

.hero-badge {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
  padding: 0.25rem 0.75rem;
  backdrop-filter: blur(4px);
}
```

### Parameter Presets Cards
```css
.preset-card {
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 0.75rem;
  padding: 0.75rem;
  transition: all 0.3s ease;
}

.preset-card:hover {
  transform: scale(1.02);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.preset-card.active {
  border-color: #3B82F6;
  background: linear-gradient(to bottom right, #EFF6FF, #E0E7FF);
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.15);
  ring: 2px solid rgba(59, 130, 246, 0.2);
}

.preset-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}
```

### Parameter Sliders
```css
.parameter-slider {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
  padding: 0.625rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.parameter-slider:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.slider-track {
  height: 0.5rem;
  background: #E2E8F0;
  border-radius: 0.5rem;
  appearance: none;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.slider-thumb {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.15s ease;
  cursor: pointer;
}

.slider-thumb:hover {
  transform: scale(1.1);
}
```

### Model Selection Section
```css
.model-section {
  background: linear-gradient(to right, #EFF6FF, #F3E8FF);
  border: 1px solid #3B82F6;
  border-radius: 0.5rem;
  padding: 0.75rem;
}

.model-select {
  width: 100%;
  padding: 0.375rem 0.5rem;
  font-size: 0.75rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  background: white;
  transition: all 0.2s ease;
}

.model-select:focus {
  ring: 1px solid #3B82F6;
  border-color: #3B82F6;
}

.config-item {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 0.375rem;
  padding: 0.5rem;
  text-align: center;
}
```

### Generate Button
```css
.generate-button {
  position: relative;
  padding: 1rem 2.5rem;
  background: linear-gradient(to right, #2563EB, #7C3AED, #4F46E5);
  color: white;
  font-size: 1rem;
  font-weight: 700;
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  transition: all 0.3s ease;
  transform-origin: center;
}

.generate-button:hover {
  background: linear-gradient(to right, #1D4ED8, #6D28D9, #4338CA);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
  transform: scale(1.05);
}

.generate-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, #60A5FA, #A78BFA, #818CF8);
  border-radius: 0.75rem;
  filter: blur(16px);
  opacity: 0.3;
  transition: opacity 0.3s ease;
}

.generate-button:hover::before {
  opacity: 0.5;
}
```

## 🎪 Animation & Transitions

### Hover Effects
```css
/* Card Hover */
.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
}

/* Button Hover */
.button-hover {
  transition: all 0.2s ease;
}

.button-hover:hover {
  transform: scale(1.05);
}

/* Slider Thumb */
.thumb-hover {
  transition: transform 0.15s ease;
}

.thumb-hover:hover {
  transform: scale(1.1);
}
```

### Loading States
```css
.loading-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.loading-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

## 📐 Spacing System

### Padding Scale
```css
--spacing-xs: 0.25rem;    /* 1 */
--spacing-sm: 0.5rem;     /* 2 */
--spacing-md: 0.75rem;    /* 3 */
--spacing-lg: 1rem;       /* 4 */
--spacing-xl: 1.5rem;     /* 6 */
--spacing-2xl: 2rem;      /* 8 */
```

### Gap System
```css
--gap-tight: 0.375rem;    /* 1.5 */
--gap-normal: 0.75rem;    /* 3 */
--gap-relaxed: 1.5rem;    /* 6 */
```

## 🎨 Theme Variations

### Light Theme (Current)
- Primary: Blue-Purple gradient
- Background: Light gray-blue gradient
- Cards: White with transparency
- Text: Dark gray on light backgrounds

### Dark Theme (Future)
```css
/* Dark theme colors for future implementation */
--dark-bg: linear-gradient(to bottom right, #0F172A, #1E293B, #334155);
--dark-card: rgba(30, 41, 59, 0.8);
--dark-text-primary: #F8FAFC;
--dark-text-secondary: #CBD5E1;
--dark-border: rgba(100, 116, 139, 0.3);
```

## 🛠️ Implementation Notes

### CSS Custom Properties Usage
```css
:root {
  /* Define all color variables */
  --primary-gradient: linear-gradient(to right, #3B82F6, #8B5CF6, #6366F1);
  --card-bg: rgba(255, 255, 255, 0.8);
  --text-primary: #111827;
  /* ... other variables */
}

/* Use throughout components */
.hero {
  background: var(--primary-gradient);
}

.card {
  background: var(--card-bg);
  color: var(--text-primary);
}
```

### Responsive Breakpoints
```css
/* Mobile First Approach */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### Accessibility Considerations
- Color contrast ratios meet WCAG AA standards
- Focus states clearly visible
- Hover states provide visual feedback
- Text remains readable at all sizes
- Interactive elements have adequate touch targets (44px minimum)

## 📝 Usage Guidelines

1. **Consistency**: Always use defined color variables
2. **Spacing**: Follow the spacing system for margins and padding
3. **Typography**: Use the defined text scales
4. **Animations**: Keep transitions smooth and purposeful
5. **Responsiveness**: Design mobile-first, enhance for larger screens
6. **Performance**: Use backdrop-blur sparingly
7. **Accessibility**: Maintain color contrast and focus visibility

This design system ensures consistency across the Parameter Testing Lab interface while maintaining flexibility for future enhancements.
