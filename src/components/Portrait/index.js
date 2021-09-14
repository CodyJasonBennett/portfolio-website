import { useState, useRef, useEffect, Suspense } from 'react';
import classNames from 'classnames';
import { RectAreaLight } from 'three';
import { useThree, Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { spring, value } from 'popmotion';
import { useTheme } from 'components/ThemeProvider';
import { useInViewport, usePrefersReducedMotion } from 'hooks';
import portraitModelPath from 'assets/portrait.glb';
import './index.css';

RectAreaLightUniformsLib.init();

const RectLight = ({ args, ...rest }) => {
  const [light] = useState(() => new RectAreaLight(...args));

  useEffect(() => void light.lookAt(0, 0, 0), [light]);

  return <primitive object={light} {...rest} />;
};

const Model = ({ isInViewport, reduceMotion }) => {
  const { scene, invalidate } = useThree();
  const gltf = useGLTF(portraitModelPath);

  // Handle mouse move animation
  useEffect(() => {
    let rotationSpring;
    let rotationSpringValue;

    const onMouseMove = event => {
      const { rotation } = scene;
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

    return function cleanup() {
      window.removeEventListener('mousemove', onMouseMove);

      rotationSpring?.stop();
    };
  }, [scene, invalidate, isInViewport, reduceMotion]);

  return <primitive object={gltf.scene} position={[0, -1.6, 0]} />;
};

const Portrait = ({ className, delay, ...rest }) => {
  const { themeId } = useTheme();
  const [loaded, setLoaded] = useState();
  const canvas = useRef();
  const isInViewport = useInViewport(canvas);
  const reduceMotion = usePrefersReducedMotion();

  const Loader = () => {
    useEffect(() => {
      return () => setLoaded(true);
    }, []);
    return null;
  };

  useEffect(() => void (canvas.current.parentNode.style = `--delay: ${delay}`), [delay]);

  return (
    <Canvas
      className={classNames('portrait', className)}
      ref={canvas}
      role="img"
      aria-label="A 3D portrait of myself."
      frameloop="demand"
      dpr={[1, 2]}
      gl={{ powerPreference: 'high-performance' }}
      camera={{ fov: 45, near: 0.5, far: 2.25, position: [0, 0, 0.8] }}
      {...rest}
    >
      <ambientLight intensity={themeId === 'dark' ? 0.1 : 0.2} />
      <RectLight args={[0xffffff, 6, 10, 10]} position={[4.5, -1.3, -3]} />
      <RectLight args={[0xffffff, 6, 15, 15]} position={[-10, 0.7, -10]} />
      {(isInViewport || loaded) && (
        <Suspense fallback={<Loader />}>
          <Model isInViewport={isInViewport} reduceMotion={reduceMotion} />
        </Suspense>
      )}
    </Canvas>
  );
};

export default Portrait;
