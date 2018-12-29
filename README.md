# Rubberduck

<img width="100" height="100" align="right" src="./src/logo.svg" />

Rubberduck is a browser extension to improve code navigation on GitHub, to:

- **Speed up code comprehension**: find symbol usages and definitions
- **Reduce context switches**: see documentation inline, on hovering on symbols
- **Navigate in control**: use the files tree to navigate diffs and code pages

See it in action on [our website](https://www.rubberduck.io/).

Rubberduck is completely open source, and runs entirely on your personal machine (without any external server dependencies). We feel these two are critical design decisions for you to be comfortable using it [on your private repos](#using-on-private-repos).

## Setup

1. **Install the native host**: The browser extension relies on a native host application, which manages git repos, and runs the language analysis to find usages and definitions. The native host source is in the [`native-host` dir](./native-host/README.md). To install, run:

```
npm install -g rubberduck-native
```

2. **Install the browser extension**: The browser extension is available on [the Chrome Store](https://chrome.google.com/webstore/detail/rubberduck/nopekhgebkpkbjoclackdlofmcpokgmc).

## Using on private repos

TODO - add docs

## Contributions and support

Rubberduck is very new, actively developed and you might run into issues here and there. Please help us out by [filing an issue](https://github.com/karigari/rubberduck/issues) when you run into one.
