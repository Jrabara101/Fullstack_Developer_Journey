import confetti from 'canvas-confetti';

/**
 * The "Mutual Spark" Celebration:
 * Releases a burst of electric violet and vibrant pink confetti particles
 * with spring physics when reciprocal friendship loop is completed!
 */
export function triggerMutualSpark(originElement = null) {
  let origin = { x: 0.5, y: 0.5 };

  if (originElement) {
    const rect = originElement.getBoundingClientRect();
    origin = {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    };
  }

  // Count & colors strictly adhering to the design specification
  const colors = ['#8B5CF6', '#EC4899', '#A855F7', '#F472B6', '#3B82F6', '#FFFFFF'];

  // Left & Right twin burst
  confetti({
    particleCount: 45,
    angle: 60,
    spread: 55,
    origin,
    colors,
    startVelocity: 25,
    ticks: 120,
    scalar: 0.85,
    shapes: ['circle', 'square'],
  });

  confetti({
    particleCount: 45,
    angle: 120,
    spread: 55,
    origin,
    colors,
    startVelocity: 25,
    ticks: 120,
    scalar: 0.85,
    shapes: ['circle', 'square'],
  });

  // Center ring blast
  setTimeout(() => {
    confetti({
      particleCount: 30,
      spread: 100,
      origin,
      colors: ['#EC4899', '#8B5CF6', '#FFD700'],
      startVelocity: 15,
      ticks: 90,
      gravity: 0.8,
      scalar: 0.75,
    });
  }, 100);
}
