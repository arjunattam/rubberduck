/*
The what-the-diff package does not work with the build script, fails with a minify error.
This script fixes that.
*/

const { echo, exec } = require("shelljs");

const packages = [
  "./node_modules/what-the-diff"
  // ... other dependencies
];

echo("\nPre build starts.\n");
packages.forEach(pack =>
  exec(`babel --presets=es2015 ${pack} --out-dir ${pack}`)
);
echo("\nPre build finished.\n");
