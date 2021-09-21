import { useRef, memo } from 'react';
import classNames from 'classnames';
import { useSpring } from '@react-spring/core';
import VisuallyHidden from 'components/VisuallyHidden';
import { usePrefersReducedMotion } from 'hooks';
import prerender from 'utils/prerender';
import './index.css';

// prettier-ignore
const glyphs = [
  'ア', 'イ', 'ウ', 'エ', 'オ',
  'カ', 'キ', 'ク', 'ケ', 'コ',
  'サ', 'シ', 'ス', 'セ', 'ソ',
  'タ', 'チ', 'ツ', 'テ', 'ト',
  'ナ', 'ニ', 'ヌ', 'ネ', 'ノ',
  'ハ', 'ヒ', 'フ', 'ヘ', 'ホ',
  'マ', 'ミ', 'ム', 'メ', 'モ',
  'ヤ', 'ユ', 'ヨ', 'ー',
  'ラ', 'リ', 'ル', 'レ', 'ロ',
  'ワ', 'ヰ', 'ヱ', 'ヲ', 'ン',
  'ガ', 'ギ', 'グ', 'ゲ', 'ゴ',
  'ザ', 'ジ', 'ズ', 'ゼ', 'ゾ',
  'ダ', 'ヂ', 'ヅ', 'デ', 'ド',
  'バ', 'ビ', 'ブ', 'ベ', 'ボ',
  'パ', 'ピ', 'プ', 'ペ', 'ポ',
];

const CharType = {
  Glyph: 'glyph',
  Value: 'value',
};

function shuffle(content, output, position) {
  return content.split('').map((value, index) => {
    if (index < position) {
      return { type: CharType.Value, value };
    }

    if (position % 1 < 0.5) {
      const rand = Math.floor(Math.random() * glyphs.length);
      return { type: CharType.Glyph, value: glyphs[rand] };
    }

    return { type: CharType.Glyph, value: output[index].value };
  });
}

const DecoderText = ({
  text,
  start = true,
  delay: startDelay = 0,
  className,
  ...rest
}) => {
  const output = useRef([{ type: CharType.Glyph, value: '' }]);
  const container = useRef();
  const reduceMotion = usePrefersReducedMotion();

  useSpring({
    from: {
      t: 0,
    },
    to: {
      t: text.length,
    },
    delay: startDelay,
    immediate: reduceMotion,
    pause: prerender || !start,
    config: {
      mass: 10,
      friction: 120,
    },
    onChange({ value }) {
      const { t } = value;

      output.current = shuffle(text, output.current, t);
      const characterMap = output.current.map(item => {
        return `<span class="decoder-text__${item.type}">${item.value}</span>`;
      });

      container.current.innerHTML = characterMap.join('');
    },
  });

  return (
    <span className={classNames('decoder-text', className)} {...rest}>
      <VisuallyHidden className="decoder-text__label">{text}</VisuallyHidden>
      <span aria-hidden className="decoder-text__content" ref={container} />
    </span>
  );
};

export default memo(DecoderText);
