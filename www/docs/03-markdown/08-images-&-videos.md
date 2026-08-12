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
