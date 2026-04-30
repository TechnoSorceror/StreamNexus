import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  id: string;
  height: number;
  width: number;
  className?: string;
  onInteract?: () => void;
}

const AdBanner: React.FC<AdBannerProps> = ({ id, height, width, className = '', onInteract }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleBlur = () => {
      // Check if the focused element is inside our ad container
      if (document.activeElement?.tagName === 'IFRAME' && containerRef.current?.contains(document.activeElement)) {
        onInteract?.();
      }
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [onInteract]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear the container
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = `
      atOptions = {
        'key' : '${id}',
        'format' : 'iframe',
        'height' : ${height},
        'width' : ${width},
        'params' : {}
      };
    `;

    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = `https://www.highperformanceformat.com/${id}/invoke.js`;

    containerRef.current.appendChild(script);
    containerRef.current.appendChild(invokeScript);
  }, [id, height, width]);

  return (
    <div 
      className={`flex justify-center items-center my-4 overflow-hidden ${className}`}
      style={{ minHeight: height, minWidth: width }}
      ref={containerRef}
    />
  );
};

export default AdBanner;
