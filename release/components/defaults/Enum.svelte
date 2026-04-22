<script lang="ts">
  import type { Field } from "../Field.svelte";
  import { attributes, title, tooltip } from "./common.js";

  let { node, model }: Field.Props<"enum"> = $props();

  const value = $derived(String(model.get(node) ?? ""));
</script>

<label {...attributes(node, model)}>
  <span title={tooltip(node, model)}>{title(node, model)}</span>
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
    <option value="" disabled>Select…</option>
    {#each node.options as opt}
      <option value={String(opt)}>{String(opt)}</option>
    {/each}
  </select>
</label>
