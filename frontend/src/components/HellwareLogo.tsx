import React from 'react';

interface HellwareLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'pdf' | 'custom';
  iconOnly?: boolean;
}

export default function HellwareLogo({ 
  className = '', 
  size = 'md', 
  iconOnly = false
}: HellwareLogoProps) {
  
  // Clean circle dots matching the user's attachment H pattern exactly.
  // 7 dots: 3 on left column, 3 on right column, 1 in the very center.
  // Dot height and spacing.
  const dotSizes = {
    xs: 'w-1 h-1 md:w-1 md:h-1',
    sm: 'w-1.5 h-1.5 md:w-1.5 md:h-1.5',
    md: 'w-2.5 h-2.5 md:w-2.5 md:h-2.5',
    lg: 'w-3 h-3 md:w-3.5 md:h-3.5',
    xl: 'w-4.5 h-4.5 md:w-5 md:h-5',
    pdf: 'w-3.5 h-3.5',
    custom: 'w-2 h-2'
  };

  const gapSizes = {
    xs: 'gap-0.5',
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2',
    xl: 'gap-3',
    pdf: 'gap-2',
    custom: 'gap-1.5'
  };

  const currentDot = dotSizes[size] || dotSizes.md;
  const currentGap = gapSizes[size] || gapSizes.md;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`} id="hellware-logo">
      {/* 7-Dot H Grid Pattern */}
      <div className={`grid grid-cols-3 ${currentGap} shrink-0`}>
        {/* Row 1 */}
        <div className={`${currentDot} rounded-full bg-[#E94560]`} />
        <div className={`${currentDot} bg-transparent`} />
        <div className={`${currentDot} rounded-full bg-[#E94560]`} />
        
        {/* Row 2 */}
        <div className={`${currentDot} rounded-full bg-[#E94560]`} />
        <div className={`${currentDot} rounded-full bg-white`} />
        <div className={`${currentDot} rounded-full bg-[#E94560]`} />
        
        {/* Row 3 */}
        <div className={`${currentDot} rounded-full bg-[#E94560]`} />
        <div className={`${currentDot} bg-transparent`} />
        <div className={`${currentDot} rounded-full bg-[#E94560]`} />
      </div>

      {!iconOnly && (
        <div className="flex flex-col text-left leading-none">
          <span className="font-display font-black tracking-wider text-white text-sm uppercase">HELLWARE</span>
          <span className="text-[7.5px] font-mono text-neutral-400 block tracking-widest mt-0.5 font-bold">// SEC_LEVEL_3</span>
        </div>
      )}
    </div>
  );
}
