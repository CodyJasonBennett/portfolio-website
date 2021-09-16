import DecoderText from 'components/DecoderText';
import { StoryContainer } from '../../../.storybook/StoryContainer';
import Heading from 'components/Heading';

export default {
  title: 'Decoder Text',
  args: {
    text: 'Decoder text',
  },
};

export const decoderText = ({ text }) => (
  <StoryContainer>
    <Heading level={3}>
      <DecoderText delay={0} text={text} />
    </Heading>
  </StoryContainer>
);
