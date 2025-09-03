import { useEffect, useState, CSSProperties } from 'react';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';

interface MobileOptimizerProps {
  children: React.ReactNode;
}

export function MobileOptimizer({ children }: MobileOptimizerProps) {
  const { isMobile, isTablet, screenWidth } = useDeviceDetection();
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Detectar se é dispositivo de toque
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouch(hasTouch);

    // Adicionar classes CSS baseadas no dispositivo
    const body = document.body;
    
    // Remover classes anteriores
    body.classList.remove('device-mobile', 'device-tablet', 'device-desktop', 'device-touch');
    
    // Adicionar classes baseadas no dispositivo atual
    if (isMobile) {
      body.classList.add('device-mobile');
    } else if (isTablet) {
      body.classList.add('device-tablet');
    } else {
      body.classList.add('device-desktop');
    }
    
    if (hasTouch) {
      body.classList.add('device-touch');
    }

    // Configurar viewport meta tag dinamicamente para mobile
    if (isMobile) {
      let viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        viewport = document.createElement('meta');
        viewport.setAttribute('name', 'viewport');
        document.head.appendChild(viewport);
      }
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    }

    // Configurar CSS custom properties para responsividade
    const root = document.documentElement;
    root.style.setProperty('--screen-width', `${screenWidth}px`);
    root.style.setProperty('--is-mobile', isMobile ? '1' : '0');
    root.style.setProperty('--is-tablet', isTablet ? '1' : '0');
    root.style.setProperty('--is-touch', hasTouch ? '1' : '0');

  }, [isMobile, isTablet, screenWidth]);

  // Adicionar estilos específicos para mobile
  const mobileStyles: CSSProperties = isMobile ? {
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
  } : {};

  return (
    <div 
      className={`
        ${isMobile ? 'mobile-optimized' : ''}
        ${isTablet ? 'tablet-optimized' : ''}
        ${isTouch ? 'touch-optimized' : ''}
      `}
      style={mobileStyles}
    >
      {children}
    </div>
  );
}

// Hook para obter informações de otimização mobile
export function useMobileOptimization() {
  const { isMobile, isTablet, screenWidth, screenHeight } = useDeviceDetection();
  const [isTouch, setIsTouch] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouch(hasTouch);

    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  return {
    isMobile,
    isTablet,
    isTouch,
    orientation,
    screenWidth,
    screenHeight,
    isSmallScreen: screenWidth < 375,
    isLargeScreen: screenWidth > 414,
    // Classes CSS úteis
    containerClass: isMobile ? 'px-3 py-4' : 'px-6 py-6',
    buttonClass: isMobile ? 'py-3 px-4 text-sm' : 'py-2 px-4',
    modalClass: isMobile ? 'mx-2 my-4 rounded-lg' : 'mx-auto my-8 rounded-xl',
    gridClass: isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 md:grid-cols-3 gap-6',
  };
}
