const path = require("path");

module.exports = {
  mode: "production",
  entry: {
    "background": "./src/background.js",
    "ui": "./src/ui-entry.js",
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
  optimization: { minimize: false },
};