# Accessibility Components

Professional accessibility components for exceptional user experience.

## Components

### AccessibilityToolbar
Floating accessibility settings panel with beautiful UI.

```jsx
import { AccessibilityToolbar } from './components/Accessibility';

// Auto-renders floating button
<AccessibilityToolbar />
```

### KeyboardNavigation  
Site-wide keyboard shortcuts and navigation.

```jsx
import { KeyboardNavigation } from './components/Accessibility';

// No visual output - handles keyboard events
<KeyboardNavigation />
```

### SkipLinks
Skip to main content links for keyboard users.

```jsx
import { SkipLinks } from './components/Accessibility';

// Visible only on focus
<SkipLinks />
```

### ScreenReaderAnnouncer
Live region announcements for screen readers.

```jsx
import { ScreenReaderAnnouncer, useAnnouncer } from './components/Accessibility';

// Component (place once in app)
<ScreenReaderAnnouncer />

// Hook (use anywhere)
const { announce } = useAnnouncer();
announce('Quiz submitted successfully!', 'polite');
```

### KeyboardShortcutsModal
Help modal showing all keyboard shortcuts.

```jsx
import { KeyboardShortcutsModal } from './components/Accessibility';

// Triggered by pressing '?'
<KeyboardShortcutsModal />
```

## Context

### AccessibilityContext
Central settings management with localStorage persistence.

```jsx
import { AccessibilityProvider, useAccessibility } from './context/AccessibilityContext';

// Wrap your app
<AccessibilityProvider>
  <App />
</AccessibilityProvider>

// Use in components
const { settings, updateSetting, toggleSetting } = useAccessibility();
```

## Settings Available

- `reducedMotion` - Minimize animations
- `highContrast` - Increase color contrast
- `fontSize` - 'small' | 'medium' | 'large' | 'xlarge'
- `lineHeight` - 'normal' | 'relaxed' | 'loose'
- `letterSpacing` - 'normal' | 'wide'
- `enhancedFocus` - Prominent focus indicators
- `keyboardNavigation` - Enable keyboard shortcuts
- `skipLinks` - Show skip navigation links
- `dyslexiaFont` - Use OpenDyslexic font
- `readingGuide` - Highlight current line
- `soundEffects` - Enable sound effects
- `textToSpeech` - Text-to-speech (ready for implementation)
- `verboseDescriptions` - Detailed screen reader descriptions

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `?` | Show keyboard shortcuts |
| `/` | Focus search |
| `Esc` | Close modal |
| `Alt+H` | Home |
| `Alt+D` | Dashboard |
| `Alt+Q` | Quizzes |
| `Alt+L` | Leaderboard |
| `Tab` | Next element |
| `J` | Focus next |
| `K` | Focus previous |

## CSS Classes

### Utility
- `.sr-only` - Screen reader only
- `.visually-hidden` - Hidden but accessible
- `.sr-only-focusable` - Visible on focus

### State
- `.reduce-motion` - Animations disabled
- `.enhanced-focus` - Enhanced focus mode
- `.high-contrast` - High contrast mode
- `.dyslexia-font` - Dyslexia-friendly font
- `.reading-guide` - Reading guide enabled
- `.keyboard-navigating` - Keyboard navigation active

## Standards

Compliant with:
- WCAG 2.1 Level AA
- Section 508
- ARIA 1.2 Best Practices

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers

## Testing

### Keyboard
1. Tab through all elements
2. Test all shortcuts
3. Verify skip links

### Screen Reader
1. Test with NVDA/JAWS/VoiceOver
2. Check all announcements
3. Verify landmark navigation

### Visual
1. Test high contrast mode
2. Verify all font sizes
3. Check color contrast ratios

## Performance

- Zero impact on initial load
- Settings cached in localStorage
- Optimized re-renders
- Lazy-loaded components

## Accessibility Features

✅ Keyboard navigation  
✅ Screen reader support  
✅ High contrast mode  
✅ Flexible text sizing  
✅ Motion control  
✅ Focus management  
✅ Skip links  
✅ ARIA labels  
✅ Touch target sizes  
✅ Error prevention

## Documentation

- [User Guide](../../docs/ACCESSIBILITY_GUIDE.md)
- [Implementation Details](../../docs/ACCESSIBILITY_IMPLEMENTATION.md)

## Contributing

When adding new components:
1. Add proper ARIA labels
2. Ensure keyboard accessibility
3. Test with screen readers
4. Update documentation
5. Follow existing patterns

## License

Part of Cognito Learning Hub - 2025
