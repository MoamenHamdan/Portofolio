import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

const CustomCursor = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    // Mouse position state
    const mouseX = useSpring(0, { stiffness: 500, damping: 28 });
    const mouseY = useSpring(0, { stiffness: 500, damping: 28 });
    const dotX = useSpring(0, { stiffness: 1000, damping: 40 });
    const dotY = useSpring(0, { stiffness: 1000, damping: 40 });

    useEffect(() => {
        if (window.matchMedia("(pointer: coarse), (prefers-reduced-motion: reduce)").matches) { setIsMobile(true); return; }
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);

        const handleMouseMove = (e) => {
            mouseX.set(e.clientX - 16);
            mouseY.set(e.clientY - 16);
            dotX.set(e.clientX - 4);
            dotY.set(e.clientY - 4);
        };

        const handleMouseOver = (e) => {
            if (e.target.closest('button, a, .interactive')) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, [mouseX, mouseY, dotX, dotY]);

    if (isMobile) return null;

    return (
        <>
            {/* Main Ring */}
            <motion.div
                className="fixed top-0 left-0 w-8 h-8 rounded-full border border-[#b91c1c] pointer-events-none z-[9999]"
                style={{
                    x: mouseX,
                    y: mouseY,
                    scale: isHovering ? 2 : 1,
                    backgroundColor: isHovering ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    borderColor: isHovering ? '#ef4444' : '#b91c1c',
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            />
            {/* Inner Dot */}
            <motion.div
                className="fixed top-0 left-0 w-2 h-2 rounded-full bg-white pointer-events-none z-[9999]"
                style={{
                    x: dotX,
                    y: dotY,
                    scale: isHovering ? 0 : 1,
                }}
            />
        </>
    );
};

export default CustomCursor;
