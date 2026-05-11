import { createTheme, type MantineColorsTuple } from '@mantine/core';

// Accent: bright blue (#3b82f6) as the primary action color.
const accent: MantineColorsTuple = [
  '#e8f1ff',
  '#cfe0ff',
  '#9ec0ff',
  '#6a9fff',
  '#4283ff',
  '#2b71ff',
  '#1f68ff',
  '#1457e6',
  '#054ccd',
  '#0042b6',
];

export const theme = createTheme({
  primaryColor: 'accent',
  primaryShade: 5,
  colors: { accent },
  fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontFamilyMonospace:
    '"JetBrains Mono", "SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace',
  defaultRadius: 'md',
  radius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
  },
  components: {
    Textarea: {
      defaultProps: {
        autosize: false,
        minRows: 6,
      },
    },
  },
});
