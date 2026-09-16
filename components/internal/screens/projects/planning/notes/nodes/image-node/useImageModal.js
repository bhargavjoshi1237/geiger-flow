"use client";

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";

// The "is this the client?" store never emits — the snapshot flips purely by
// virtue of the server and client snapshot functions differing.
const subscribeNever = () => () => {};

export function useImageModal({ isDrawing }) {
  const [isFullResOpen, setIsFullResOpen] = useState(false);
  const [imgDims, setImgDims] = useState({ w: 0, h: 0 });
  const [isSizeOpen, setIsSizeOpen] = useState(false);
  const [isColorOpen, setIsColorOpen] = useState(false);

  // Client-only flag for the portal target. useSyncExternalStore gives false on
  // the server and true after hydration without a setState-driven second pass.
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);

  // Opening the drawing tool pops the full-resolution view — on the TRANSITION
  // into isDrawing, never on the first render (which is why the previous value
  // seeds from the current one rather than from false).
  const [prevIsDrawing, setPrevIsDrawing] = useState(isDrawing);
  if (prevIsDrawing !== isDrawing) {
    setPrevIsDrawing(isDrawing);
    if (isDrawing) setIsFullResOpen(true);
  }

  const handleDoubleClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFullResOpen(true);
  }, []);

  const closeFullRes = useCallback((e) => {
    if (e) e.stopPropagation();
    setIsFullResOpen(false);
    setIsSizeOpen(false);
    setIsColorOpen(false);
  }, []);

  const handleImageLoad = useCallback((e) => {
    const natW = e.target.naturalWidth;
    const natH = e.target.naturalHeight;
    const maxW = window.innerWidth * 0.9;
    const maxH = window.innerHeight * 0.9;

    const ratio = Math.min(maxW / natW, maxH / natH);

    setImgDims({
      w: natW * ratio,
      h: natH * ratio,
    });
  }, []);

  return {
    isFullResOpen,
    mounted,
    imgDims,
    isSizeOpen,
    isColorOpen,
    setIsSizeOpen,
    setIsColorOpen,
    handleDoubleClick,
    closeFullRes,
    handleImageLoad,
  };
}
