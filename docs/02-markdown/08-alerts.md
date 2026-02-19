# Alerts

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

    remarkPlugins: [remarkAlert, remarkDirective, remarkCodeTabs],

},
});

```

</details>

## Combinations

All elements work together naturally. Here's a **bold statement** with an `inline code reference` followed by a [link to external docs](https://docs.astro.build). The text flows naturally and maintains readability.

Complex combinations like this preserve formatting: **_bold italic text_** containing `code snippets` and [embedded links](/) all within the same sentence.
```
