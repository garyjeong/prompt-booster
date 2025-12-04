---
description: Design System Maintenance Guide
---

# Design System Maintenance

This project uses a custom design system built on top of Chakra UI, inspired by Starbucks' green palette and Glassmorphism.

## Theme Configuration

The theme is defined in `src/theme/index.ts`.

### Colors
- `brand`: The primary green palette. `brand.500` is the primary action color.
- `accent`: Secondary colors for highlights.
- `gray`: Neutral tones for backgrounds and text.

### Components
- **Button**: Rounded 'pill' style. Variants: `solid`, `outline`, `ghost`, `glass`.
- **Card**: `floating` variant implements the Glassmorphism effect.
- **Input**: `filled` variant with custom focus states.

## Layout Structure

The application uses a "Floating Card" layout structure defined in `src/app/page.tsx`.

```tsx
<Flex w="full" h="full" gap={6} p={6}>
  <Sidebar ... />
  <Card variant="floating" flex={1} h="full" overflow="hidden">
    <CardBody p={0} h="full" display="flex" flexDirection="column">
      {CONTENT}
    </CardBody>
  </Card>
</Flex>
```

## Dark Mode Support

All components should support Dark Mode using `useColorModeValue` or semantic tokens.
- Backgrounds: Use `gray.800` or `brand.900` for dark mode.
- Text: Use `gray.100` or `whiteAlpha.900`.
- Borders: Use `whiteAlpha.200`.

## Adding New Components

When adding new components, ensure they:
1. Inherit from `Card` with `variant="floating"` if they are main containers.
2. Use `brand` colors for actions.
3. Support both Light and Dark modes.
