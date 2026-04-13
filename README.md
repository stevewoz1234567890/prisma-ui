[![codecov](https://codecov.io/gh/orolia/prisma-ui/branch/develop/graph/badge.svg?token=1zTr4LZjo5)](https://codecov.io/gh/orolia/prisma-ui)
[![codebuild](https://codebuild.us-east-1.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoiR0dyU1hoaW5XNUxzNm94UVZyQlF6S0F1bk13S2dGUDlQZHp0bytTSjhRbDBkbWlCNzQzTkszRUlWRk5aRUNWZDBZcmh5Rkp2aVNlc29kSTJTWXNBWWVNPSIsIml2UGFyYW1ldGVyU3BlYyI6IlF6VXNrQnN6M2xoZVVmS2IiLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=develop)](https://console.aws.amazon.com/codesuite/codebuild/projects/prisma-ui/history)


# PRISMA Clients and Libraries

This repo is a `yarn workspace` repository that contains all the packages and libraries for the PRISMA clients.

The main client is the electron application and can be found in `./packages/prisma-electron`. To build and run the application you can do so in this directory by running `yarn build && yarn start`, which compiles all dependencies and the electron application, then launches it. After a root `yarn build`, you can still run package-specific `yarn` scripts from `packages/prisma-electron` as before.

## Prerequisites

- **Node.js** (LTS recommended; the project is exercised on Node 18 in CI-style environments).
- **Yarn** (classic v1) for workspaces. Install from [Classic Yarn](https://classic.yarnpkg.com/lang/en/docs/install/) or enable via `corepack prepare yarn@1.22.22 --activate`.

> **Note:** Running `yarn install` from any directory in the repo installs packages according to yarn workspace rules; there is no special subdirectory required for the root install.

## Packages

The prisma-ui workspace is made up of the following packages. See each package README for APIs, Storybook, and package-specific setup.

* [prisma-electron](./packages/prisma-electron/README.md): The main electron application and web app.
* [prisma-map](./packages/prisma-map/README.md): The PRISMA map framework built on Mapbox GL.
* [prisma-ui](./packages/prisma-ui/README.md): The PRISMA UI framework for common React components and other reusable elements.

## Build and run

From the repository root:

```bash
yarn install
yarn build
yarn test
yarn start
```

This installs dependencies for all workspace packages, builds libraries and the electron package, runs the Jest suite, then starts the electron app (`packages/prisma-electron`).

### Native dependencies (Linux)

Some packages pull in optional native modules (for example **canvas**). If install fails while compiling `canvas`, install the usual Cairo stack (names vary by distro), for example on Debian/Ubuntu:

```bash
sudo apt-get install -y build-essential pkg-config libcairo2-dev libpango1.0-dev \
  libjpeg-dev libgif-dev librsvg2-dev libpixman-1-dev
```

### npm instead of yarn

If you use **npm**, you may need `npm install --legacy-peer-deps` at the root because of historical peer dependency constraints. The documented workflow remains **yarn** at the workspace root.

## Testing

From the repository root:

```bash
yarn test
```

Other scripts:

- `yarn test:coverage` — Jest with coverage reports under `./coverage/`.
- `yarn test:coverage:codecov` — coverage then upload via Codecov (for CI).

To reduce load or simplify debugging, you can run Jest directly, for example:

```bash
./node_modules/.bin/jest --runInBand
```
