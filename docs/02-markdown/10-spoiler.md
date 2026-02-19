# Spoiler

A spoiler hides text until the reader chooses to reveal it. It is useful for answers, plot details, or any content that should be opt-in.

## Usage

Markdown does not have native spoiler syntax. Use an inline `<span>` with the `spoiler` class:

```html
The answer is <span class="spoiler">42</span>.
```

The answer is <span class="spoiler">42</span>.

Click the dark block to reveal the text. Click again to hide it.

## Block spoilers

Wrap a paragraph or any block element in a `<div class="spoiler">`:

```html
<div class="spoiler">
  This entire paragraph is hidden until revealed. It can contain **markdown**
  and any inline formatting.
</div>
```

<div class="spoiler">
  This entire paragraph is hidden until revealed. It can contain **markdown**
  and any inline formatting.
</div>

> [!NOTE]
> The spoiler state is not persisted. Refreshing the page resets all spoilers to hidden.
