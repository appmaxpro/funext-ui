import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => ({
    ...config,
    module: {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /global\.css$/,
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              config: path.resolve(__dirname, "postcss.config.js"),
            },
          },
        },
        {
          test: /(300|400|500|600|700|800|common|rounded|\.module).css$/i,                                                                                                                                                             
          use: ["style-loader", "css-loader", "sass-loader"],                                                                                                                          
        }, 
        {
          test: /\.s[ac]ss$/, 
          use: ["style-loader", 'css-loader', 'sass-loader'] ,
          include: path.resolve(__dirname, './'),
        },
        {
          test: /\.scss$/, 
          use: ["style-loader", 'css-loader', 'sass-loader'] ,
        }   
      ],
    },
  })
};

module.exports = nextConfig;
