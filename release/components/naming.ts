import type { RenderNode, SpecificNode } from "../types";
import { stableMap, type Replace } from "../utils";

const pathToSnippetRemapping = {
  "*": "_item",
  ".": "__",
} as const;

export type PathToSnippetRemapping = typeof pathToSnippetRemapping;

export const pathToSnippetName = (path: string) => {
  for (const match in pathToSnippetRemapping)
    path = path.replaceAll(
      match,
      pathToSnippetRemapping[match as keyof PathToSnippetRemapping],
    );
  return path;
};

type PathToSnippetRemap<
  Query extends string,
  K extends keyof PathToSnippetRemapping,
> = Replace<Query, K, PathToSnippetRemapping[K]>;

export type PathToSnippetName<P extends string> =
  `${PathToSnippetRemap<PathToSnippetRemap<P, ".">, "*">}`;

export const arrayItemAtIndex = (
  node: SpecificNode<"array">,
  index: number,
): RenderNode => resolveAtIndex(index, node.itemNode);

const resolveAtIndex = (index: number, node: RenderNode): RenderNode => {
  const path = node.path.includes("*")
    ? node.path.replace("*", String(index))
    : node.path;

  const pathChanged = path !== node.path;

  switch (node.kind) {
    case "object":
      const children = stableMap(
        node.children,
        resolveAtIndex.bind(null, index),
      );
      return pathChanged || children !== node.children
        ? { ...node, path, children }
        : node;

    case "array":
      const itemNode = resolveAtIndex(index, node.itemNode);
      return pathChanged || itemNode !== node.itemNode
        ? { ...node, path, itemNode }
        : node;

    case "oneOf":
      const variants = stableMap(
        node.variants,
        resolveAtIndex.bind(null, index),
      );
      return pathChanged || variants !== node.variants
        ? { ...node, path, variants }
        : node;

    default:
      return pathChanged ? { ...node, path } : node;
  }
};
