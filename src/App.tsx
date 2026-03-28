import { useState, useCallback, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { HandTracker, HandData } from './components/HandTracker';
import { ParticleSystem, ParticleTemplate } from './components/ParticleSystem';
import { UIOverlay } from './components/UIOverlay';

export default function App() {
  const [template, setTemplate] = useState<ParticleTemplate>('heart');
  const [color, setColor] = useState('#00f2ff');
  const [handData, setHandData] = useState<HandData>({
    distance: 1,
    pinch: 0,
    openness: 0.5,
    isDetected: false,
    handCount: 0,
  });

  // Ref for tracking velocity and boost
  const prevOpennessRef = useRef(0.5);
  const lastTimeRef = useRef(Date.now());
  const [velocityBoost, setVelocityBoost] = useState(0);

  const handleHandUpdate = useCallback((data: HandData) => {
    const now = Date.now();
    const dt = (now - lastTimeRef.current) / 1000; // seconds
    
    if (dt > 0) {
      const deltaOpen = data.openness - prevOpennessRef.current;
      const velocity = deltaOpen / dt;

      // If opening fast, add a boost
      if (velocity > 1.5) { // Threshold for "fast" opening
        const boost = Math.min(velocity * 0.8, 4); // Cap the boost
        setVelocityBoost(prev => Math.max(prev, boost));
      }
    }

    prevOpennessRef.current = data.openness;
    lastTimeRef.current = now;
    setHandData(data);
  }, []);

  // Decay the velocity boost over time
  useEffect(() => {
    let frameId: number;
    const decay = () => {
      setVelocityBoost(prev => Math.max(0, prev * 0.92)); // Smooth decay
      frameId = requestAnimationFrame(decay);
    };
    frameId = requestAnimationFrame(decay);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Final expansion calculation
  // Base expansion from openness + dynamic boost from speed
  const expansion = handData.isDetected 
    ? 0.3 + (handData.openness * 2.5) + velocityBoost
    : 1.0;

  return (
    <div className="w-full h-screen bg-[#050505] overflow-hidden font-sans">
      {/* 3D Scene */}
      <Canvas
        camera={{ position: [0, 0, 15], fov: 45 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#050505']} />
        <ambientLight intensity={0.5} />
        
        <ParticleSystem 
          template={template} 
          color={color} 
          expansion={expansion} 
        />

        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          minDistance={5} 
          maxDistance={30}
        />

        <EffectComposer>
          <Bloom 
            luminanceThreshold={0.2} 
            mipmapBlur 
            intensity={1.5} 
            radius={0.4} 
          />
        </EffectComposer>
      </Canvas>

      {/* Hand Tracking Component */}
      <HandTracker onHandUpdate={handleHandUpdate} />

      {/* UI Overlay */}
      <UIOverlay
        currentTemplate={template}
        onTemplateChange={setTemplate}
        color={color}
        onColorChange={setColor}
        handDetected={handData.isDetected}
        handCount={handData.handCount}
      />

      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none opacity-20" 
           style={{ 
             background: `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 70%)` 
           }} 
      />
    </div>
  );
}
