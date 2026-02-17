# Deployment

The build process generates static HTML files that can be hosted on any static file server or CDN.

## Building

Run the build command to generate the production site:

```bash
pnpm build
```

This creates an optimized version of the site in the `dist/` directory. All markdown files convert to HTML pages with complete navigation and table of contents.

## Preview

Test the production build locally before deploying:

```bash
pnpm preview
```

This serves the built files from `dist/` locally so you can verify the production version works correctly.

## Static Hosts

Any service that hosts static files works with JAAD. The site requires no server-side processing, databases, or runtime dependencies. Popular options include Netlify, Vercel, Cloudflare Pages, GitHub Pages, and AWS S3 with CloudFront.

Most static hosts can deploy directly from a Git repository. Connect your repository, set the build command to `pnpm build`, and set the publish directory to `dist`. The host automatically rebuilds and deploys when you push changes.

## Custom Domain

Configure your custom domain through your hosting provider's DNS settings. Add a CNAME file to the `public/` directory if deploying to GitHub Pages with a custom domain.

## Base Path

If deploying to a subdirectory instead of a domain root, configure the base path in `astro.config.mjs`:

```js
export default defineConfig({
  base: "/docs",
  // other config...
});
```

This ensures all internal links work correctly when the site isn't at the root path.
