const allPosts = require.context(
  '!babel-loader!mdx-loader!posts',
  true,
  /\.mdx$/,
  'lazy'
);

const posts = allPosts
  .keys()
  .filter(path => path.startsWith('posts/'))
  .map(async filePath => {
    const module = await allPosts(filePath);

    return {
      content: module.default,
      ...module.frontMatter,
    };
  })
  .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

const fetchPosts = async () => Promise.all(posts);

export default fetchPosts;
