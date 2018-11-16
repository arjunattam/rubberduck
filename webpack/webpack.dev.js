const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const webpack = require("webpack");
const WebpackShellPlugin = require("webpack-shell-plugin");

const MANIFEST_KEY =
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlN56sx9mTFsM9qnbym1SLbO2BVyy0ilA75ja9ljoA6CpriYm0uYqY4s6KAQv2v7vZPSelxw+wy3W+HK1yGy+RXcidTtiCb7orVyoiFS2dCwb+g5QsqAyPV+cW3rYv+safbYLPbfHkPnBpSjSvop3BixQz5+//S9p4iqAZqUWfa6Op9NiQ5VaICl/gJeF4rOJGvwLO2D5XoHl24L/q3UZJ+eLUbOyIhY03Qcs25n4rzpq21EfM3lYOZi8xq4Hp89TFQGG63tSrE8xXKiZsHK29K/SJw+cYr74cFUiPwlXA9LA0rZR9Zw0GwvqBSoOoCuDqHGDXBoffdtsLwSgGWSZQwIDAQAB";

module.exports = merge(common, {
  devtool: "inline-source-map",
  mode: "development",
  plugins: [
    new WebpackShellPlugin({
      // We need to add the key field to manifest, to be able to fix
      // the extension id during development.
      onBuildStart: [
        `cat public/manifest.template.json | jq --arg key ${MANIFEST_KEY} '. + {key: $key}' > public/manifest.json`
      ],
      safe: true
    })
  ]
});
