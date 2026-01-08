// Hook for haptic feedback on mobile devices
export function useHapticFeedback() {
  const vibrate = (pattern: number | number[] = 10) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Silently fail if vibration is not supported
      }
    }
  };

  const lightTap = () => vibrate(10);
  const mediumTap = () => vibrate(25);
  const heavyTap = () => vibrate(50);
  const doubleTap = () => vibrate([10, 50, 10]);
  const success = () => vibrate([10, 30, 20]);
  const error = () => vibrate([50, 30, 50]);

  return {
    vibrate,
    lightTap,
    mediumTap,
    heavyTap,
    doubleTap,
    success,
    error,
  };
}
