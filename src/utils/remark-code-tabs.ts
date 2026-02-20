import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import type { Root } from "mdast";

/**
 * Remark plugin to render tabbed code blocks.
 *
 * Markdown syntax:
 * :::code-tabs
 * ```bash npm
 * npm install
 * ```
 * ```bash pnpm
 * pnpm install
 * ```
 * :::
 *
 * Everything after the language identifier (the meta string) becomes the tab label.
 * If no meta is present, the language name is used as the label.
 */
const remarkCodeTabs: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, "containerDirective", (node: any, index, parent: any) => {
      if (node.name !== "code-tabs") return;
      if (index === undefined || !parent) return;

      const codeNodes = node.children.filter(
        (child: any) => child.type === "code",
      );
      if (codeNodes.length === 0) return;

      const labels: string[] = codeNodes.map(
        (cn: any, i: number) => cn.meta || cn.lang || `Tab ${i + 1}`,
      );

      // Opening wrapper + tab button bar
      const openHtml = `<div class="code-tabs"><div class="code-tab-buttons" role="tablist">${labels.map((label, i) => `<button class="code-tab-btn${i === 0 ? " active" : ""}" data-tab-index="${i}" role="tab" aria-selected="${i === 0}">${label}</button>`).join("")}</div>`;

      const replacement: any[] = [{ type: "html", value: openHtml }];

      codeNodes.forEach((codeNode: any, i: number) => {
        replacement.push({
          type: "html",
          value: `<div class="code-tab-panel${i === 0 ? " active" : ""}" data-tab-index="${i}" role="tabpanel">`,
        });
        // Clone without meta so Shiki doesn't render it as a title annotation
        replacement.push({ ...codeNode, meta: null });
        replacement.push({ type: "html", value: `</div>` });
      });

      replacement.push({ type: "html", value: `</div>` });

      parent.children.splice(index, 1, ...replacement);

      // Return new index to skip over the freshly inserted nodes
      return index + replacement.length;
    });
  };
};

export default remarkCodeTabs;
