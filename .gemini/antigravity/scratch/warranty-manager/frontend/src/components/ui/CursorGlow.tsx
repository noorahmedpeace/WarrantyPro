import { useEffect, useState } from 'react';

export const CursorGlow = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
            setIsVisible(true);
        };

        const handleMouseLeave = () => {
            setIsVisible(false);
        };

        window.addEventListener('mousemove', handleMouseMove);
        document.body.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.body.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <>
            {/* Cursor Spotlight */}
            <div
                className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-300"
                style={{
                    opacity: isVisible ? 1 : 0,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(59, 130, 246, 0.08), transparent 40%)`,
                }}
            />

            {/* Cursor Glow */}
            <div
                className="pointer-events-none fixed w-96 h-96 -translate-x-1/2 -translate-y-1/2 z-40 transition-opacity duration-300"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    opacity: isVisible ? 1 : 0,
                    background: 'radial-gradient(circle, rgba(147, 51, 234, 0.06) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                }}
            />
        </>
    );
};
