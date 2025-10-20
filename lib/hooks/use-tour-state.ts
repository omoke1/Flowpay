"use client";

import { useState, useEffect } from "react";

const TOUR_COMPLETED_KEY = "flowpay_tour_completed";

export function useTourState() {
  const [hasCompletedTour, setHasCompletedTour] = useState<boolean | null>(null);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    // Check if user has completed the tour
    const completed = localStorage.getItem(TOUR_COMPLETED_KEY);
    setHasCompletedTour(completed === "true");
  }, []);

  const markTourCompleted = () => {
    localStorage.setItem(TOUR_COMPLETED_KEY, "true");
    setHasCompletedTour(true);
    setShowTour(false);
  };

  const startTour = () => {
    setShowTour(true);
  };

  const skipTour = () => {
    // When user skips tour, mark it as completed so it never shows again
    localStorage.setItem(TOUR_COMPLETED_KEY, "true");
    setHasCompletedTour(true);
    setShowTour(false);
  };

  const resetTour = () => {
    localStorage.removeItem(TOUR_COMPLETED_KEY);
    setHasCompletedTour(false);
  };

  return {
    hasCompletedTour,
    showTour,
    startTour,
    skipTour,
    markTourCompleted,
    resetTour
  };
}
