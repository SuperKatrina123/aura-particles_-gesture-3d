import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type ParticleTemplate = 'heart' | 'flower' | 'saturn' | 'buddha' | 'fireworks';

interface ParticleSystemProps {
  template: ParticleTemplate;
  color: string;
  expansion: number;
}

const PARTICLE_COUNT = 5000;

export const ParticleSystem: React.FC<ParticleSystemProps> = ({ template, color, expansion }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const targetPositions = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), [template]);
  const currentPositions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
      arr[i] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, []);
  const velocities = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);

  // Generate target shapes
  useMemo(() => {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      let x = 0, y = 0, z = 0;

      if (template === 'heart') {
        const t = Math.random() * Math.PI * 2;
        x = 16 * Math.pow(Math.sin(t), 3);
        y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        z = (Math.random() - 0.5) * 5;
        const scale = 0.15;
        targetPositions[i3] = x * scale;
        targetPositions[i3 + 1] = y * scale;
        targetPositions[i3 + 2] = z * scale;
      } else if (template === 'flower') {
        const t = Math.random() * Math.PI * 2;
        const k = 5; // petals
        const r = 4 * Math.cos(k * t);
        x = r * Math.cos(t);
        y = r * Math.sin(t);
        z = (Math.random() - 0.5) * 2;
        targetPositions[i3] = x;
        targetPositions[i3 + 1] = y;
        targetPositions[i3 + 2] = z;
      } else if (template === 'saturn') {
        if (i < PARTICLE_COUNT * 0.6) {
          // Sphere
          const u = Math.random();
          const v = Math.random();
          const theta = 2 * Math.PI * u;
          const phi = Math.acos(2 * v - 1);
          const r = 2;
          targetPositions[i3] = r * Math.sin(phi) * Math.cos(theta);
          targetPositions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
          targetPositions[i3 + 2] = r * Math.cos(phi);
        } else {
          // Ring
          const r = 3 + Math.random() * 1.5;
          const theta = Math.random() * Math.PI * 2;
          targetPositions[i3] = r * Math.cos(theta);
          targetPositions[i3 + 1] = (Math.random() - 0.5) * 0.2;
          targetPositions[i3 + 2] = r * Math.sin(theta);
        }
      } else if (template === 'buddha') {
        // Abstract zen figure (stacked spheres)
        const rand = Math.random();
        if (rand < 0.4) { // Body
          const r = 1.5 + Math.random() * 0.5;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          targetPositions[i3] = r * Math.sin(phi) * Math.cos(theta);
          targetPositions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) - 1;
          targetPositions[i3 + 2] = r * Math.cos(phi);
        } else if (rand < 0.7) { // Head
          const r = 0.8;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          targetPositions[i3] = r * Math.sin(phi) * Math.cos(theta);
          targetPositions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) + 1.2;
          targetPositions[i3 + 2] = r * Math.cos(phi);
        } else { // Base/Lotus
          const r = 2.5 * Math.sqrt(Math.random());
          const theta = Math.random() * Math.PI * 2;
          targetPositions[i3] = r * Math.cos(theta);
          targetPositions[i3 + 1] = -2.2 + (Math.random() - 0.5) * 0.5;
          targetPositions[i3 + 2] = r * Math.sin(theta);
        }
      } else if (template === 'fireworks') {
        const r = 5 * Math.pow(Math.random(), 0.5);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        targetPositions[i3] = r * Math.sin(phi) * Math.cos(theta);
        targetPositions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        targetPositions[i3 + 2] = r * Math.cos(phi);
      }
    }
  }, [template]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      
      // Target with expansion
      const tx = targetPositions[i3] * expansion;
      const ty = targetPositions[i3 + 1] * expansion;
      const tz = targetPositions[i3 + 2] * expansion;

      // Smooth transition to target
      const lerpFactor = expansion < 0.5 ? 0.15 : 0.1; // Faster aggregation
      positions[i3] += (tx - positions[i3]) * lerpFactor;
      positions[i3 + 1] += (ty - positions[i3 + 1]) * lerpFactor;
      positions[i3 + 2] += (tz - positions[i3 + 2]) * lerpFactor;

      // Add some noise/float
      const jitter = expansion < 0.5 ? 0.05 : 0.01;
      positions[i3] += Math.sin(time + i) * jitter;
      positions[i3 + 1] += Math.cos(time + i) * jitter;
      positions[i3 + 2] += Math.sin(time * 0.5 + i) * jitter;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y += delta * 0.2;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={currentPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={color}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
};
