# Images & Videos

## Images

```
![Alt text](https://example.com/image.png)
![Alt text](https://example.com/image.png "Optional title")
![Local image](../../assets/my-image.png)
```

Images display with automatic sizing:

![Placeholder image description](https://via.placeholder.com/800x400/eeeae5/3a3a3a?text=Image+Example)

Alt text provides accessibility and appears when images fail to load. Link to a page or full-size version by wrapping the image in a link:

```
[![Alt text](image.png)](https://example.com)
```

## Video

Markdown does not have native video support. To embed a video use an HTML `<video>` tag for self-hosted files or an `<iframe>` for YouTube/Vimeo:

```html
<!-- Self-hosted video -->
<video controls width="100%">
  <source src="/assets/demo.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>

<!-- YouTube embed -->
<iframe
  width="100%"
  height="400"
  src="https://www.youtube.com/embed/VIDEO_ID"
  title="Video title"
  frameborder="0"
  allowfullscreen
></iframe>
```

## Inline HTML

When markdown syntax isn't sufficient, inline HTML provides additional control:

<div style="padding: 1rem; background: #eeeae5; border-radius: 0.5rem; margin: 1.5rem 0;">
  <strong>Custom HTML Block</strong>
  <p>This section uses HTML instead of markdown for precise styling control.</p>
</div>

## Alerts

Alerts are an extension of standard blockquote syntax provided by [remark-github-blockquote-alert](https://github.com/jaywcjlove/remark-github-blockquote-alert). Five types are supported: `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, and `CAUTION`.

```
> [!NOTE]
> Useful information that users should know.

> [!TIP]
> Helpful advice for doing things better.

> [!IMPORTANT]
> Key information users need to accomplish their goal.

> [!WARNING]
> Urgent info that needs immediate user attention.

> [!CAUTION]
> Advises about risks or negative outcomes.
```

> [!NOTE]
> Useful information that users should know.

> [!TIP]
> Helpful advice for doing things better.

> [!IMPORTANT]
> Key information users need to accomplish their goal.

> [!WARNING]
> Urgent info that needs immediate user attention.

> [!CAUTION]
> Advises about risks or negative outcomes.

:::

## Details & Summary

The native HTML `<details>` and `<summary>` elements create collapsible sections. Standard markdown is supported inside:

```html
<details>
  <summary>Click to expand</summary>

  Hidden content goes here. You can use **markdown** inside.
</details>
```

<details>
<summary>Click to expand</summary>

Hidden content goes here. You can use **markdown** inside, including:

- Bullet lists
- `inline code`
- And more

</details>

<details>
<summary>Advanced configuration example</summary>

```ts
export default defineConfig({
  markdown: {
    remarkPlugins: [remarkAlert, remarkDirective, remarkCodeTabs],
  },
});
```

</details>

## Combinations

All elements work together naturally. Here's a **bold statement** with an `inline code reference` followed by a [link to external docs](https://docs.astro.build). The text flows naturally and maintains readability.

Complex combinations like this preserve formatting: **_bold italic text_** containing `code snippets` and [embedded links](/) all within the same sentence.
