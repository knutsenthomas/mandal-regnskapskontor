import React, { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useLayoutEffect(() => {
        try {
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        } catch {
            // Fallback for browsers that reject the options object.
            window.scrollTo(0, 0);
        }
    }, [pathname]);

    return null;
}

export default ScrollToTop;
