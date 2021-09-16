import { Suspense } from 'react';
import Model from 'components/Model';
import { StoryContainer } from '../../../.storybook/StoryContainer';
import deviceModels from './deviceModels';
import phoneTexture from 'assets/device-models-phone.jpg';
import phoneTextureLarge from 'assets/device-models-phone-large.jpg';
import phoneTexturePlaceholder from 'assets/device-models-phone-placeholder.jpg';
import laptopTexture from 'assets/dtt.jpg';
import laptopTextureLarge from 'assets/dtt-large.jpg';
import laptopTexturePlaceholder from 'assets/dtt-placeholder.jpg';

export default {
  title: 'Model',
};

const modelStyle = { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 };

export const phone = () => (
  <StoryContainer padding={0}>
    <Suspense fallback={null}>
      <Model
        show
        style={modelStyle}
        cameraPosition={{ x: 0, y: 0, z: 11.5 }}
        alt="Phone models"
        models={[
          {
            ...deviceModels.phone,
            position: { x: -0.6, y: 0.8, z: 0.1 },
            texture: {
              src: phoneTexture,
              srcSet: `${phoneTexture} 800w, ${phoneTextureLarge} 1440w`,
              placeholder: phoneTexturePlaceholder,
            },
          },
          {
            ...deviceModels.phone,
            position: { x: 0.6, y: -0.8, z: 0.4 },
            texture: {
              src: phoneTexture,
              srcSet: `${phoneTexture} 800w, ${phoneTextureLarge} 1440w`,
              placeholder: phoneTexturePlaceholder,
            },
          },
        ]}
      />
    </Suspense>
  </StoryContainer>
);

export const laptop = () => (
  <StoryContainer padding={0}>
    <Suspense fallback={null}>
      <Model
        show
        style={modelStyle}
        cameraPosition={{ x: 0, y: 0, z: 8 }}
        alt="Laptop Model"
        models={[
          {
            ...deviceModels.laptop,
            position: { x: 0, y: 0, z: 0 },
            texture: {
              src: laptopTexture,
              srcSet: `${laptopTexture} 800w, ${laptopTextureLarge} 1440w`,
              placeholder: laptopTexturePlaceholder,
            },
          },
        ]}
      />
    </Suspense>
  </StoryContainer>
);
