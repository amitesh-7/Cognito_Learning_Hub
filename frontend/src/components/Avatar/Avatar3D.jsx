import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

/**
 * 3D Avatar Component
 * Customizable 3D character with colors, accessories, and animations
 */

// Head component with face features
const Head = ({ skinColor, eyeColor, hairColor, hairStyle, expression }) => {
  const headRef = useRef();

  // Subtle breathing animation
  useFrame((state) => {
    if (headRef.current) {
      headRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return (
    <group ref={headRef} position={[0, 1.5, 0]}>
      {/* Head sphere */}
      <mesh castShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.15, 0.1, 0.4]} castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0.15, 0.1, 0.4]} castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Pupils */}
      <mesh position={[-0.15, 0.1, 0.48]} castShadow>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color={eyeColor} />
      </mesh>
      <mesh position={[0.15, 0.1, 0.48]} castShadow>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color={eyeColor} />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 0, 0.5]} castShadow>
        <coneGeometry args={[0.08, 0.15, 8]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>

      {/* Mouth based on expression */}
      {expression === "happy" && (
        <mesh position={[0, -0.15, 0.45]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.15, 0.03, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      )}
      {expression === "neutral" && (
        <mesh position={[0, -0.2, 0.45]}>
          <boxGeometry args={[0.25, 0.03, 0.03]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      )}
      {expression === "surprised" && (
        <mesh position={[0, -0.15, 0.45]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      )}

      {/* Hair */}
      {hairStyle === "short" && (
        <mesh position={[0, 0.3, 0]} castShadow>
          <sphereGeometry
            args={[0.52, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]}
          />
          <meshStandardMaterial color={hairColor} />
        </mesh>
      )}
      {hairStyle === "spiky" && (
        <>
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * 0.3, 0.5, Math.sin(angle) * 0.3]}
                rotation={[0, 0, angle]}
                castShadow
              >
                <coneGeometry args={[0.1, 0.4, 8]} />
                <meshStandardMaterial color={hairColor} />
              </mesh>
            );
          })}
        </>
      )}
      {hairStyle === "long" && (
        <>
          <mesh position={[0, 0.3, 0]} castShadow>
            <sphereGeometry
              args={[0.52, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]}
            />
            <meshStandardMaterial color={hairColor} />
          </mesh>
          <mesh position={[-0.4, 0.5, 0]} castShadow>
            <capsuleGeometry args={[0.1, 0.8, 8, 16]} />
            <meshStandardMaterial color={hairColor} />
          </mesh>
          <mesh position={[0.4, 0.5, 0]} castShadow>
            <capsuleGeometry args={[0.1, 0.8, 8, 16]} />
            <meshStandardMaterial color={hairColor} />
          </mesh>
        </>
      )}
    </group>
  );
};

// Body component
const Body = ({ skinColor, shirtColor }) => {
  return (
    <group position={[0, 0.7, 0]}>
      {/* Torso */}
      <mesh castShadow>
        <capsuleGeometry args={[0.4, 0.8, 8, 16]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.5, 0, 0]} rotation={[0, 0, 0.3]} castShadow>
        <capsuleGeometry args={[0.12, 0.7, 8, 16]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>
      <mesh position={[0.5, 0, 0]} rotation={[0, 0, -0.3]} castShadow>
        <capsuleGeometry args={[0.12, 0.7, 8, 16]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>

      {/* Hands */}
      <mesh position={[-0.5, -0.5, 0]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      <mesh position={[0.5, -0.5, 0]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
    </group>
  );
};

// Legs component
const Legs = ({ pantsColor }) => {
  return (
    <group position={[0, -0.1, 0]}>
      {/* Left leg */}
      <mesh position={[-0.2, -0.5, 0]} castShadow>
        <capsuleGeometry args={[0.15, 0.8, 8, 16]} />
        <meshStandardMaterial color={pantsColor} />
      </mesh>

      {/* Right leg */}
      <mesh position={[0.2, -0.5, 0]} castShadow>
        <capsuleGeometry args={[0.15, 0.8, 8, 16]} />
        <meshStandardMaterial color={pantsColor} />
      </mesh>

      {/* Shoes */}
      <mesh position={[-0.2, -1, 0.1]} castShadow>
        <boxGeometry args={[0.2, 0.15, 0.35]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>
      <mesh position={[0.2, -1, 0.1]} castShadow>
        <boxGeometry args={[0.2, 0.15, 0.35]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>
    </group>
  );
};

// Accessories component
const Accessories = ({ glasses, hat }) => {
  return (
    <group>
      {/* Glasses */}
      {glasses && (
        <group position={[0, 1.55, 0.45]}>
          <mesh position={[-0.15, 0, 0]}>
            <torusGeometry args={[0.12, 0.02, 8, 16]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <mesh position={[0.15, 0, 0]}>
            <torusGeometry args={[0.12, 0.02, 8, 16]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.015, 0.1, 8, 8]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </group>
      )}

      {/* Hat */}
      {hat === "cap" && (
        <group position={[0, 2, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.4, 0.4, 0.15, 32]} />
            <meshStandardMaterial color="#E74C3C" />
          </mesh>
          <mesh
            position={[0, 0, 0.4]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
          >
            <cylinderGeometry args={[0.4, 0.3, 0.02, 32]} />
            <meshStandardMaterial color="#E74C3C" />
          </mesh>
        </group>
      )}
      {hat === "beanie" && (
        <mesh position={[0, 2.1, 0]} castShadow>
          <sphereGeometry
            args={[0.45, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.5]}
          />
          <meshStandardMaterial color="#9B59B6" />
        </mesh>
      )}
    </group>
  );
};

// Complete Avatar Model
const AvatarModel = ({ config, animate = true }) => {
  const groupRef = useRef();

  // Rotation animation
  useFrame((state) => {
    if (groupRef.current && animate) {
      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <Head
        skinColor={config.skinColor}
        eyeColor={config.eyeColor}
        hairColor={config.hairColor}
        hairStyle={config.hairStyle}
        expression={config.expression}
      />
      <Body skinColor={config.skinColor} shirtColor={config.shirtColor} />
      <Legs pantsColor={config.pantsColor} />
      <Accessories glasses={config.glasses} hat={config.hat} />
    </group>
  );
};

// Main Avatar3D Component
const Avatar3D = ({
  config = {
    skinColor: "#FFD6A5",
    eyeColor: "#2C3E50",
    hairColor: "#8B4513",
    hairStyle: "short",
    shirtColor: "#3498DB",
    pantsColor: "#2C3E50",
    expression: "happy",
    glasses: false,
    hat: null,
  },
  width = "100%",
  height = "400px",
  animate = true,
  className = "",
}) => {
  return (
    <div className={className} style={{ width, height }}>
      <Canvas shadows>
        {/* Camera */}
        <PerspectiveCamera makeDefault position={[0, 1, 4]} />

        {/* Lights */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-5, 3, -5]} intensity={0.5} />

        {/* Avatar */}
        <AvatarModel config={config} animate={animate} />

        {/* Ground */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -1.1, 0]}
          receiveShadow
        >
          <planeGeometry args={[10, 10]} />
          <shadowMaterial opacity={0.3} />
        </mesh>

        {/* Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={2}
          maxDistance={6}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
};

export default Avatar3D;
