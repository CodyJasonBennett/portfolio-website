import { useRef, useEffect } from 'react';
import classNames from 'classnames';
import { Transition } from 'react-transition-group';
import { UniformsUtils, UniformsLib } from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { spring, value } from 'popmotion';
import { useTheme } from 'components/ThemeProvider';
import { usePrefersReducedMotion, useInViewport } from 'hooks';
import { reflow } from 'utils/transition';
import { media } from 'utils/style';
import { vertexShader, fragmentShader } from './sphereShader';
import './index.css';

const Sphere = ({ isInViewport, reduceMotion }) => {
  const { size, invalidate } = useThree();
  const sphere = useRef();
  const tweenRef = useRef();
  const sphereSpring = useRef();
  const uniforms = useRef();

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

  useEffect(() => {
    if (!isInViewport || reduceMotion) return;

    const onMouseMove = event => {
      const { rotation } = sphere.current;

      const position = {
        x: event.clientX / window.innerWidth,
        y: event.clientY / window.innerHeight,
      };

      if (!sphereSpring.current) {
        sphereSpring.current = value(rotation.toArray(), values => {
          rotation.set(values[0], values[1], sphere.current.rotation.z);
        });
      }

      tweenRef.current = spring({
        from: sphereSpring.current.get(),
        to: [position.y / 2, position.x / 2],
        stiffness: 30,
        damping: 20,
        velocity: sphereSpring.current.getVelocity(),
        mass: 2,
        restSpeed: 0.0001,
      }).start(sphereSpring.current);
    };

    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      tweenRef.current?.stop();
    };
  }, [isInViewport, reduceMotion]);

  useFrame(state => {
    if (reduceMotion) return;

    const time = state.clock.getElapsedTime();

    if (uniforms.current !== undefined) {
      uniforms.current.time.value = time / 20;
    }

    sphere.current.rotation.z = time / 25;
  });

  return (
    <mesh ref={sphere}>
      <sphereGeometry args={[32, 128, 128]} />
      <meshPhongMaterial
        onBeforeCompile={shader => {
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
        }}
      />
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
