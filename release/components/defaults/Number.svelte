<script lang="ts">
  import type { Field } from "../Field.svelte";

  let { node, model }: Field.Props<"number"> = $props();

  const value = $derived(String(model.get(node) ?? ""));
  const disabled = $derived(!model.editable);
</script>

<label>
  <span>{node.title ?? node.path}</span>

  {#if node.options}
    <select
      {value}
      {disabled}
      onchange={(e) => model.set(node, Number(e.currentTarget.value))}
    >
      <option value="" disabled>Select…</option>
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
      oninput={(e) => model.set(node, e.currentTarget.valueAsNumber)}
    />
  {/if}
</label>
