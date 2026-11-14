/**
 * Android Haptics Design Best Practices for Web
 * Inspired by https://developer.android.com/develop/ui/views/haptics
 *
 * Principles:
 * 1. Purposeful: Applied only during deliberate user interactions (clicks, toggles, switches).
 * 2. Predictable: Consistent feedback length for the same category of actions.
 * 3. Graceful: Silent degradation on desktop or devices without vibration hardware.
 */

class HapticsService {
  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'vibrate' in navigator;
  }

  // Subtle tick for minor discrete events (e.g. stepper + / -, checkbox toggle)
  // Corresponds to Android's HapticFeedbackConstants.CLOCK_TICK / KEYBOARD_TAP
  tick() {
    if (this.isSupported) {
      try {
        navigator.vibrate(10);
      } catch (e) {
        // ignore if blocked by browser policy
      }
    }
  }

  // Tactile click for button presses & filter changes
  // Corresponds to Android's HapticFeedbackConstants.VIRTUAL_KEY
  click() {
    if (this.isSupported) {
      try {
        navigator.vibrate(15);
      } catch (e) {}
    }
  }

  // Medium impact for significant navigation events (e.g. switching carts / tabs)
  // Corresponds to Android's HapticFeedbackConstants.SEGMENT_FREQUENT_TICK / CONFIRM
  selection() {
    if (this.isSupported) {
      try {
        navigator.vibrate(25);
      } catch (e) {}
    }
  }

  // Celebratory / positive success feedback pattern (e.g. floor completed, task done)
  // Rhythm: short tap, brief rest, firm confirm
  success() {
    if (this.isSupported) {
      try {
        navigator.vibrate([15, 30, 25]);
      } catch (e) {}
    }
  }

  // Warning or deletion pattern (e.g. deleting an item, resetting list)
  // Rhythm: two distinct alert pulses
  warning() {
    if (this.isSupported) {
      try {
        navigator.vibrate([30, 40, 30]);
      } catch (e) {}
    }
  }
}

export const haptics = new HapticsService();
