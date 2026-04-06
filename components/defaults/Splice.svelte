<script lang="ts">
  import type { Field } from "../Field.svelte";

  let { node, model, index }: Field.ArrayActionProps = $props();
</script>

<button onclick={() => model.get(node)!.splice(index, 1)}>Remove</button>
