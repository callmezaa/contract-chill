import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

const Blob = ({ position, color, speed, distort, radius, opacity = 0.4 }: any) => {
  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={1}>
      <mesh position={position}>
        <sphereGeometry args={[radius, 64, 64]} />
        <MeshDistortMaterial
          color={color}
          speed={speed}
          distort={distort}
          transparent
          opacity={opacity}
          roughness={0.1}
          metalness={0.1}
          envMapIntensity={1}
        />
      </mesh>
    </Float>
  );
};

export const GlassyBackground = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`fixed inset-0 -z-10 transition-colors duration-700 overflow-hidden ${
      isDark ? 'bg-[#0b0b0d]' : 'bg-background'
    }`}>
      {/* CSS Background Layer for extra depth */}
      <div className={`absolute inset-0 pointer-events-none ${
          isDark
           ? 'bg-[radial-gradient(circle_at_50%_50%,rgba(0,113,227,0.04),transparent)]'
           : 'bg-[radial-gradient(circle_at_50%_50%,rgba(29,29,31,0.018),transparent)]'
      }`} />
      
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={isDark ? 0.5 : 0.9} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ffffff" />
        
        <Blob 
          position={[-4, 2, 0]} 
          color={isDark ? "#3b82f6" : "#f1f5f9"} 
          speed={1.5} 
          distort={0.4} 
          radius={2.5} 
          opacity={isDark ? 0.15 : 0.3}
        />
        
        <Blob 
          position={[4, -2, -2]} 
          color={isDark ? "#8b5cf6" : "#f8fafc"} 
          speed={1.2} 
          distort={0.5} 
          radius={3} 
          opacity={isDark ? 0.12 : 0.2}
        />
        
        <Blob 
          position={[0, 0, -5]} 
          color={isDark ? "#2dd4bf" : "#ffffff"} 
          speed={0.8} 
          distort={0.3} 
          radius={4} 
          opacity={isDark ? 0.08 : 0.15}
        />

        <Environment preset="city" />
      </Canvas>

      {/* Keep the ambient layer quiet so content remains crisp. */}
      <div className="absolute inset-0 backdrop-blur-[80px] pointer-events-none opacity-70" />
    </div>
  );
};
