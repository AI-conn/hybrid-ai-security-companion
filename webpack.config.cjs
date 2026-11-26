const path = require("path");

module.exports = {
  mode: "production",
  entry: {
    popup: "./src/popup.js",
    background: "./src/background.js",
    options: "./src/options.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  resolve: {
    alias: {
      "../firebase-config.json": path.resolve(__dirname, "firebase-config.json"),
    },
  },
  optimization: {
    minimize: false,
  },
};