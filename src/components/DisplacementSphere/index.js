import { useState, useRef, useEffect, useCallback } from 'react';
import classNames from 'classnames';
import { Transition } from 'react-transition-group';
import { Vector2, UniformsUtils, UniformsLib } from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useSpring } from '@react-spring/core';
import { useTheme } from 'components/ThemeProvider';
import { usePrefersReducedMotion, useInViewport } from 'hooks';
import { reflow } from 'utils/transition';
import { media } from 'utils/style';
import vertexShader from './sphereVert.glsl';
import fragmentShader from './sphereFrag.glsl';
import './index.css';

const Sphere = ({ isInViewport, reduceMotion }) => {
  const { size, invalidate } = useThree();
  const [rotation, setRotation] = useState();
  const sphere = useRef();
  const uniforms = useRef();
  const pause = !isInViewport || reduceMotion;

  useSpring({
    from: {
      x: 0,
      y: 0,
    },
    to: rotation,
    config: {
      mass: 8,
      friction: 100,
    },
    pause,
    onChange({ value }) {
      const { x, y } = value;
      sphere.current.rotation.x = x;
      sphere.current.rotation.y = y;

      invalidate();
    },
  });

  useEffect(() => {
    if (pause) return;

    const tempVector = new Vector2();

    const onMouseMove = ({ clientY, clientX }) => {
      const { innerWidth, innerHeight } = window;

      const position = {
        x: clientX / innerWidth,
        y: clientY / innerHeight,
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

  useEffect(() => {
    if (size.width <= media.mobile) {
      sphere.current.position.x = 14;
      sphere.current.position.y = 10;
    } else if (size.width <= media.tablet) {
      sphere.current.position.x = 18;
      sphere.current.position.y = 14;
    } else {
      sphere.current.position.x = 22;
      sphere.current.position.y = 16;
    }

    if (reduceMotion) invalidate();
  }, [size.width, reduceMotion, invalidate]);

  useFrame(state => {
    if (reduceMotion) return;

    const time = state.clock.getElapsedTime();

    if (uniforms.current !== undefined) {
      uniforms.current.time.value = time / 20;
    }

    sphere.current.rotation.z = time / 25;
  });

  const onBeforeCompile = useCallback(
    shader => {
      uniforms.current = UniformsUtils.merge([
        UniformsLib['ambient'],
        UniformsLib['lights'],
        shader.uniforms,
        { time: { type: 'f', value: 0 } },
      ]);

      shader.uniforms = uniforms.current;
      shader.vertexShader = vertexShader;
      shader.fragmentShader = fragmentShader;

      if (reduceMotion) invalidate();
    },
    [reduceMotion, invalidate]
  );

  return (
    <mesh ref={sphere}>
      <sphereGeometry args={[32, 128, 128]} />
      <meshPhongMaterial onBeforeCompile={onBeforeCompile} />
    </mesh>
  );
};

const DisplacementSphere = props => {
  const { themeId } = useTheme();
  const container = useRef();
  const isInViewport = useInViewport(container);
  const reduceMotion = usePrefersReducedMotion();

  return (
    <Transition appear in onEnter={reflow} timeout={3000}>
      {status => (
        <Canvas
          aria-hidden
          ref={container}
          frameloop={reduceMotion ? 'demand' : 'always'}
          className={classNames('displacement-sphere', `displacement-sphere--${status}`)}
          dpr={[1, 2]}
          gl={{ powerPreference: 'high-performance' }}
          camera={{ fov: 54, near: 0.1, far: 100, position: [0, 0, 52] }}
          style={{ position: 'absolute', width: '100vw', height: '130vh' }}
          {...props}
        >
          <directionalLight intensity={0.6} position={[100, 100, 200]} />
          <ambientLight intensity={themeId === 'light' ? 0.8 : 0.1} />
          <Sphere isInViewport={isInViewport} reduceMotion={reduceMotion} />
        </Canvas>
      )}
    </Transition>
  );
};

export default DisplacementSphere;
