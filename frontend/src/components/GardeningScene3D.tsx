
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const GardeningPerson = () => {
  const groupRef = useRef<THREE.Group>(null);
  const armRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const { camera, gl, viewport } = useThree();

  // Convert screen coordinates to world coordinates
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
    document.body.style.userSelect = 'none';
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    gl.domElement.style.cursor = 'grab';
    document.body.style.userSelect = '';
    setTargetPosition({ x: 0, y: 0 });
  };

  // Global event listeners for dragging
  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (isDragging) {
        const rect = gl.domElement.getBoundingClientRect();
        const relativeX = event.clientX - rect.left;
        const relativeY = event.clientY - rect.top;
        
        const worldPos = screenToWorld(relativeX, relativeY);
        setDragPosition(worldPos);
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
    if (groupRef.current) {
      if (isDragging) {
        groupRef.current.position.x = dragPosition.x;
        groupRef.current.position.y = dragPosition.y;
      } else {
        const returnSpeed = 0.05;
        groupRef.current.position.x = THREE.MathUtils.lerp(
          groupRef.current.position.x,
          targetPosition.x,
          returnSpeed
        );
        groupRef.current.position.y = THREE.MathUtils.lerp(
          groupRef.current.position.y,
          targetPosition.y + Math.sin(state.clock.elapsedTime * 0.8) * 0.05,
          returnSpeed
        );
        
        // Gentle swaying when not dragging
        groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
      }
    }

    // Animate planting arm movement
    if (armRef.current) {
      armRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.5) * 0.3 - 0.3;
    }
  });

  return (
    <group 
      ref={groupRef}
      onPointerDown={handlePointerDown}
      onPointerOver={() => gl.domElement.style.cursor = 'grab'}
      onPointerOut={() => gl.domElement.style.cursor = 'default'}
      scale={0.8}
    >
      {/* Ground/Grass Base */}
      <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 2.5]} />
        <meshStandardMaterial color="#4ade80" />
      </mesh>

      {/* Person's Body - More realistic proportions */}
      <group position={[0, -0.3, 0]}>
        {/* Head - More realistic */}
        <mesh position={[0, 1.0, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#fdbcbc" />
        </mesh>

        {/* Hair */}
        <mesh position={[0, 1.1, 0]}>
          <sphereGeometry args={[0.16, 12, 12]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>

        {/* Torso - More realistic shape */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.18, 0.22, 0.6, 12]} />
          <meshStandardMaterial color="#22c55e" />
        </mesh>

        {/* Left Arm */}
        <mesh position={[-0.3, 0.6, 0]} rotation={[0, 0, 0.4]}>
          <cylinderGeometry args={[0.06, 0.06, 0.45, 12]} />
          <meshStandardMaterial color="#fdbcbc" />
        </mesh>

        {/* Right Arm - Planting motion */}
        <group ref={armRef} position={[0.3, 0.6, 0]} rotation={[0, 0, -0.4]}>
          <mesh>
            <cylinderGeometry args={[0.06, 0.06, 0.45, 12]} />
            <meshStandardMaterial color="#fdbcbc" />
          </mesh>

          {/* Hand holding small plant/seedling */}
          <group position={[0, -0.3, 0]}>
            <mesh>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color="#fdbcbc" />
            </mesh>
            
            {/* Small seedling being planted */}
            <group position={[0, -0.1, 0]}>
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.02, 0.015, 0.1, 6]} />
                <meshStandardMaterial color="#a16207" />
              </mesh>
              <mesh position={[0, 0.06, 0]}>
                <sphereGeometry args={[0.03, 6, 6]} />
                <meshStandardMaterial color="#22c55e" />
              </mesh>
              {/* Tiny leaves */}
              <mesh position={[-0.02, 0.07, 0]} rotation={[0, 0, -0.5]}>
                <planeGeometry args={[0.04, 0.02]} />
                <meshStandardMaterial color="#16a34a" side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0.02, 0.07, 0]} rotation={[0, 0, 0.5]}>
                <planeGeometry args={[0.04, 0.02]} />
                <meshStandardMaterial color="#16a34a" side={THREE.DoubleSide} />
              </mesh>
            </group>
          </group>
        </group>

        {/* Legs - More realistic */}
        <mesh position={[-0.12, -0.1, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.6, 12]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        <mesh position={[0.12, -0.1, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.6, 12]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>

        {/* Feet */}
        <mesh position={[-0.12, -0.5, 0.08]}>
          <boxGeometry args={[0.12, 0.05, 0.2]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
        <mesh position={[0.12, -0.5, 0.08]}>
          <boxGeometry args={[0.12, 0.05, 0.2]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
      </group>

      {/* Garden bed with planted vegetables */}
      <group position={[-0.8, -1.2, 0]}>
        {/* Soil bed */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.2, 0.1, 0.8]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>

        {/* Planted vegetables */}
        <group position={[-0.3, 0.1, 0]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.025, 0.12, 6]} />
            <meshStandardMaterial color="#a16207" />
          </mesh>
          <mesh position={[0, 0.08, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#22c55e" />
          </mesh>
        </group>

        <group position={[0.2, 0.1, 0]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.02, 0.1, 6]} />
            <meshStandardMaterial color="#a16207" />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <coneGeometry args={[0.05, 0.12, 6]} />
            <meshStandardMaterial color="#22c55e" />
          </mesh>
        </group>

        {/* Fresh planting hole */}
        <mesh position={[0.4, 0.05, 0]}>
          <cylinderGeometry args={[0.04, 0.035, 0.05, 8]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
      </group>

      {/* Garden tools */}
      <group position={[0.8, -1, 0]}>
        {/* Small shovel */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        <mesh position={[0.12, 0.15, 0]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.08, 0.12, 0.02]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
      </group>

      {/* Small flowers around the scene */}
      <group position={[0.6, -1.3, 0.4]}>
        <mesh>
          <cylinderGeometry args={[0.01, 0.01, 0.08, 6]} />
          <meshStandardMaterial color="#16a34a" />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
      </group>

      <group position={[-0.4, -1.3, 0.3]}>
        <mesh>
          <cylinderGeometry args={[0.01, 0.01, 0.06, 6]} />
          <meshStandardMaterial color="#16a34a" />
        </mesh>
        <mesh position={[0, 0.04, 0]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshStandardMaterial color="#ec4899" />
        </mesh>
      </group>
    </group>
  );
};

const GardeningScene3D = () => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 3.5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[8, 8, 8]} intensity={0.8} />
        <pointLight position={[-8, -8, -8]} intensity={0.3} color="#fbbf24" />
        <directionalLight position={[4, 4, 4]} intensity={0.7} />
        <GardeningPerson />
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  );
};

export default GardeningScene3D;
