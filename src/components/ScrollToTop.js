import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./ScrollToTop.css";

const SCROLL_THRESHOLD = 320;

const ScrollToTop = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsVisible(window.scrollY > SCROLL_THRESHOLD);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    setIsVisible(false);
  }, [location.pathname, location.search]);

  if (!isVisible) {
    return null;
  }

  return (
    <button
      type="button"
      className="scroll-to-top-btn"
      aria-label="Vrati na vrh stranice"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <span className="scroll-to-top-btn__arrow" aria-hidden="true">
        ↑
      </span>
    </button>
  );
};

export default ScrollToTop;
