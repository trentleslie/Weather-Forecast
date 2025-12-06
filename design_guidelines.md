# Weather Visualization App Design Guidelines

## Design Approach

**Selected System**: Custom utility-focused design drawing from Apple HIG minimalism and Material Design's data visualization patterns. This weather app prioritizes data clarity and scanability over decorative elements.

**Core Principle**: Let the data tell the story. Every visual element serves the purpose of making temperature deviations and trends immediately comprehensible.

---

## Typography System

**Font Family**: Inter (via Google Fonts CDN)
- Primary: Inter (400, 500, 600, 700)
- Monospace numbers: 'SF Mono', 'Monaco' for temperature readings

**Hierarchy**:
- **Hero Numbers** (current temp): text-6xl md:text-8xl, font-bold, tabular-nums
- **Section Headers**: text-2xl md:text-3xl, font-semibold
- **Card Titles**: text-lg, font-medium
- **Temperature Values**: text-4xl md:text-5xl, font-semibold, tabular-nums
- **Deviation Indicators**: text-sm md:text-base, font-medium
- **Body Text**: text-base, font-normal
- **Chart Labels**: text-xs md:text-sm, font-medium

---

## Layout System

**Spacing Scale**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 24
- Component padding: p-4 md:p-6
- Section spacing: space-y-8 md:space-y-12
- Card gaps: gap-4 md:gap-6
- Inner card padding: p-6 md:p-8

**Grid System**:
- Container: max-w-7xl mx-auto px-4
- Chart area: Full-width within container
- Daily cards: grid grid-cols-1 md:grid-cols-3 gap-4

---

## Component Library

### Header/Navigation
- Fixed top bar with location search and settings
- Height: h-16 md:h-20
- Contains: Location text, search icon, unit toggle, geolocation button
- Layout: Flex justify-between items-center

### Current Weather Card (Hero Section)
- Large centered display, no background image
- Structure: Current temp (huge), deviation badge, location name, "What's unusual" narrative
- Badge: Inline with temperature, shows +/- deviation with up/down indicator
- Spacing: py-12 md:py-16

### Temperature Deviation Chart
- Full-width component with 16:9 aspect ratio on mobile, 21:9 on desktop
- Recharts ComposedChart with Area (shaded band) + Line (actual/forecast)
- Clear axis labels, grid lines, tooltips on hover
- Legend below chart explaining layers
- Padding: p-6 md:p-8
- Border: border rounded-lg

### Daily Anomaly Cards
- 3-card horizontal scroll on mobile, grid on desktop
- Each card structure:
  - Day label (top, small)
  - Large temperature value (center)
  - Deviation with arrow icon (below temp)
  - High/low range (small, bottom)
  - Precipitation probability (icon + percentage)
- Card padding: p-6
- Border: border rounded-xl
- Hover: subtle shadow elevation

### Location Search
- Modal overlay triggered from header
- Search input with autocomplete dropdown
- "Use my location" button with geolocation icon
- Recent searches list
- Modal: max-w-lg, centered, p-6

### Loading States
- Skeleton screens matching exact component layouts
- Pulse animation on skeleton elements
- Spinner for initial data fetch
- Height preservation to prevent layout shift

### Error States
- Alert box with error message
- Retry button
- Fallback to last successful location
- Padding: p-4, rounded-lg, border

---

## Icon System

**Library**: Heroicons (via CDN)
- Location pin, search, settings gear, up/down arrows
- Weather condition icons: sun, cloud, rain, snow
- Use outline style for interactive elements, solid for status indicators

---

## Interaction Patterns

**Temperature Unit Toggle**:
- Segmented control (°F | °C)
- Instant update without page reload

**Chart Interactions**:
- Hover tooltips showing exact values
- Touch-friendly tap targets on mobile
- No zoom/pan (keep simple)

**Geolocation**:
- Single-click "Use my location" button
- Loading indicator while fetching
- Permission prompt handling

**Search**:
- Debounced autocomplete (300ms)
- Clear button when input has text
- Enter key to select first result

---

## Responsive Breakpoints

- **Mobile** (default): Single column, stacked layout
- **Tablet** (md: 768px): 2-column where appropriate, larger text
- **Desktop** (lg: 1024px): Full 3-column daily cards, expanded chart

---

## Animation Guidelines

**Minimal Motion**:
- Fade-in for content loading (200ms ease-out)
- Smooth unit toggle transition (150ms)
- NO scroll-triggered animations
- NO chart entry animations
- Skeleton pulse only during load states

---

## Accessibility

- Semantic HTML for all components
- ARIA labels for icon-only buttons
- Keyboard navigation for search and toggles
- Focus indicators on all interactive elements (ring-2 ring-offset-2)
- Sufficient contrast ratios for all text
- Screen reader announcements for temperature updates

---

## Images

**No images required** - This is a data-driven interface where charts and numerical information are the primary visual elements. The temperature deviation chart serves as the visual centerpiece.