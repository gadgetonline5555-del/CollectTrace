import React, { useRef, useState } from "react";

export default function PullToRefresh({ onRefresh, children, threshold = 70, scrollRef }) {
  const ref = useRef(null);
  const startY = useRef(0);
  const pulling = useRef(false);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const atTop = () => {
    if (scrollRef && scrollRef.current) return scrollRef.current.scrollTop <= 0;
    const y = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
    return y <= 0;
  };

  const onTouchStart = (e) => {
    if (refreshing) return;
    if (atTop()) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    } else {
      pulling.current = false;
    }
  };

  const onTouchMove = (e) => {
    if (!pulling.current || refreshing) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) {
      setPull(Math.min(dy * 0.5, threshold * 1.6));
    }
  };

  const onTouchEnd = async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pull >= threshold) {
      setRefreshing(true);
      setPull(threshold);
      try {
        await onRefresh?.();
      } finally {
        setRefreshing(false);
        setPull(0);
      }
    } else {
      setPull(0);
    }
  };

  const showIndicator = pull > 0 || refreshing;

  return (
    <div
      ref={ref}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="relative overscroll-none"
    >
      {showIndicator && (
        <div
          className="absolute inset-x-0 flex items-center justify-center"
          style={{ top: "calc(env(safe-area-inset-top) + 3rem)", height: pull || threshold }}
        >
          <div
            className={`w-6 h-6 border-2 border-border border-t-primary rounded-full ${
              refreshing ? "animate-spin" : ""
            }`}
          />
        </div>
      )}
      <div
        style={{
          transform: `translateY(${pull}px)`,
          transition: pulling.current ? "none" : "transform 0.2s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}