
import React, { useState, useEffect, useRef } from 'react';
import { useConfig } from '../context/ConfigContext';

export const PilotsStory: React.FC = () => {
  const { config } = useConfig();
  const { images } = config;
  const scrollRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const starterMenteeRef = useRef<HTMLDivElement>(null); // Ref to trigger animation
  
  // Consolidated state for performance
  const [storyState, setStoryState] = useState({
    progress: 0,
    planeX: 150, // Starting coordinates based on path "M 150 50"
    planeY: 50,
    planeAngle: 0
  });

  const PLANE_ICON = "https://lh3.googleusercontent.com/d/1LBUmOl-u3czx1hLf1NTgPrTnc9Gf1d1z";

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current || !pathRef.current || !starterMenteeRef.current) return;
      
      const elementHeight = scrollRef.current.getBoundingClientRect().height;
      
      if (elementHeight === 0) return; // Prevent division by zero if element is hidden or height is 0

      const starterMenteeRect = starterMenteeRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate raw progress based on the starter mentee's position.
      // Animation starts when the starter mentee section enters the viewport.
      let rawProgress = (windowHeight - starterMenteeRect.top) / elementHeight;
      
      // Clamp raw progress between 0 and 1
      rawProgress = Math.max(0, Math.min(1, rawProgress));

      // Apply a constant fast speed curve to the progress
      // Adjusted speed to be faster (approx 1.5 times faster than original 1.5 multiplier)
      let progress = rawProgress * 2.25;

      // Final animation progress is clamped to 1
      progress = Math.min(1, progress);
      
      // Calculate Plane Position and Rotation
      const path = pathRef.current;
      
      // Check if getTotalLength exists and returns a valid number (browser compatibility/state check)
      if (typeof path.getTotalLength !== 'function') return;

      const totalLen = path.getTotalLength();
      
      if (!Number.isFinite(totalLen) || totalLen === 0) return; // Safety check

      const currentLen = totalLen * progress;
      
      if (!Number.isFinite(currentLen)) return; // Prevent passing non-finite value to getPointAtLength

      const point = path.getPointAtLength(currentLen);
      
      // Calculate angle for rotation (look ahead/behind for tangent)
      const lookAhead = 2; 
      let p1 = point;
      let p2 = point;
      
      if (currentLen < totalLen - lookAhead) {
          p2 = path.getPointAtLength(currentLen + lookAhead);
          // Standard atan2
      } else {
          // At end of path, look backward to maintain angle
          p1 = path.getPointAtLength(currentLen - lookAhead);
          p2 = point;
      }
      
      // Calculate angle in degrees
      // Standard math calculates 0 deg as East (Right). 
      // If the plane icon points right by default, no adjustment needed.
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);

      setStoryState({
        progress,
        planeX: point.x,
        planeY: point.y,
        planeAngle: angle
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial call to set state correctly on mount
    handleScroll(); 
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="w-full relative bg-[#e3d0a6] overflow-hidden">
        {/* Container for the scroll animation */}
        <div 
            ref={scrollRef}
            className="relative w-full"
        >
            {/* The Map Background - Parallax Effect */}
            <div 
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ 
                    backgroundImage: `url(${images.STORY_MAP_BG})`,
                    backgroundSize: 'cover',
                    backgroundPosition: `50% ${storyState.progress * 100}%`,
                    transition: 'background-position 0.1s linear',
                    filter: 'blur(2px)'
                }}
            />

            {/* Paper Overlay - Solid Opacity 100% with Blend Mode */}
            <img 
                src={images.STORY_PAPER_OVERLAY}
                alt=""
                className="absolute inset-0 w-full h-full object-cover pointer-events-none mix-blend-multiply z-0 opacity-100"
            />
            
            {/* --- CONTENT --- */}
            {/* Removed px-6 on mobile to allow full width, added md:px-6 */}
            <div className="relative z-10 flex flex-col items-center w-full max-w-7xl mx-auto md:px-6 py-24 md:py-32">
                
                {/* Header Title with "Ink" look */}
                <div className="text-center mb-16 md:mb-24 flex flex-col items-center px-4">
                    <img 
                        src={images.LOGO} 
                        alt="Wing Mentor Logo" 
                        className="w-32 h-32 md:w-64 md:h-64 object-contain mb-6 md:mb-8 filter drop-shadow-lg"
                    />
                    <h2
                        className="text-4xl md:text-7xl font-['Playfair_Display',_serif] font-bold text-[#3e2b1e] tracking-wider drop-shadow-md"
                        style={{
                            textShadow: '2px 2px 0px rgba(255,255,255,0.5)'
                        }}>
                        Wing Mentor
                    </h2>
                    <p
                        className="text-xl md:text-4xl font-['Playfair_Display',_serif] font-light text-[#4a3b2a] tracking-[0.3em] uppercase drop-shadow-sm mt-2"
                        style={{
                            textShadow: '1px 1px 0px rgba(255,255,255,0.3)'
                        }}>
                        Program Plan
                    </p>
                </div>

                {/* STORY PATH CONTAINER */}
                <div className="relative w-full max-w-5xl">
                    
                    {/* SVG Container for Path & Line (BEHIND CONTENT) */}
                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible" style={{ height: '100%', minHeight: '1200px' }} preserveAspectRatio="none" viewBox="0 0 800 1300">
                        <defs>
                            <mask id="line-mask">
                                <path 
                                    d="M 150 50 C 450 50, 650 200, 650 400 C 650 600, 250 700, 150 800 C 50 900, 150 1100, 350 1200" 
                                    fill="none" 
                                    stroke="white" 
                                    strokeWidth="15" 
                                    pathLength="1"
                                    strokeDasharray="1"
                                    strokeDashoffset={1 - storyState.progress} 
                                    strokeLinecap="round"
                                />
                            </mask>
                             {/* Reversed path for correcting text orientation on right-to-left curves */}
                            <path
                                id="flight-path-curve-reversed"
                                d="M 350 1200 C 150 1100, 50 900, 150 800 C 250 700, 650 600, 650 400 C 650 200, 450 50, 150 50"
                                fill="none"
                            />
                        </defs>
                        
                        {/* Reference Path for Calculations */}
                        <path 
                            id="flight-path-curve"
                            ref={pathRef}
                            d="M 150 50 C 450 50, 650 200, 650 400 C 650 600, 250 700, 150 800 C 50 900, 150 1100, 350 1200" 
                            fill="none" 
                            stroke="rgba(0,0,0,0.1)" // Very faint guide line
                            strokeWidth="4" 
                            strokeDasharray="15, 15"
                            strokeLinecap="round"
                        />

                        {/* Text along the path (TOP HALF) */}
                        <text dy="-15">
                            <textPath 
                                href="#flight-path-curve" 
                                startOffset="13%" 
                                className="fill-[#b91c1c] font-['Playfair_Display',_serif] text-sm md:text-lg font-bold tracking-[0.2em] opacity-80"
                            >
                                PATHWAY TO MENTOR
                            </textPath>
                            <textPath
                                href="#flight-path-curve"
                                startOffset="20%"
                                className="fill-black font-['Playfair_Display',_serif] text-sm md:text-lg font-bold tracking-[0.2em]"
                                style={{ opacity: storyState.progress > 0.15 ? 0.7 : 0, transition: 'opacity 0.5s ease-in-out' }}
                            >
                                • First Solo
                            </textPath>
                            <textPath
                                href="#flight-path-curve"
                                startOffset="28%"
                                className="fill-black font-['Playfair_Display',_serif] text-sm md:text-base font-semibold tracking-wider"
                                style={{ opacity: storyState.progress > 0.23 ? 0.7 : 0, transition: 'opacity 0.5s ease-in-out' }}
                            >
                                • Private Pilot License
                            </textPath>
                        </text>

                        {/* Text along the path (BOTTOM HALF) */}
                        <text dy="-25">
                            <textPath
                                href="#flight-path-curve-reversed"
                                startOffset="22%"
                                className="fill-black font-['Playfair_Display',_serif] text-sm md:text-base font-semibold tracking-wider"
                                style={{ opacity: storyState.progress > 0.75 ? 0.7 : 0, transition: 'opacity 0.5s ease-in-out' }}
                            >
                                • Commercial License
                            </textPath>
                            <textPath
                                href="#flight-path-curve-reversed"
                                startOffset="16%"
                                className="fill-black font-['Playfair_Display',_serif] text-sm md:text-base font-semibold tracking-wider"
                                style={{ opacity: storyState.progress > 0.82 ? 0.7 : 0, transition: 'opacity 0.5s ease-in-out' }}
                            >
                                • IFR Rated
                            </textPath>
                        </text>

                        {/* Airport/Runway at Destination (End of Line) */}
                        <rect 
                            x="330" 
                            y="1170" 
                            width="40" 
                            height="120" 
                            fill="#1a1a1a" 
                            rx="1" 
                            transform="rotate(-30 350 1200)"
                            className="drop-shadow-sm"
                        />
                        {/* Runway Centerline */}
                        <line 
                            x1="350" 
                            y1="1180" 
                            x2="350" 
                            y2="1280" 
                            stroke="#e5e5e5" 
                            strokeWidth="2" 
                            strokeDasharray="8 8" 
                            transform="rotate(-30 350 1200)" 
                        />

                        {/* The Visible Red Dashed Line (Masked) */}
                        <path 
                            d="M 150 50 C 450 50, 650 200, 650 400 C 650 600, 250 700, 150 800 C 50 900, 150 1100, 350 1200" 
                            fill="none" 
                            stroke="#b91c1c" 
                            strokeWidth="4" 
                            strokeDasharray="15, 15"
                            strokeLinecap="round"
                            mask="url(#line-mask)"
                        />
                        
                        {/* The Airplane Icon - in its own container for layering (ABOVE CONTENT) */}
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-30">
                            <img 
                                src={PLANE_ICON}
                                alt="Airplane navigating the flight path"
                                style={{
                                    position: 'absolute',
                                    width: 50,
                                    height: 50,
                                    left: `${storyState.planeX}px`,
                                    top: `${storyState.planeY}px`,
                                    transform: `translate(-50%, -50%) rotate(${storyState.planeAngle}deg)`,
                                    filter: 'drop-shadow(3px 5px 2px rgba(0,0,0,0.3))',
                                    opacity: storyState.progress > 0 ? 1 : 0,
                                    transition: 'opacity 0.3s ease',
                                    transformOrigin: 'center center'
                                }}
                            />
                        </div>
                    </svg>
                    
                    {/* HTML Content Overlay */}
                    
                    {/* STAGE 1: Starter Mentee (Top Left) */}
                    {/* Updated: w-[85%] for mobile edge-to-edge feel, reduced margin bottom */}
                    <div ref={starterMenteeRef} className="relative mb-32 md:mb-64 flex justify-start pl-4 md:pl-10">
                        <div className="relative w-[85%] h-80 md:w-80 md:h-[28rem] overflow-hidden group border-2 border-black/50 rounded-lg shadow-2xl">
                            <img src={images.STORY_STUDENT} alt="Starter Mentee" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-6">
                                <h3 className="text-white text-2xl md:text-3xl brand-font font-bold drop-shadow-lg uppercase tracking-wide">Starter Mentee</h3>
                                <p className="text-zinc-300 text-xs md:text-sm mt-2 font-['Playfair_Display',_serif] italic leading-relaxed">
                                    "This is where you start... Reach the goal of 10 hrs with a mentor to get access to the Black Box where all pilot knowledge will help you through your pilot career."
                                </p>
                            </div>
                            {/* Red Dot Marker */}
                            <div className="absolute top-1/2 right-[-12px] w-6 h-6 bg-[#b91c1c] rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.4)] z-10 border-2 border-white"></div>
                        </div>
                    </div>

                    {/* STAGE 3: Junior Mentor (Middle Right) */}
                    <div className="relative mb-32 md:mb-64 flex justify-end pr-4 md:pr-10">
                        <div className="relative w-[85%] h-80 md:w-80 md:h-[28rem] overflow-hidden group border-2 border-black/50 rounded-lg shadow-2xl">
                            <img src={images.STORY_PPL} alt="Junior Mentor" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-6">
                                <h3 className="text-white text-2xl md:text-3xl brand-font font-bold drop-shadow-lg uppercase tracking-wide">Junior Mentor</h3>
                                <p className="text-zinc-300 text-xs md:text-sm mt-2 font-['Playfair_Display',_serif] italic leading-relaxed">
                                    "After completing 20 hours of supervised mentorship, you shall gain the experience and valuable skills to become an official mentor."
                                </p>
                            </div>
                            {/* Red Dot Marker */}
                            <div className="absolute top-1/2 left-[-12px] w-6 h-6 bg-[#b91c1c] rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.4)] z-10 border-2 border-white"></div>
                        </div>
                    </div>

                    {/* STAGE 4: Official Wingmentor (Bottom Center) */}
                    <div className="relative mb-16 md:mb-20 flex flex-col items-center justify-center px-4">
                        <div className="relative w-full md:max-w-2xl h-96 md:h-[32rem] overflow-hidden group border-2 border-black/50 rounded-lg shadow-2xl">
                            <img src={images.STORY_CPL} alt="Official Wingmentor" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex flex-col justify-end p-6 md:p-8 text-center">
                                <h3 className="text-white text-3xl md:text-4xl brand-font font-bold drop-shadow-lg uppercase tracking-wide">Official Wingmentor</h3>
                                <p className="text-zinc-200 text-sm md:text-base mt-4 font-['Playfair_Display',_serif] leading-relaxed">
                                    "Official Wingmentor status is granted at the 20th hour. Upon completing your 50th hour, you will be awarded a program completion certificate. This journey equips you with invaluable hands-on experience, consulting problem-solving skills, Crew Resource Management, and verified logged hours. You'll have the leverage to confidently state in job interviews, 'I have supported and guided X amount of pilots,' setting you apart from other flight instructor applicants."
                                </p>
                            </div>
                            {/* Red Dot Marker */}
                            <div className="absolute top-1/2 right-[-12px] w-6 h-6 bg-[#b91c1c] rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.4)] z-10 border-2 border-white"></div>
                        </div>
                    </div>
                </div>

                {/* COMIC STRIP SECTION: BECOMING A WING MENTOR */}
                <div className="w-full mt-16 border-t-4 border-dashed border-[#8a1c1c]/40 pt-16 text-center">
                    <h2 className="text-3xl md:text-5xl font-['Playfair_Display',_serif] italic text-[#3e2b1e] mb-12 drop-shadow-sm" style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.5)' }}>
                        Becoming a Wing Mentor
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 h-auto md:h-80 shadow-none md:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.4)]">
                        {/* Panel 1 */}
                        <div className="relative h-64 md:h-full overflow-hidden group border-2 border-black/50 rounded-lg">
                            <img src={images.STORY_MENTOR_1} alt="Guidance & Strategy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-center p-4 transition-all duration-300 group-hover:bg-black/40">
                                <h3 className="text-white text-xl md:text-2xl font-bold uppercase tracking-wider text-center drop-shadow-lg notam-font transition-all duration-300 group-hover:scale-105 pb-2">"Guidance & Strategy"</h3>
                            </div>
                        </div>

                        {/* Panel 2 */}
                        <div className="relative h-64 md:h-full overflow-hidden group border-2 border-black/50 rounded-lg">
                            <img src={images.STORY_MENTOR_2} alt="Verifiable Experience" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-center p-4 transition-all duration-300 group-hover:bg-black/40">
                                <h3 className="text-white text-xl md:text-2xl font-bold uppercase tracking-wider text-center drop-shadow-lg notam-font transition-all duration-300 group-hover:scale-105 pb-2">"Verifiable Experience"</h3>
                            </div>
                        </div>

                        {/* Panel 3 */}
                        <div className="relative h-64 md:h-full overflow-hidden group border-2 border-black/50 rounded-lg">
                            <img src={images.STORY_MENTOR_3} alt="Interview Leverage" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-center p-4 transition-all duration-300 group-hover:bg-black/40">
                                <h3 className="text-white text-xl md:text-2xl font-bold uppercase tracking-wider text-center drop-shadow-lg notam-font transition-all duration-300 group-hover:scale-105 pb-2">"Interview Leverage with Experience"</h3>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 max-w-2xl mx-auto relative bg-[#fdfbf7]/80 p-6 rounded-xl border border-[#d6c4a0] shadow-sm backdrop-blur-sm mx-4 md:mx-auto">
                        {/* Decorative Quotes */}
                        <span className="absolute -top-4 -left-4 text-6xl text-[#8a1c1c] opacity-30 font-serif">“</span>
                        <p className="font-['Playfair_Display',_serif] text-lg md:text-2xl text-[#4a3b2a] italic leading-relaxed px-4">
                            Walk into an interview not just with a license, but with the leverage to say, 'I have supported and guided X amount of pilots in various stages (CPL, PPL, SPL), with verified logged hours of support and guidance through the Wing Mentor program.'
                        </p>
                        <span className="absolute -bottom-12 -right-4 text-6xl text-[#8a1c1c] opacity-30 font-serif">”</span>
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};
