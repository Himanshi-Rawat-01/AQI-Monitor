import ColorBends from './ColorBends';

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
      <ColorBends
        colors={["#ffffff", "#d0d0d0", "#a0a0a0", "#e8e8e8"]}
        rotation={90}
        speed={0.2}
        scale={1}
        frequency={1}
        warpStrength={1}
        mouseInfluence={1}
        noise={0.15}
        parallax={0.5}
        iterations={1}
        intensity={1.5}
        bandWidth={6}
        transparent
        autoRotate={0}
      />
    </div>
  );
}
