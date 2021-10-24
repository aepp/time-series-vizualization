const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
  mode: process.env.NODE_ENV,
  entry: {
    main: "./src/index.js",
  },
  output: {
    path: __dirname + "/dist",
    filename: "[name].js",
  },
  devtool: "source-map",
  devServer: {
    static: path.join(__dirname, "public"),
    compress: true,
    port: 9000,
    allowedHosts: "all",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "public/index.html",
      filename: "index.html",
      chunks: ["main"],
    }),
  ],
};
