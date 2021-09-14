import { useMemo, useCallback, useEffect } from 'react';
import { sRGBEncoding, LinearFilter, Color, TextureLoader } from 'three';
import { useThree } from '@react-three/fiber';
import { useTexture, useGLTF } from '@react-three/drei';
import { getImageFromSrcSet } from 'utils/image';
import { MeshType, getModelAnimation } from './animation';

const Device = ({ model, reduceMotion, index, showDelay }) => {
  const { gl, invalidate } = useThree();
  const placeholder = useTexture(model.texture.placeholder);
  const gltf = useGLTF(model.url);
  const object = useMemo(() => gltf.scene.clone(), [gltf.scene]);

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
    let spring;

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

    if (!reduceMotion) {
      const { animation, modelValue } = getModelAnimation({
        model,
        object,
        reduceMotion,
        index,
        showDelay,
      });
      spring = animation.start(modelValue);
    }

    return () => {
      spring?.stop();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <primitive object={object} />;
};

export default Device;
