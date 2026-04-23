<script lang="ts" module>
  import type { SpecificNode } from "../../types.js";

  const formats = {
    email: "email",
    uri: "url",
    "date-time": "datetime-local",
    date: "date",
    default: "text",
  } as const;

  const format = ({ format }: SpecificNode<"string">) =>
    format && format in formats
      ? formats[format as keyof typeof formats]
      : formats.default;
</script>

<script lang="ts">
  import type { Field } from "../Field.svelte";
  import { tooltip, title, attributes } from "./common.js";
  import PlaceholderOption, { placeholder } from "./PlaceholderOption.svelte";

  let { node, model }: Field.Props<"string"> = $props();

  // svelte-ignore state_referenced_locally
  let value = $state(
    node.const !== undefined
      ? String(node.const)
      : model.getOrFallback(node, placeholder),
  );

  const type = $derived(format(node));
  const disabled = $derived(!model.editable || node.const !== undefined);

  $effect(() => {
    if (value !== placeholder) model.set(node, value);
  });
</script>

<label {...attributes(node)}>
  <span title={tooltip(node, model)} {...attributes.role("name")}>
    {title(node, model)}
  </span>

  {#if node.options}
    <select bind:value {disabled}>
      <PlaceholderOption />
      {#each node.options as opt}
        <option value={opt}>{opt}</option>
      {/each}
    </select>
  {:else}
    <input bind:value {type} {disabled} />
  {/if}
</label>
