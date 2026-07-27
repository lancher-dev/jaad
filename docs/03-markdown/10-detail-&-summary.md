# Details & Summary

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
