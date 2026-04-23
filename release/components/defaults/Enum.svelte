<script lang="ts">
  import type { Field } from "../Field.svelte";
  import { attributes, title, tooltip } from "./common.js";
  import PlaceholderOption, { placeholder } from "./PlaceholderOption.svelte";

  let { node, model }: Field.Props<"enum"> = $props();

  // svelte-ignore state_referenced_locally
  let value = $state(model.getOrFallback(node, placeholder));

  $effect(() => {
    if (value !== placeholder) model.set(node, value);
  });
</script>

<label {...attributes(node)}>
  <span title={tooltip(node, model)} {...attributes.role("name")}>
    {title(node, model)}
  </span>
  <select bind:value disabled={!model.editable}>
    <PlaceholderOption />
    {#each node.options as opt}
      <option value={opt}>{opt}</option>
    {/each}
  </select>
</label>
