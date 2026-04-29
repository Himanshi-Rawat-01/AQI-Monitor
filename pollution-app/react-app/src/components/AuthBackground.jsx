import Beams from './Beams';

export default function AuthBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        width: '100vw',
        height: '100vh',
        background: '#000',   /* base black — shows through transparent canvas */
      }}
    >
      <Beams
        beamWidth={3}
        beamHeight={30}
        beamNumber={15}
        lightColor="#ffffff"
        speed={2}
        noiseIntensity={1.75}
        scale={0.2}
        rotation={30}
      />
    </div>
  );
}
