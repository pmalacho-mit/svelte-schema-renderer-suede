<script lang="ts">
  import type { Field } from "../Field.svelte";
  import { attributes, title, tooltip } from "./common.js";
  import PlaceholderOption from "./PlaceholderOption.svelte";

  let { node, model }: Field.Props<"enum"> = $props();

  const value = $derived(String(model.get(node) ?? ""));
</script>

<label {...attributes(node)}>
  <span title={tooltip(node, model)} {...attributes.role("name")}>
    {title(node, model)}
  </span>
  <select
    value={String(value)}
    disabled={!model.editable}
    onchange={({ currentTarget: { value } }) =>
      // Attempt to recover the original typed value
      model.set(
        node,
        node.options.find((option) => String(option) === value) ?? value,
      )}
  >
    <PlaceholderOption />
    {#each node.options as opt}
      <option value={String(opt)}>{String(opt)}</option>
    {/each}
  </select>
</label>
