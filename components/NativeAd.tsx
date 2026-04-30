import React, { useEffect, useRef } from 'react';

interface NativeAdProps {
  id: string;
  className?: string;
}

const NativeAd: React.FC<NativeAdProps> = ({ id, className = '' }) => {
  const containerId = `container-${id}`;
  const executedRef = useRef(false);

  useEffect(() => {
    // Only execute once per mount
    if (executedRef.current) return;
    
    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = `https://pl29271594.profitablecpmratenetwork.com/${id}/invoke.js`;
    
    document.head.appendChild(script);
    executedRef.current = true;

    return () => {
      // Cleanup if necessary, though these scripts usually manage themselves
    };
  }, [id]);

  return (
    <div className={`my-8 flex justify-center ${className}`}>
      <div id={containerId} className="w-full max-w-4xl" />
    </div>
  );
};

export default NativeAd;
