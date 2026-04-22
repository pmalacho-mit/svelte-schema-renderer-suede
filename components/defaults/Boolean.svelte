<script lang="ts">
  import type { Field } from "../Field.svelte";
  import { attributes, title, tooltip } from "./common.js";

  let { node, model }: Field.Props<"boolean"> = $props();
  const { get, set } = $derived(model.accessors(node));
</script>

<label {...attributes(node, model)}>
  <input
    type="checkbox"
    checked={get() ?? false}
    onchange={({ currentTarget: { checked } }) => set(checked)}
    disabled={!model.editable}
  />
  <span title={tooltip(node, model)}>{title(node, model)}</span>
</label>
