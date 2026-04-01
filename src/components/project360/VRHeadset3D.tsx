import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

interface HeadsetProps {
  onLanded: () => void;
}

const VRHeadset = ({ onLanded }: HeadsetProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [landed, setLanded] = useState(false);
  const startTime = useRef(Date.now());
  const landedTime = useRef<number | null>(null);
  const hasCalledLanded = useRef(false);

  const lagoonColor = useMemo(() => new THREE.Color("hsl(163, 88%, 56%)"), []);
  const bodyColor = useMemo(() => new THREE.Color("#1a1a2e"), []);
  const darkColor = useMemo(() => new THREE.Color("#0d0d1a"), []);
  const lensColor = useMemo(() => new THREE.Color("#050510"), []);

  useFrame(() => {
    if (!groupRef.current) return;
    const elapsed = (Date.now() - startTime.current) / 1000;

    if (!landed) {
      const fallDuration = 1.8;
      const t = Math.min(elapsed / fallDuration, 1);
      // Smooth ease-out cubic
      const ease = 1 - Math.pow(1 - t, 4);
      const startY = 4;
      const endY = 0;
      groupRef.current.position.y = startY + (endY - startY) * ease;

      groupRef.current.rotation.x = (1 - ease) * 0.1;
      groupRef.current.rotation.z = (1 - ease) * -0.03;

      if (t >= 1 && !hasCalledLanded.current) {
        setLanded(true);
        landedTime.current = Date.now();
        hasCalledLanded.current = true;
        groupRef.current.position.y = endY;
        onLanded();
      }
    }
  });

  // Smoothly ramp up float intensity after landing
  const floatRamp = landed && landedTime.current
    ? Math.min((Date.now() - landedTime.current) / 800, 1)
    : 0;

  return (
    <Float speed={1.5} rotationIntensity={0.15 * floatRamp} floatIntensity={0.3 * floatRamp}>
      <group ref={groupRef} position={[0, 4, 0]} scale={1.1}>
        <RoundedBox args={[2.6, 1.2, 1.1]} radius={0.25} smoothness={8} position={[0, 0, 0]}>
          <meshStandardMaterial color={bodyColor} roughness={0.35} metalness={0.6} />
        </RoundedBox>
        <RoundedBox args={[2.65, 1.22, 0.15]} radius={0.2} smoothness={6} position={[0, 0, -0.55]}>
          <meshStandardMaterial color={darkColor} roughness={0.2} metalness={0.8} />
        </RoundedBox>
        <mesh position={[-0.5, 0, -0.63]}><circleGeometry args={[0.32, 32]} /><meshStandardMaterial color={lensColor} roughness={0.1} metalness={1} /></mesh>
        <mesh position={[0.5, 0, -0.63]}><circleGeometry args={[0.32, 32]} /><meshStandardMaterial color={lensColor} roughness={0.1} metalness={1} /></mesh>
        <mesh position={[-0.5, 0, -0.62]}><ringGeometry args={[0.3, 0.36, 32]} /><meshStandardMaterial color={lagoonColor} emissive={lagoonColor} emissiveIntensity={landed ? 0.8 : 0} roughness={0.3} metalness={0.7} /></mesh>
        <mesh position={[0.5, 0, -0.62]}><ringGeometry args={[0.3, 0.36, 32]} /><meshStandardMaterial color={lagoonColor} emissive={lagoonColor} emissiveIntensity={landed ? 0.8 : 0} roughness={0.3} metalness={0.7} /></mesh>
        <RoundedBox args={[1.8, 0.04, 0.5]} radius={0.02} smoothness={4} position={[0, 0.62, -0.2]}>
          <meshStandardMaterial color={lagoonColor} emissive={lagoonColor} emissiveIntensity={landed ? 0.5 : 0} roughness={0.3} />
        </RoundedBox>
        <RoundedBox args={[0.15, 0.6, 2.2]} radius={0.07} smoothness={4} position={[-1.35, 0.1, 0.4]}>
          <meshStandardMaterial color={darkColor} roughness={0.6} metalness={0.3} />
        </RoundedBox>
        <RoundedBox args={[0.15, 0.6, 2.2]} radius={0.07} smoothness={4} position={[1.35, 0.1, 0.4]}>
          <meshStandardMaterial color={darkColor} roughness={0.6} metalness={0.3} />
        </RoundedBox>
        <RoundedBox args={[0.8, 0.08, 2.6]} radius={0.04} smoothness={4} position={[0, 0.65, 0.5]}>
          <meshStandardMaterial color={darkColor} roughness={0.6} metalness={0.3} />
        </RoundedBox>
        <mesh position={[0, -0.5, -0.3]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[0.5, 0.3, 0.6]} /><meshStandardMaterial color={bodyColor} roughness={0.5} />
        </mesh>
        <RoundedBox args={[2.4, 1.0, 0.2]} radius={0.15} smoothness={4} position={[0, 0, 0.55]}>
          <meshStandardMaterial color={"#111122"} roughness={0.9} metalness={0.0} />
        </RoundedBox>
      </group>
    </Float>
  );
};

interface VRHeadset3DProps {
  onLanded: () => void;
}

const VRHeadset3D = ({ onLanded }: VRHeadset3DProps) => {
  return (
    <Canvas camera={{ position: [0, 0.5, 4.5], fov: 45 }} dpr={[1, 1.5]}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 5, 5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-2, -1, 3]} intensity={0.3} color="hsl(163, 88%, 56%)" />
      <Environment preset="night" />
      <VRHeadset onLanded={onLanded} />
    </Canvas>
  );
};

export default VRHeadset3D;
