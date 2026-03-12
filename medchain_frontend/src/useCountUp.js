import { useState, useEffect, useRef } from "react";

/**
 * Animated count-up hook.
 * Counts from 0 to `end` over `duration` ms when the element is in viewport.
 * Returns [ref, displayValue].
 */
export function useCountUp(end, duration = 1200) {
    const ref = useRef(null);
    const [value, setValue] = useState(0);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started) {
                    setStarted(true);
                }
            },
            { threshold: 0.3 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [started]);

    useEffect(() => {
        if (!started) return;

        const startTime = performance.now();
        let raf;

        function tick(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * end));
            if (progress < 1) {
                raf = requestAnimationFrame(tick);
            }
        }

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [started, end, duration]);

    return [ref, value];
}

/**
 * Parses a display string like "$500B+", "12,847", "<2s", "7+", "100%"
 * and returns { prefix, number, suffix }.
 */
export function parseNumberString(str) {
    const match = str.match(/^([^0-9]*?)([\d,]+(?:\.\d+)?)(.*)$/);
    if (!match) return { prefix: "", number: 0, suffix: str };
    return {
        prefix: match[1],
        number: parseInt(match[2].replace(/,/g, ""), 10),
        suffix: match[3],
    };
}
