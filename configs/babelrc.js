module.exports = {
  presets: [
    '@babel/preset-typescript',
    '@babel/preset-react',
    [
      '@babel/preset-env',
      {
        targets: {
          node: '10',
          chrome: '59',
          safari: '10',
          firefox: '56',
          edge: '14',
        },
        modules: 'commonjs',
      },
    ],
  ],
  plugins: ['@babel/plugin-proposal-class-properties'],
}
