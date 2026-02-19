# Palette Snapshot - Collapsible Color Sources

## Overview

The Palette Snapshot component has been enhanced with a collapsible color sources feature to reduce visual clutter and improve user focus. Instead of showing all source colors at once, the component now presents only the first color initially, with an intuitive "+N" button to reveal additional colors.

## Feature Details

### User Experience

1. **Initial State**
   - Only the first color source is visible
   - A "+N" button shows the count of hidden colors (e.g., "+4" for 4 additional colors)
   - Clean, focused interface reduces cognitive load

2. **Expanded State**
   - Click on the first color chip OR the "+N" button to reveal all sources
   - All color chips become visible with smooth transition animations
   - Click on any color chip to collapse back to initial state

3. **Single Source Handling**
   - When only one source color exists, no "+N" button is shown
   - The single color is always visible

### Accessibility Features

The implementation includes comprehensive accessibility support:

- **ARIA Attributes**
  - `aria-expanded` on color chips indicates current expansion state
  - `aria-label` on "+N" button describes its purpose (e.g., "Show 4 more colors")
  - Informative labels on first color when collapsed

- **Keyboard Navigation**
  - All interactive elements are keyboard accessible
  - Standard button semantics for consistent experience
  - Focus indicators match Dracula theme styling

- **Screen Reader Support**
  - Descriptive labels for all interactive elements
  - State changes are announced to assistive technologies

### Visual Design

- **Smooth Animations**
  - Chip appearance animation (0.3s ease)
  - Hover effects with elevation changes
  - Scale animations on "+N" button interactions

- **Dracula Theme Integration**
  - Purple accent color for "+N" button
  - Pink hover state for visual feedback
  - Consistent border and shadow styling

- **Interactive Feedback**
  - Hover: Elevation change, purple border
  - Active: Press animation
  - Focus: Purple outline for keyboard navigation

## Implementation Details

### Component Structure

```vue
<button
  v-for="(s, index) in displayedSources"
  class="chip chip--interactive"
  @click="toggleSourcesExpanded"
  :aria-expanded="sourcesExpanded ? 'true' : 'false'"
>
  {{ s.name }}
</button>

<button
  v-if="!sourcesExpanded && sources.length > 1"
  class="chip chip--show-more"
  @click="toggleSourcesExpanded"
>
  +{{ sources.length - 1 }}
</button>
```

### State Management

```typescript
const sourcesExpanded = ref(false);

const displayedSources = computed(() => {
  if (sourcesExpanded.value || props.sources.length <= 1) {
    return props.sources;
  }
  return props.sources.slice(0, 1);
});

function toggleSourcesExpanded() {
  sourcesExpanded.value = !sourcesExpanded.value;
}
```

### CSS Animations

```scss
@keyframes chip-appear {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.chip--interactive {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
}
```

## Testing

### Test Coverage

Comprehensive test suite with 10 tests covering:

1. **Basic Rendering**
   - Component renders with all props
   - Standards and insights display correctly

2. **Collapse/Expand Behavior**
   - Shows only first color initially
   - "+N" button displays correct count
   - Expands when clicking first color
   - Expands when clicking "+N" button
   - Toggles between states correctly

3. **Edge Cases**
   - Single source (no "+N" button)
   - Empty sources (graceful handling)

4. **Accessibility**
   - ARIA attributes are correct
   - Labels update with state changes
   - Keyboard navigation works

5. **Visual Styling**
   - Color chips have correct background colors
   - Title attributes show color names
   - Animation classes are applied

### Running Tests

```bash
npm run test:run -- src/__tests__/SnapshotCard.test.ts
```

Expected result: All 10 tests pass ✅

## Usage Example

```vue
<SnapshotCard
  :standards="['material', 'hsluv', 'oklch']"
  :sources="[
    { hex: '#ff0000', name: 'Red' },
    { hex: '#00ff00', name: 'Green' },
    { hex: '#0000ff', name: 'Blue' },
    { hex: '#ffff00', name: 'Yellow' }
  ]"
  :insights="{
    lightnessRange: [5, 96],
    averageChroma: 0.655,
    vividShare: 100,
    totalColors: 223
  }"
/>
```

**Result:**
- Initially shows: "Red" chip and "+3" button
- After clicking: All 4 color chips visible
- After clicking again: Back to "Red" and "+3"

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

All modern browsers with CSS animations and Vue 3 support.

## Related Issues

- Resolves #141: UI: Present Only One Color at a Time with Interactive Reveal
- Part of #140: Main: Palette UI/UX and Visualization Improvements

## Benefits

1. **Reduced Visual Clutter** - Cleaner interface with focused information
2. **Improved Discoverability** - "+N" button clearly indicates more content
3. **Better UX** - Smooth animations and intuitive interactions
4. **Accessibility** - Full keyboard and screen reader support
5. **Scalability** - Handles any number of source colors gracefully
6. **Consistency** - Matches Dracula theme design language

## Future Enhancements

Potential improvements for future versions:

- Persist expansion state in localStorage
- Keyboard shortcuts (e.g., Space to toggle)
- Customizable animation duration
- Option to set initial expansion state via prop
- Swipe gestures for mobile devices
