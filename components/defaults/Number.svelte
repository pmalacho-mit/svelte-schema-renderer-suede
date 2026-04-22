<script lang="ts">
  import type { Field } from "../Field.svelte";
  import { attributes, title, tooltip } from "./common.js";
  import PlaceholderOption from "./PlaceholderOption.svelte";

  let { node, model }: Field.Props<"number"> = $props();
  const { get, set } = $derived(model.accessors(node));

  const value = $derived(String(get() ?? ""));
  const disabled = $derived(!model.editable);
</script>

<label {...attributes(node)}>
  <span title={tooltip(node, model)} {...attributes.role("name")}>
    {title(node, model)}
  </span>

  {#if node.options}
    <select
      {value}
      {disabled}
      onchange={({ currentTarget: { value } }) => set(Number(value))}
    >
      <PlaceholderOption />
      {#each node.options as opt}
        <option value={String(opt)}>{opt}</option>
      {/each}
    </select>
  {:else}
    <input
      type="number"
      {value}
      {disabled}
      min={node.min}
      max={node.max}
      oninput={({ currentTarget: { valueAsNumber } }) => set(valueAsNumber)}
    />
  {/if}
</label>
