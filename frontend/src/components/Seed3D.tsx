
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const SucculentPlant = () => {
  const plantRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const { camera, gl, viewport } = useThree();

  const screenToWorld = (screenX: number, screenY: number) => {
    const x = (screenX / gl.domElement.clientWidth) * 2 - 1;
    const y = -(screenY / gl.domElement.clientHeight) * 2 + 1;
    
    const worldX = x * (viewport.width / 2);
    const worldY = y * (viewport.height / 2);
    
    return { x: worldX, y: worldY };
  };

  const handlePointerDown = (event: any) => {
    event.stopPropagation();
    setIsDragging(true);
    gl.domElement.style.cursor = 'grabbing';
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    gl.domElement.style.cursor = 'grab';
    setTargetPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (isDragging) {
        const rect = gl.domElement.getBoundingClientRect();
        const relativeX = event.clientX - rect.left;
        const relativeY = event.clientY - rect.top;
        
        const worldPos = screenToWorld(relativeX, relativeY);
        setTargetPosition(worldPos);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handlePointerUp();
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, gl.domElement]);

  useFrame((state) => {
    if (plantRef.current) {
      if (isDragging) {
        plantRef.current.position.x = targetPosition.x;
        plantRef.current.position.y = targetPosition.y;
      } else {
        const returnSpeed = 0.05;
        plantRef.current.position.x = THREE.MathUtils.lerp(
          plantRef.current.position.x,
          Math.sin(state.clock.elapsedTime * 0.3) * 0.05,
          returnSpeed
        );
        plantRef.current.position.y = THREE.MathUtils.lerp(
          plantRef.current.position.y,
          Math.sin(state.clock.elapsedTime * 0.5) * 0.03,
          returnSpeed
        );
      }
      
      // Gentle rotation
      plantRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.03;
      
      // Animate leaves - subtle swaying
      plantRef.current.children.forEach((child, index) => {
        if (child.userData.isLeaf) {
          const time = state.clock.elapsedTime + index * 0.3;
          const windStrength = 0.02;
          
          child.rotation.z = Math.sin(time * 1.5) * windStrength;
          child.position.y += Math.sin(time * 2) * 0.001;
          
          const scale = 1 + Math.sin(time * 1.2) * 0.01;
          child.scale.set(scale, scale, scale);
        }
      });
    }
  });

  // White ceramic pot
  const Pot = () => (
    <group>
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.18, 0.15, 0.25, 16]} />
        <meshStandardMaterial color="#f8f8f8" roughness={0.2} metalness={0.1} />
      </mesh>
      
      {/* Soil */}
      <mesh position={[0, -0.28, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.02, 16]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
    </group>
  );

  // Succulent leaf component
  const SucculentLeaf = ({ 
    position, 
    rotation, 
    scale = 1, 
    color = "#4ade80" 
  }: { 
    position: [number, number, number], 
    rotation: [number, number, number],
    scale?: number,
    color?: string
  }) => (
    <mesh position={position} rotation={rotation} scale={scale} userData={{ isLeaf: true }}>
      <sphereGeometry args={[0.06, 8, 6]} />
      <meshStandardMaterial 
        color={color} 
        roughness={0.4}
        metalness={0.1}
      />
    </mesh>
  );

  // Central stem
  const Stem = () => (
    <mesh position={[0, -0.15, 0]}>
      <cylinderGeometry args={[0.015, 0.02, 0.15, 8]} />
      <meshStandardMaterial color="#22c55e" roughness={0.6} />
    </mesh>
  );

  return (
    <group 
      ref={plantRef}
      onPointerDown={handlePointerDown}
      onPointerOver={() => gl.domElement.style.cursor = 'grab'}
      onPointerOut={() => gl.domElement.style.cursor = 'default'}
    >
      <Pot />
      <Stem />
      
      {/* Bottom layer of leaves */}
      <SucculentLeaf position={[0.08, -0.12, 0]} rotation={[0, 0, 0.3]} scale={1.2} color="#22c55e" />
      <SucculentLeaf position={[-0.08, -0.12, 0]} rotation={[0, 0, -0.3]} scale={1.2} color="#22c55e" />
      <SucculentLeaf position={[0, -0.12, 0.08]} rotation={[0.3, 0, 0]} scale={1.2} color="#22c55e" />
      <SucculentLeaf position={[0, -0.12, -0.08]} rotation={[-0.3, 0, 0]} scale={1.2} color="#22c55e" />
      <SucculentLeaf position={[0.06, -0.12, 0.06]} rotation={[0.2, 0, 0.2]} scale={1.1} color="#22c55e" />
      <SucculentLeaf position={[-0.06, -0.12, 0.06]} rotation={[0.2, 0, -0.2]} scale={1.1} color="#22c55e" />
      <SucculentLeaf position={[0.06, -0.12, -0.06]} rotation={[-0.2, 0, 0.2]} scale={1.1} color="#22c55e" />
      <SucculentLeaf position={[-0.06, -0.12, -0.06]} rotation={[-0.2, 0, -0.2]} scale={1.1} color="#22c55e" />
      
      {/* Second layer */}
      <SucculentLeaf position={[0.06, -0.05, 0]} rotation={[0, 0, 0.4]} scale={1.0} color="#4ade80" />
      <SucculentLeaf position={[-0.06, -0.05, 0]} rotation={[0, 0, -0.4]} scale={1.0} color="#4ade80" />
      <SucculentLeaf position={[0, -0.05, 0.06]} rotation={[0.4, 0, 0]} scale={1.0} color="#4ade80" />
      <SucculentLeaf position={[0, -0.05, -0.06]} rotation={[-0.4, 0, 0]} scale={1.0} color="#4ade80" />
      <SucculentLeaf position={[0.04, -0.05, 0.04]} rotation={[0.3, 0, 0.3]} scale={0.9} color="#4ade80" />
      <SucculentLeaf position={[-0.04, -0.05, 0.04]} rotation={[0.3, 0, -0.3]} scale={0.9} color="#4ade80" />
      <SucculentLeaf position={[0.04, -0.05, -0.04]} rotation={[-0.3, 0, 0.3]} scale={0.9} color="#4ade80" />
      <SucculentLeaf position={[-0.04, -0.05, -0.04]} rotation={[-0.3, 0, -0.3]} scale={0.9} color="#4ade80" />
      
      {/* Third layer */}
      <SucculentLeaf position={[0.04, 0.02, 0]} rotation={[0, 0, 0.5]} scale={0.8} color="#65e690" />
      <SucculentLeaf position={[-0.04, 0.02, 0]} rotation={[0, 0, -0.5]} scale={0.8} color="#65e690" />
      <SucculentLeaf position={[0, 0.02, 0.04]} rotation={[0.5, 0, 0]} scale={0.8} color="#65e690" />
      <SucculentLeaf position={[0, 0.02, -0.04]} rotation={[-0.5, 0, 0]} scale={0.8} color="#65e690" />
      <SucculentLeaf position={[0.03, 0.02, 0.03]} rotation={[0.4, 0, 0.4]} scale={0.7} color="#65e690" />
      <SucculentLeaf position={[-0.03, 0.02, 0.03]} rotation={[0.4, 0, -0.4]} scale={0.7} color="#65e690" />
      
      {/* Top layer */}
      <SucculentLeaf position={[0.02, 0.08, 0]} rotation={[0, 0, 0.6]} scale={0.6} color="#86efac" />
      <SucculentLeaf position={[-0.02, 0.08, 0]} rotation={[0, 0, -0.6]} scale={0.6} color="#86efac" />
      <SucculentLeaf position={[0, 0.08, 0.02]} rotation={[0.6, 0, 0]} scale={0.6} color="#86efac" />
      <SucculentLeaf position={[0, 0.08, -0.02]} rotation={[-0.6, 0, 0]} scale={0.6} color="#86efac" />
      
      {/* Center top leaf */}
      <SucculentLeaf position={[0, 0.12, 0]} rotation={[0, 0, 0]} scale={0.5} color="#bbf7d0" />
    </group>
  );
};

const Seed3D = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Canvas camera={{ position: [0, 0.2, 1], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
        <pointLight position={[-3, 3, -3]} intensity={0.4} color="#86efac" />
        <directionalLight position={[2, 4, 2]} intensity={0.7} castShadow />
        <group position={[0, 0.15, 0]}>
          <SucculentPlant />
        </group>
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  );
};

export default Seed3D;
