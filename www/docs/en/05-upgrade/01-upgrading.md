# Upgrading

JAAD is usually upgraded together with Astro: each JAAD release targets one Astro
major, and most releases follow an Astro release. Upgrade both at once:

:::code-tabs

```bash npm
npx @astrojs/upgrade
```

```bash pnpm
pnpm dlx @astrojs/upgrade
```

```bash yarn
yarn dlx @astrojs/upgrade
```

```bash bun
bunx @astrojs/upgrade
```

:::

To upgrade JAAD alone:

:::code-tabs

```bash npm
npm install @lancher-dev/jaad@latest
```

```bash pnpm
pnpm add @lancher-dev/jaad@latest
```

```bash yarn
yarn add @lancher-dev/jaad@latest
```

```bash bun
bun add @lancher-dev/jaad@latest
```

:::

Then run a build and read [Migrating](/docs/upgrade/migrating) for the versions
you skipped.
