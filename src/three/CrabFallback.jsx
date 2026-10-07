/**
 * The procedural crab. This is the fallback that shows until the supplied
 * crab.glb has loaded, and stays in place if that file can never be fetched.
 * It is built from primitives so it costs nothing to download.
 */

// A leg reaches out and down. The cylinder is built along +Y, so this is the
// rotation about Z that lays it along (0.80, -0.60, 0).
const LEG_TILT = -2.214;
const LEG_LEN = 0.52;

const LEGS = [
  { side: -1, z: 0.24 },
  { side: -1, z: 0.0 },
  { side: -1, z: -0.24 },
  { side: 1, z: 0.24 },
  { side: 1, z: 0.0 },
  { side: 1, z: -0.24 },
];

export default function CrabFallback({ shell, limb, eye, legs, claws }) {
  return (
    <>
      {/* shell */}
      <mesh position={[0, 0.2, 0]} scale={[0.46, 0.27, 0.56]} material={shell}>
        <sphereGeometry args={[1, 22, 16]} />
      </mesh>
      {/* two small humps, so it reads as a carapace and not a pebble */}
      <mesh position={[0, 0.36, 0.08]} scale={[0.2, 0.09, 0.2]} material={shell}>
        <sphereGeometry args={[1, 12, 10]} />
      </mesh>
      <mesh position={[0, 0.34, -0.1]} scale={[0.24, 0.08, 0.18]} material={shell}>
        <sphereGeometry args={[1, 12, 10]} />
      </mesh>

      {/* eyes on stalks */}
      {[-1, 1].map((s) => (
        <group key={`eye-${s}`} position={[s * 0.11, 0.26, 0.22]}>
          <mesh position={[0, 0.05, 0]} material={limb}>
            <cylinderGeometry args={[0.011, 0.013, 0.1, 5]} />
          </mesh>
          <mesh position={[0, 0.11, 0]} material={eye}>
            <sphereGeometry args={[0.027, 8, 6]} />
          </mesh>
        </group>
      ))}

      {/* legs */}
      {LEGS.map((leg, i) => (
        <group
          key={`leg-${i}`}
          position={[leg.side * 0.3, 0.16, leg.z]}
          rotation={[0, leg.side > 0 ? 0 : Math.PI, 0]}
        >
          <group ref={(el) => (legs.current[i] = el)}>
            <mesh
              position={[0.208, -0.156, 0]}
              rotation={[0, 0, LEG_TILT]}
              material={limb}
            >
              <cylinderGeometry args={[0.017, 0.026, LEG_LEN, 6]} />
            </mesh>
          </group>
        </group>
      ))}

      {/* claws: an arm reaching forward, then an open pincer */}
      {[-1, 1].map((s, i) => (
        <group
          key={`claw-${s}`}
          position={[s * 0.24, 0.16, 0.28]}
          rotation={[1.94, 0, 0]}
        >
          <group ref={(el) => (claws.current[i] = el)}>
            <mesh position={[0, 0.15, 0]} material={limb}>
              <cylinderGeometry args={[0.024, 0.032, 0.3, 6]} />
            </mesh>
            <group position={[0, 0.3, 0]}>
              <mesh scale={[0.075, 0.06, 0.085]} material={shell}>
                <sphereGeometry args={[1, 10, 8]} />
              </mesh>
              <mesh position={[0.05, 0.03, 0]} rotation={[0.2, 0, -0.3]} material={shell}>
                <coneGeometry args={[0.026, 0.15, 6]} />
              </mesh>
              <mesh position={[-0.05, 0.03, 0]} rotation={[0.2, 0, 0.3]} material={shell}>
                <coneGeometry args={[0.026, 0.15, 6]} />
              </mesh>
            </group>
          </group>
        </group>
      ))}
    </>
  );
}
