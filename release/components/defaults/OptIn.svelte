<script lang="ts">
  import type { Field } from "../Field.svelte";
  import { valueForNode } from ".";

  let { node, model }: Field.Props = $props();
</script>

<button onclick={() => model.set(node, valueForNode(node))}>
  + {node.title ?? node.path}
</button>
