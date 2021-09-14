import { useRef, useEffect, useCallback } from 'react';
import {
  WebGLRenderTarget,
  OrthographicCamera,
  MeshDepthMaterial,
  ShaderMaterial,
} from 'three';
import { HorizontalBlurShader } from 'three/examples/jsm/shaders/HorizontalBlurShader.js';
import { VerticalBlurShader } from 'three/examples/jsm/shaders/VerticalBlurShader.js';
import { useThree, useFrame } from '@react-three/fiber';

const renderTargetSize = 512;
const planeWidth = 8;
const planeHeight = 8;
const cameraHeight = 1.5;
const shadowOpacity = 0.8;
const shadowDarkness = 3;

const Shadows = () => {
  const { gl, scene, camera } = useThree();
  const group = useRef();
  const renderTarget = useRef();
  const renderTargetBlur = useRef();
  const shadowCamera = useRef();
  const depthMaterial = useRef();
  const horizontalBlurMaterial = useRef();
  const verticalBlurMaterial = useRef();

  useEffect(() => {
    // The render target that will show the shadows in the plane texture
    renderTarget.current = new WebGLRenderTarget(renderTargetSize, renderTargetSize);
    renderTarget.current.texture.generateMipmaps = false;

    // The render target that we will use to blur the first render target
    renderTargetBlur.current = new WebGLRenderTarget(renderTargetSize, renderTargetSize);
    renderTargetBlur.current.texture.generateMipmaps = false;

    // The camera to render the depth material from
    shadowCamera.current = new OrthographicCamera(
      -planeWidth / 2,
      planeWidth / 2,
      planeHeight / 2,
      -planeHeight / 2,
      0,
      cameraHeight
    );
    // Get the camera to look up
    shadowCamera.current.rotation.x = Math.PI / 2;
    group.current.add(shadowCamera.current);

    // Like MeshDepthMaterial, but goes from black to transparent
    depthMaterial.current = new MeshDepthMaterial();
    depthMaterial.current.userData.darkness = { value: shadowDarkness };
    depthMaterial.current.onBeforeCompile = shader => {
      shader.uniforms.darkness = depthMaterial.current.userData.darkness;
      shader.fragmentShader = `
        uniform float darkness;
        ${shader.fragmentShader.replace(
          'gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );',
          'gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * darkness );'
        )}
      `;
    };
    depthMaterial.current.depthTest = false;
    depthMaterial.current.depthWrite = false;

    horizontalBlurMaterial.current = new ShaderMaterial(HorizontalBlurShader);
    horizontalBlurMaterial.current.depthTest = false;

    verticalBlurMaterial.current = new ShaderMaterial(VerticalBlurShader);
    verticalBlurMaterial.current.depthTest = false;
  }, []);

  const blurShadow = useCallback(
    amount => {
      const blurPlane = group.current.getObjectByName('blur plane');

      blurPlane.visible = true;

      // Blur horizontally and draw in the renderTargetBlur
      blurPlane.material = horizontalBlurMaterial.current;
      blurPlane.material.uniforms.tDiffuse.value = renderTarget.current.texture;
      horizontalBlurMaterial.current.uniforms.h.value = amount * (1 / 256);

      gl.setRenderTarget(renderTargetBlur.current);
      gl.render(blurPlane, shadowCamera.current);

      // Blur vertically and draw in the main renderTarget
      blurPlane.material = verticalBlurMaterial.current;
      blurPlane.material.uniforms.tDiffuse.value = renderTargetBlur.current.texture;
      verticalBlurMaterial.current.uniforms.v.value = amount * (1 / 256);

      gl.setRenderTarget(renderTarget.current);
      gl.render(blurPlane, shadowCamera.current);

      blurPlane.visible = false;
    },
    [gl]
  );

  // Handle render passes
  useFrame(() => {
    const blurAmount = 5;

    // Force the depthMaterial to everything
    // cameraHelper.visible = false;
    scene.overrideMaterial = depthMaterial.current;

    // Render to the render target to get the depths
    gl.setRenderTarget(renderTarget.current);
    gl.render(scene, shadowCamera.current);

    // And reset the override material
    scene.overrideMaterial = null;

    blurShadow(blurAmount);

    // A second pass to reduce the artifacts
    // (0.4 is the minimum blur amout so that the artifacts are gone)
    blurShadow(blurAmount * 0.4);

    // Reset and render the normal scene
    gl.setRenderTarget(null);

    gl.render(scene, camera);
  }, 1);

  return (
    <group ref={group} position={[0, 0, -8]} rotation-x={Math.PI / 2}>
      <mesh name="blur plane" scale-y={-1} rotation-x={Math.PI / 2}>
        <planeGeometry args={[planeWidth, planeHeight]} />
        <meshBasicMaterial
          transparent
          opacity={shadowOpacity}
          map={renderTarget.current?.texture}
        />
      </mesh>
      <mesh name="fill plane" position-y={0.00001} rotation-x={Math.PI / 2}>
        <planeGeometry args={[planeWidth, planeHeight]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

export default Shadows;
