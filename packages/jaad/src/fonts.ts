import { fontProviders } from "astro/config";

const file = (name: string) =>
  new URL(`./fonts/${name}.woff2`, import.meta.url);

export const fonts = [
  {
    provider: fontProviders.local(),
    name: "Inter",
    cssVariable: "--font-inter",
    options: {
      variants: [{ weight: "400 600", style: "normal", src: [file("inter")] }],
    },
  },
  {
    provider: fontProviders.local(),
    name: "Merriweather",
    cssVariable: "--font-merriweather",
    options: {
      variants: [
        { weight: "300 700", style: "normal", src: [file("merriweather")] },
        {
          weight: "300 700",
          style: "italic",
          src: [file("merriweather-italic")],
        },
      ],
    },
  },
];
