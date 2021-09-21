import { useRef, useState, useEffect, Suspense } from 'react';
import classNames from 'classnames';
import { Vector2 } from 'three';
import { useSpring } from '@react-spring/core';
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
  const pause = !isInViewport || reduceMotion;
  const [rotation, setRotation] = useState();

  useSpring({
    from: {
      x: 0,
      y: 0,
    },
    to: rotation,
    config: {
      mass: 8,
      friction: 80,
    },
    pause,
    onChange({ value }) {
      if (!modelGroup.current) return;

      const { x, y } = value;
      modelGroup.current.rotation.x = x;
      modelGroup.current.rotation.y = y;

      invalidate();
    },
  });

  useEffect(() => {
    if (pause) return;

    const tempVector = new Vector2();

    const onMouseMove = ({ clientX, clientY }) => {
      const { innerWidth, innerHeight } = window;

      const position = {
        x: (clientX - innerWidth / 2) / innerWidth,
        y: (clientY - innerHeight / 2) / innerHeight,
      };

      tempVector.set(position.y / 2, position.x / 2);

      const { x, y } = tempVector;
      setRotation({ x, y });
    };

    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [pause]);

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
                pause={pause}
              />
            ))}
          </group>
        </Suspense>
      )}
    </Canvas>
  );
};

export default Model;
