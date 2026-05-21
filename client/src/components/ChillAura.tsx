import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows, RoundedBox, Text, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

const AIOrb = ({ isDark }: { isDark: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -0.1]}>
      <sphereGeometry args={[0.8, 24, 24]} />
      <meshPhysicalMaterial 
        color={isDark ? "#818cf8" : "#6366f1"} 
        emissive={isDark ? "#4f46e5" : "#4338ca"}
        emissiveIntensity={0.5}
        wireframe
        transparent
        opacity={isDark ? 0.3 : 0.15}
      />
    </mesh>
  );
};

const PremiumCard = ({ position, rotation, scale, isDark }: any) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.4) * 0.08;
      
      const targetRotationX = rotation[0] + (state.mouse.y * 0.08);
      const targetRotationY = rotation[1] + (state.mouse.x * 0.12);
      
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 0.05);
    }
  });

  const lineColor = isDark ? "#334155" : "#e2e8f0";

  return (
    <Float speed={2} rotationIntensity={0.02} floatIntensity={0.02}>
      <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
        
        {/* Abstract Minimalist AI Core */}
        <AIOrb isDark={isDark} />

        {/* The Clean Frosted Glass Card */}
        <RoundedBox args={[3.4, 4.8, 0.05]} radius={0.08} smoothness={8} castShadow receiveShadow>
          <meshPhysicalMaterial 
            color={isDark ? "#0f172a" : "#ffffff"}
            metalness={0.1}
            roughness={0.1}
            transmission={0.9}
            ior={1.5}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </RoundedBox>

        {/* Minimalist Typography and UI Lines */}
        <group position={[0, 0, 0.03]}>
          {/* Header */}
          <Text 
            position={[-1.3, 2.0, 0]} 
            fontSize={0.2} 
            color={isDark ? "#ffffff" : "#0f172a"} 
            anchorX="left" 
            anchorY="middle" 
            letterSpacing={-0.02}
            fontWeight="bold"
          >
            ContractChill
          </Text>
          <Text 
            position={[-1.3, 1.8, 0]} 
            fontSize={0.06} 
            color={isDark ? "#818cf8" : "#6366f1"} 
            anchorX="left" 
            anchorY="middle" 
            letterSpacing={0.25}
          >
            AI LEGAL INTELLIGENCE
          </Text>

          {/* Clean Data Lines */}
          {[...Array(5)].map((_, i) => (
            <RoundedBox key={i} args={[2.6 - (i % 2 === 0 ? 0 : 0.4), 0.015, 0.01]} position={[-1.3 + (1.3 - (i % 2 === 0 ? 0 : 0.2)), 1.2 - i * 0.2, 0]} radius={0.005}>
              <meshBasicMaterial color={lineColor} transparent opacity={0.6} />
            </RoundedBox>
          ))}
          
          <Text 
            position={[1.3, -2.1, 0]} 
            fontSize={0.04} 
            color={isDark ? "#475569" : "#cbd5e1"} 
            anchorX="right" 
            anchorY="middle" 
            letterSpacing={0.2}
          >
            SECURE ENVIRONMENT
          </Text>
        </group>
      </group>
    </Float>
  );
};

export const ChillAura = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div className={`absolute inset-0 transition-colors duration-700 ${
        isDark ? 'bg-background' : 'bg-slate-50'
      }`} />
      
      {/* Soft abstract glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <Canvas camera={{ position: [0, 0, 10], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={isDark ? 0.8 : 1.2} />
        
        <directionalLight 
          position={[5, 10, 8]} 
          intensity={isDark ? 1.5 : 2} 
          color={isDark ? "#818cf8" : "#ffffff"} 
        />
        <directionalLight 
          position={[-5, -5, -5]} 
          intensity={isDark ? 0.5 : 1} 
          color={isDark ? "#c084fc" : "#e2e8f0"} 
        />
        
        {/* Subtle Atmospheric Dust */}
        <Sparkles 
          count={40} 
          scale={10} 
          size={isDark ? 2 : 4} 
          speed={0.2} 
          opacity={isDark ? 0.2 : 0.1} 
          color={isDark ? "#818cf8" : "#6366f1"} 
        />
        
        <group position={[3.5, 0, 0]}>
          <PremiumCard 
            position={[0, 0, 0]} 
            rotation={[-0.05, -0.15, -0.02]} 
            scale={1.2} 
            isDark={isDark}
          />
        </group>
        
        <ContactShadows 
          position={[3.5, -3.5, 0]} 
          opacity={isDark ? 0.6 : 0.15} 
          scale={20} 
          blur={3} 
          far={10} 
          color={isDark ? "#000000" : "#64748b"} 
        />
      </Canvas>
    </div>
  );
};
