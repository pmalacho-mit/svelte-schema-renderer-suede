<script lang="ts">
  import type { Field } from "../Field.svelte";
  import { attributes, title, tooltip } from "./common.js";
  import PlaceholderOption from "./PlaceholderOption.svelte";

  let { node, model }: Field.Props<"number"> = $props();

  // svelte-ignore state_referenced_locally
  let value = $state(
    model.getOrFallback(node, node.options?.[0] ?? node.min ?? 0),
  );

  const disabled = $derived(!model.editable);

  $effect(() => {
    model.set(node, value);
  });
</script>

<label {...attributes(node)}>
  <span title={tooltip(node, model)} {...attributes.role("name")}>
    {title(node, model)}
  </span>

  {#if node.options}
    <select bind:value {disabled}>
      <PlaceholderOption />
      {#each node.options as option}
        <option value={option}>{option}</option>
      {/each}
    </select>
  {:else}
    <input type="number" bind:value {disabled} {...node} />
  {/if}
</label>
