# Inline HTML

When markdown syntax isn't sufficient, inline HTML provides additional control:

<div style="padding: 1rem; background: #eeeae5; border-radius: 0.5rem; margin: 1.5rem 0;">
  <strong>Custom HTML Block</strong>
  <p>This section uses HTML instead of markdown for precise styling control.</p>
</div>

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
