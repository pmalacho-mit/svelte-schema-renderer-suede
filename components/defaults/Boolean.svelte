<script lang="ts">
  import type { Field } from "../Field.svelte";

  let { node, model }: Field.Props<"boolean"> = $props();
  const { get, set } = $derived(model.accessors(node));
</script>

<label>
  <input
    type="checkbox"
    checked={get() ?? false}
    onchange={({ currentTarget: { checked } }) => set(checked)}
    disabled={!model.editable}
  />
  <span>{node.title ?? node.path}</span>
</label>
