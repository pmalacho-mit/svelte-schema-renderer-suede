<script lang="ts">
  import type { MouseEventHandler } from "svelte/elements";
  import type { Field } from "../Field.svelte";
  import type { Snippet } from "svelte";
  import { attributes } from "./common.js";

  let {
    node,
    model,
    action,
    onclick,
    children,
  }: Field.Props & {
    action: string;
    onclick: MouseEventHandler<HTMLButtonElement>;
    children: Snippet;
  } = $props();
</script>

<button
  data-action={action}
  {...attributes(node, model)}
  title={`${action} ${node.title ?? node.path}`}
  {onclick}
>
  {@render children()}
</button>
