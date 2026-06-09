'use client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: '#f8f9fa',
        color: '#1a1a1a',
      },
    },
  },
  colors: {
    primary: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
  },
  components: {
    Button: {
      defaultProps: { colorScheme: 'primary' },
    },
    Table: {
      variants: {
        simple: {
          thead: { tr: { bg: '#f5f5f5' } },
        },
      },
    },
  },
  fonts: {
    body: `'Inter', system-ui, sans-serif`,
    heading: `'Inter', system-ui, sans-serif`,
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}
