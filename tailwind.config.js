/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Breakpoints customizados para melhor responsividade
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        // Breakpoints específicos para mobile
        'mobile-sm': '320px',
        'mobile-md': '375px',
        'mobile-lg': '425px',
        // Breakpoint para tablet
        'tablet': '768px',
        // Breakpoints para landscape
        'landscape': { 'raw': '(orientation: landscape)' },
        'portrait': { 'raw': '(orientation: portrait)' },
      },
      
      // Spacing otimizado para touch
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        'touch': '44px', // Tamanho mínimo para elementos touch
      },
      
      // Fonts otimizadas
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },
      
      // Cores do design system
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        gray: {
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
        },
      },
      
      // Animações otimizadas para mobile
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-in',
        'fade-in': 'fadeIn 0.2s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-out',
      },
      
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceSubtle: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-4px)' },
          '60%': { transform: 'translateY(-2px)' },
        },
      },
      
      // Grid responsivo
      gridTemplateColumns: {
        'responsive': 'repeat(auto-fit, minmax(280px, 1fr))',
        'responsive-sm': 'repeat(auto-fit, minmax(200px, 1fr))',
      },
    },
  },
  plugins: [
    // Plugin para utilities de container responsivo
    function({ addUtilities }) {
      addUtilities({
        '.container-responsive': {
          width: '100%',
          maxWidth: '1200px',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: '1rem',
          paddingRight: '1rem',
          '@screen md': {
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem',
          },
          '@screen lg': {
            paddingLeft: '2rem',
            paddingRight: '2rem',
          },
        },
        '.touch-target': {
          minHeight: '44px',
          minWidth: '44px',
        },
        '.safe-area-inset': {
          paddingTop: 'env(safe-area-inset-top)',
          paddingRight: 'env(safe-area-inset-right)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
        },
      })
    }
  ],
};
