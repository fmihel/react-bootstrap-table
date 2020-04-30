var path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    libraryTarget: 'commonjs2' // THIS IS THE MOST IMPORTANT LINE! :mindblow: I wasted more than 2 days until realize this was the line most important in all this guide.
  },
  externals: {      
    // Don't bundle react or react-dom      
    react: {          
        commonjs: "react",          
        commonjs2: "react",          
        amd: "React",          
        root: "React"      
    },      
    "react-dom": {          
        commonjs: "react-dom",          
        commonjs2: "react-dom",          
        amd: "ReactDOM",          
        root: "ReactDOM"      
    }
  },    
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: path.resolve(__dirname, 'source'),
        exclude: /(node_modules|bower_components|build|dev)/,
        use: {
          loader: 'babel-loader',
          //options: {
          ///  presets: ['env']
         // }
        }
      },
      {
        test: /\.(scss)$/,
        use: [
            {
                loader: 'style-loader', // inject CSS to page
            },{
                loader: 'css-loader', // translates CSS into CommonJS modules
            },{
                loader: 'postcss-loader', // Run post css actions
                options: {
                    plugins: function () { // post css plugins, can be exported to postcss.config.js
                        return [
                            require('precss'),
                            require('autoprefixer')
                        ];
                    }
                }
            },{
                loader: 'sass-loader' // compiles SASS to CSS
            }
        ]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },        
    ]
  },
}