<script lang="ts">
  import { valueForNode } from ".";
  import type { Field } from "../Field.svelte";

  let { node, model }: Field.ArrayActionProps = $props();
</script>

<button onclick={() => model.get(node)!.push(valueForNode(node.itemNode))}>
  + Add item
</button>
