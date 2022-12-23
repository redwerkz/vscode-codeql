import { posix, resolve } from "path";
import * as webpack from "webpack";
// eslint-disable-next-line import/default -- Not correctly recognized by eslint
import CopyPlugin from "copy-webpack-plugin";
import { isDevBuild } from "./dev";

// Based on https://github.com/microsoft/vscode-extension-samples/blob/61d94d731c5351531a7d82f92f775f749203e3b5/webpack-sample/webpack.config.js
export const config: webpack.Configuration = {
  mode: isDevBuild ? "development" : "production",
  target: "node16.14", // VSCode's Node version
  entry: {
    extension: "./src/extension.ts",
  },
  output: {
    path: resolve(__dirname, "..", "out"),
    filename: "[name].js",
    libraryTarget: "commonjs2",
    devtoolModuleFilenameTemplate: "../[resource-path]",
  },
  externals: {
    vscode: "commonjs vscode", // the vscode-module is created on-the-fly and must be excluded
    fsevents: "commonjs fsevents", // fsevents is only available on macOS
    "spawn-sync": "commonjs spawn-sync", // https://github.com/moxystudio/node-cross-spawn/blob/5.1.0/index.js#L32
    "applicationinsights-native-metrics":
      "commonjs applicationinsights-native-metrics", // not used in the extension
    "@opentelemetry/tracing": "commonjs @opentelemetry/tracing", // not used in the extension
  },
  externalsPresets: {
    node: true,
  },
  devtool: isDevBuild ? "inline-source-map" : "source-map",
  resolve: {
    extensions: [".js", ".ts", ".tsx", ".json"],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          configFile: resolve(__dirname, "..", "tsconfig.json"),
        },
      },
      {
        test: /\.node$/,
        loader: "node-loader",
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: posix.join(
            // If absolute path is a `glob` we replace backslashes with forward slashes, because only forward slashes can be used in the `glob`
            resolve(
              __dirname,
              "..",
              "node_modules",
              "source-map",
              "lib",
            ).replace(/\\/g, "/"),
            "*.wasm",
          ),
          to() {
            return `${resolve(__dirname, "..", "out")}/[name][ext]`;
          },
        },
      ],
    }),
  ],
  node: {
    // Do not mock Node's variables
    __dirname: false,
    __filename: false,
    global: false,
  },
  performance: {
    hints: false,
  },
};
