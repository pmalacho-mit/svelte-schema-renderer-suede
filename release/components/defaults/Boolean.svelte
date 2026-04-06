<script lang="ts">
  import type { Field } from "../Field.svelte";

  let { node, model }: Field.Props<"boolean"> = $props();
</script>

<label>
  <input
    type="checkbox"
    checked={model.get(node) ?? false}
    onchange={(e) => model.set(node, e.currentTarget.checked)}
    disabled={!model.editable}
  />
  <span>{node.title ?? node.path}</span>
</label>
