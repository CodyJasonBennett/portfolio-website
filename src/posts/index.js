/* eslint-disable import/no-webpack-loader-syntax */
import { lazy } from 'react';
import { frontMatter as shadowziqFrontMatter } from '!babel-loader!mdx-loader!posts/gds-iq-guide.mdx';
const ShadowzIQPost = lazy(() => import('!babel-loader!mdx-loader!posts/gds-iq-guide.mdx'));

const posts = [
  {
    content: ShadowzIQPost,
    ...shadowziqFrontMatter,
  }
];

export default posts;
