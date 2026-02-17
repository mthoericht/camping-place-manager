import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

function getInitialIsMobile(): boolean 
{
  if (typeof window === 'undefined') return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
}

export function useIsMobile() 
{
  const [isMobile, setIsMobile] = React.useState<boolean>(getInitialIsMobile);

  React.useEffect(() => 
  {
    const mediaQueryList = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const onChange = () => 
    {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    mediaQueryList.addEventListener('change', onChange);

    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    return () => mediaQueryList.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
