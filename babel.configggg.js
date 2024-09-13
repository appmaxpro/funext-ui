const path = require('path');
const fse = require('fs-extra');

const errorCodesPath = path.resolve(__dirname, './public/static/error-codes.json');
/*
const { version: transformRuntimeVersion } = fse.readJSONSync(
  require.resolve('@babel/runtime-corejs2/package.json'),
);
console.log("transformRuntimeVersion: ", transformRuntimeVersion);
*/
module.exports = {
  // TODO: Enable once nextjs uses babel 7.13
  // assumptions: {
  //   noDocumentAll: true,
  // },
  
  "presets": [
    [
      "@babel/preset-react",
      
    ]
  ], 

  plugins: [
    [
      'babel-plugin-macros',
      {
        muiError: {
          errorCodesPath,
        },
      },
    ],
    'babel-plugin-optimize-clsx',
  ],
  ignore: [/@babel[\\|/]runtime/], // Fix a Windows issue.
  env: {
    production: {
      plugins: [
        '@babel/plugin-transform-react-constant-elements',
        ['babel-plugin-react-remove-properties', { properties: ['data-mui-test'] }],
        ['babel-plugin-transform-react-remove-prop-types', { mode: 'remove' }],
      ],
    },
    "development": {
      "presets": [["@babel/preset-react", { "development": true }]]
    }
  },
};