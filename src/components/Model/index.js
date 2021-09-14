import { useRef, useEffect, Suspense } from 'react';
import classNames from 'classnames';
import { spring, value } from 'popmotion';
import { invalidate, Canvas } from '@react-three/fiber';
import Shadows from './Shadows';
import Device from './Device';
import { useInViewport, usePrefersReducedMotion } from 'hooks';
import { numToMs } from 'utils/style';
import './index.css';

const Model = ({
  models,
  show = true,
  showDelay = 0,
  cameraPosition = { x: 0, y: 0, z: 8 },
  style,
  className,
  alt,
  ...rest
}) => {
  const canvas = useRef();
  const modelGroup = useRef();
  const isInViewport = useInViewport(canvas, false, { threshold: 0.4 });
  const reduceMotion = usePrefersReducedMotion();
  const visible = show || isInViewport;

  // Handle mouse move animation
  useEffect(() => {
    let rotationSpring;
    let rotationSpringValue;

    const onMouseMove = event => {
      if (!modelGroup?.current) return;

      const { rotation } = modelGroup.current;
      const { innerWidth, innerHeight } = window;

      const position = {
        x: (event.clientX - innerWidth / 2) / innerWidth,
        y: (event.clientY - innerHeight / 2) / innerHeight,
      };

      if (!rotationSpringValue) {
        rotationSpringValue = value({ x: rotation.x, y: rotation.y }, ({ x, y }) => {
          rotation.set(x, y, rotation.z);
          invalidate();
        });
      }

      rotationSpring = spring({
        from: rotationSpringValue.get(),
        to: { x: position.y / 2, y: position.x / 2 },
        stiffness: 40,
        damping: 40,
        velocity: rotationSpringValue.getVelocity(),
        restSpeed: 0.00001,
        mass: 1.4,
      }).start(rotationSpringValue);
    };

    if (isInViewport && !reduceMotion) {
      window.addEventListener('mousemove', onMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      rotationSpring?.stop();
    };
  }, [isInViewport, reduceMotion]);

  return (
    <Canvas
      className={classNames('model', { 'model--visible': visible }, className)}
      style={{ '--delay': numToMs(showDelay), ...style }}
      ref={canvas}
      role="img"
      aria-label={alt}
      flat
      frameloop="demand"
      dpr={[1, 2]}
      gl={{ powerPreference: 'high-performance' }}
      camera={{
        fov: 36,
        near: 0.1,
        far: 100,
        position: [cameraPosition.x, cameraPosition.y, cameraPosition.z],
      }}
      onCreated={({ gl }) => (gl.physicallyCorrectLights = true)}
      {...rest}
    >
      <ambientLight intensity={1.2} />
      <directionalLight intensity={1.1} position={[0.5, 0, 0.866]} />
      <directionalLight intensity={0.8} position={[0, 0, 2]} />
      <Shadows />
      {visible && (
        <Suspense fallback={null}>
          <group ref={modelGroup}>
            {models.map((model, index) => (
              <Device
                key={`device-${index}`}
                model={model}
                index={index}
                showDelay={showDelay}
                reduceMotion={reduceMotion}
              />
            ))}
          </group>
        </Suspense>
      )}
    </Canvas>
  );
};

export default Model;
