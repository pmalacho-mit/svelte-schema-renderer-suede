import type { RenderNode, SpecificNode } from "../types";
import type { Replace } from "../utils";

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
) => ({
  ...node.itemNode,
  path: node.itemNode.path.replace("*", String(index)),
});
