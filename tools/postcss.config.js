module.exports = () => ({
  plugins: [
    require('postcss-import')(),
    require('postcss-mixins')(),
    require('postcss-each')(),
    require('postcss-cssnext')(),
    require('postcss-reporter')({
      clearMessages: true,
    }),
  ],
});
