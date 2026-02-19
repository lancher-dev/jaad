# Code Blocks

## Base

Code blocks support syntax highlighting through file extension hints:

```js
function greet(name) {
  return `Hello, ${name}!`;
}

const message = greet("World");
console.log(message);
```

Python syntax highlighting:

```python
def calculate_sum(numbers):
    total = sum(numbers)
    return total

result = calculate_sum([1, 2, 3, 4, 5])
print(f"The sum is: {result}")
```

Shell commands:

```bash
cd project-directory
npm install
npm run dev
```

Plain text without highlighting:

```
This is plain text
No syntax highlighting applied
Useful for output or notes
```

## Tabbed Code Blocks

Group related code blocks into a tabbed interface using the `:::code-tabs` container directive. The label for each tab is taken from the **meta string** — the text written after the language identifier on the opening fence.

````
:::code-tabs
```bash npm
npm install
```
```bash pnpm
pnpm install
```
```bash yarn
yarn install
```
:::
````

:::code-tabs

```bash npm
npm install
```

```bash pnpm
pnpm install
```

```bash yarn
yarn install
```

:::

Any language can be used inside the tabs:

:::code-tabs

```ts TypeScript
const greet = (name: string): string => `Hello, ${name}!`;
```

```js JavaScript
const greet = (name) => `Hello, ${name}!`;
```

:::
