import React, { useEffect, useRef, useState } from 'react';
import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

export interface HandData {
  distance: number; // Distance between two hands (normalized 0-1)
  pinch: number;    // Pinch strength (normalized 0-1)
  openness: number; // 0 for fist, 1 for open palm
  isDetected: boolean;
  handCount: number;
}

interface HandTrackerProps {
  onHandUpdate: (data: HandData) => void;
}

export const HandTracker: React.FC<HandTrackerProps> = ({ onHandUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;

    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results: Results) => {
      let distance = 0.5;
      let pinch = 0;
      let totalOpenness = 0;
      const isDetected = results.multiHandLandmarks.length > 0;

      results.multiHandLandmarks.forEach((hand) => {
        // Calculate openness: average distance from wrist (0) to tips (8, 12, 16, 20)
        // Normalized by distance from wrist (0) to index MCP (5)
        const wrist = hand[0];
        const indexMCP = hand[5];
        const handSize = Math.sqrt(
          Math.pow(wrist.x - indexMCP.x, 2) + 
          Math.pow(wrist.y - indexMCP.y, 2) + 
          Math.pow(wrist.z - indexMCP.z, 2)
        );

        const tips = [8, 12, 16, 20];
        let avgFingerDist = 0;
        tips.forEach(tipIdx => {
          const tip = hand[tipIdx];
          avgFingerDist += Math.sqrt(
            Math.pow(wrist.x - tip.x, 2) + 
            Math.pow(wrist.y - tip.y, 2) + 
            Math.pow(wrist.z - tip.z, 2)
          );
        });
        avgFingerDist /= tips.length;

        // Openness ratio: roughly 1.5-2.0 for closed, 3.5-4.5 for open
        const ratio = avgFingerDist / handSize;
        const openness = Math.min(Math.max((ratio - 1.8) / 1.5, 0), 1);
        totalOpenness += openness;
      });

      const avgOpenness = results.multiHandLandmarks.length > 0 
        ? totalOpenness / results.multiHandLandmarks.length 
        : 0.5;

      if (results.multiHandLandmarks.length === 2) {
        const h1 = results.multiHandLandmarks[0][0];
        const h2 = results.multiHandLandmarks[1][0];
        const dx = h1.x - h2.x;
        const dy = h1.y - h2.y;
        const dz = h1.z - h2.z;
        distance = Math.sqrt(dx * dx + dy * dy + dz * dz) * 2;
      } else if (results.multiHandLandmarks.length === 1) {
        const hand = results.multiHandLandmarks[0];
        const thumb = hand[4];
        const index = hand[8];
        const dx = thumb.x - index.x;
        const dy = thumb.y - index.y;
        const dz = thumb.z - index.z;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        pinch = Math.max(0, 1 - d * 10);
        distance = 0.5 + pinch * 0.5;
      }

      onHandUpdate({
        distance: Math.min(Math.max(distance, 0), 2),
        pinch,
        openness: avgOpenness,
        isDetected,
        handCount: results.multiHandLandmarks.length,
      });
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await hands.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480,
    });

    camera.start().then(() => setIsLoaded(true));

    return () => {
      camera.stop();
      hands.close();
    };
  }, [onHandUpdate]);

  return (
    <div className="fixed bottom-4 right-4 w-48 h-36 bg-black/50 rounded-lg overflow-hidden border border-white/20 z-50">
      <video
        ref={videoRef}
        className="w-full h-full object-cover scale-x-[-1]"
        playsInline
        muted
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-xs">
          Loading Camera...
        </div>
      )}
    </div>
  );
};
