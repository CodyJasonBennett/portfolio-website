import { Vector3, MathUtils } from 'three';
import { delay, chain, spring, value } from 'popmotion';
import { invalidate } from '@react-three/fiber';

export const ModelAnimationType = {
  SpringUp: 'spring-up',
  LaptopOpen: 'laptop-open',
};

export const MeshType = {
  Frame: 'Frame',
  Logo: 'Logo',
  Screen: 'Screen',
};

/**
 * Get custom model animation
 */
export const getModelAnimation = ({ model, object, reduceMotion, index, showDelay }) => {
  const positionVector = new Vector3(
    model.position.x,
    model.position.y,
    model.position.z
  );

  if (reduceMotion) {
    object.position.set(...positionVector.toArray());
    return;
  }

  // Simple slide up animation
  if (model.animation === ModelAnimationType.SpringUp) {
    const startPosition = new Vector3(
      positionVector.x,
      positionVector.y - 1,
      positionVector.z
    );
    const endPosition = positionVector;

    object.position.set(...startPosition.toArray());

    const modelValue = value(object.position, ({ x, y, z }) => {
      object.position.set(x, y, z);
      invalidate();
    });

    const animation = chain(
      delay(300 * index + showDelay * 0.6),
      spring({
        from: startPosition,
        to: endPosition,
        stiffness: 60,
        damping: 16,
        restSpeed: 0.001,
      })
    );

    return { animation, modelValue };
  }

  // Laptop open animation
  if (model.animation === ModelAnimationType.LaptopOpen) {
    const frameNode = object.children.find(node => node.name === MeshType.Frame);
    const startRotation = new Vector3(MathUtils.degToRad(90), 0, 0);
    const endRotation = new Vector3(0, 0, 0);

    object.position.set(...positionVector.toArray());
    frameNode.rotation.set(...startRotation.toArray());

    const modelValue = value(frameNode.rotation, ({ x, y, z }) => {
      frameNode.rotation.set(x, y, z);
      invalidate();
    });

    const animation = chain(
      delay(300 * index + showDelay + 200),
      spring({
        from: startRotation,
        to: endRotation,
        stiffness: 50,
        damping: 14,
        restSpeed: 0.001,
      })
    );

    return { animation, modelValue };
  }
};
