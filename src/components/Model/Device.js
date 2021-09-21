import { useMemo, useCallback, useEffect } from 'react';
import { MathUtils, sRGBEncoding, LinearFilter, Color, TextureLoader } from 'three';
import { useThree } from '@react-three/fiber';
import { useTexture, useGLTF } from '@react-three/drei';
import { useSpring } from '@react-spring/core';
import { getImageFromSrcSet } from 'utils/image';
import { ModelAnimationType } from './deviceModels';

const MeshType = {
  Frame: 'Frame',
  Logo: 'Logo',
  Screen: 'Screen',
};

const getModelAnimation = ({ model, index, showDelay }) => {
  switch (model.animation) {
    case ModelAnimationType.SpringUp:
      return {
        delay: 300 * index + showDelay * 0.6,
        from: { ...model.position, y: model.position.y - 1 },
        to: model.position,
      };
    case ModelAnimationType.LaptopOpen:
      return {
        delay: 300 * index + showDelay + 200,
        from: { x: MathUtils.degToRad(90), y: 0, z: 0 },
        to: { x: 0, y: 0, z: 0 },
      };
    default:
      throw new Error('');
  }
};

const Device = ({ model, reduceMotion, index, showDelay }) => {
  const { gl, invalidate } = useThree();
  const placeholder = useTexture(model.texture.placeholder);
  const gltf = useGLTF(model.url);
  const object = useMemo(() => gltf.scene.clone(), [gltf.scene]);
  const { delay, from, to } = getModelAnimation({ model, index, showDelay });

  const applyAnimation = useCallback(
    ({ x, y, z }) => {
      if (!object) return;

      if (model.animation === ModelAnimationType.SpringUp) {
        object.position.set(x, y, z);
      } else {
        const frameNode = object.children.find(node => node.name === MeshType.Frame);
        frameNode.rotation.set(x, y, z);
      }
    },
    [model.animation, object]
  );

  useSpring({
    delay,
    from,
    to,
    config: {
      mass: 1,
      tension: 170,
      friction: 40,
    },
    immediate: reduceMotion,
    onChange({ value }) {
      applyAnimation(value);
      invalidate();
    },
  });

  const applyScreenTexture = useCallback(
    (texture, node) => {
      texture.encoding = sRGBEncoding;
      texture.minFilter = LinearFilter;
      texture.magFilter = LinearFilter;
      texture.flipY = false;
      texture.anisotropy = gl.capabilities.getMaxAnisotropy();
      texture.generateMipmaps = false;

      // Decode the texture to prevent jank on first render
      gl.initTexture(texture);

      node.material.color = new Color(0xffffff);
      node.material.transparent = false;
      node.material.map = texture;
      node.material.needsUpdate = true;

      invalidate();
    },
    [gl, invalidate]
  );

  useEffect(() => {
    object.traverse(async node => {
      if (node.material) {
        node.material.color = new Color(0x1f2025);
        node.material.color.convertSRGBToLinear();
      }

      if (node.name === MeshType.Screen) {
        applyScreenTexture(placeholder, node);

        const image = await getImageFromSrcSet(model.texture);
        const fullSize = await new TextureLoader().loadAsync(image);
        applyScreenTexture(fullSize, node);
      }
    });

    // Set initial props
    applyAnimation(from);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <primitive object={object} />;
};

export default Device;
