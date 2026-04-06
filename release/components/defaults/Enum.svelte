<script lang="ts">
  import type { Field } from "../Field.svelte";

  let { node, model }: Field.Props<"enum"> = $props();

  const value = $derived(String(model.get(node) ?? ""));
</script>

<label>
  <span>{node.title ?? node.path}</span>
  <select
    value={String(value)}
    onchange={(e) => {
      const raw = e.currentTarget.value;
      // Attempt to recover the original typed value
      const match = node.options.find((o) => String(o) === raw);
      model.set(node, match ?? raw);
    }}
    disabled={!model.editable}
  >
    <option value="" disabled>Select…</option>
    {#each node.options as opt}
      <option value={String(opt)}>{String(opt)}</option>
    {/each}
  </select>
</label>
