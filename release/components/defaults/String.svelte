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

  let { node, model }: Field.Props<"string"> = $props();

  const type = $derived(format(node));
  const value = $derived(
    node.const !== undefined ? String(node.const) : (model.get(node) ?? ""),
  );
  const disabled = $derived(!model.editable || node.const !== undefined);
</script>

<label>
  <span>{node.title ?? node.path}</span>

  {#if node.options}
    <select
      {value}
      {disabled}
      onchange={(e) => model.set(node, e.currentTarget.value)}
    >
      <option value="" disabled>Select…</option>
      {#each node.options as opt}
        <option value={opt}>{opt}</option>
      {/each}
    </select>
  {:else}
    <input
      {type}
      {value}
      {disabled}
      oninput={(e) => model.set(node, e.currentTarget.value)}
    />
  {/if}
</label>
