<script lang="ts">
  import type { Field } from "../Field.svelte";

  let { node, model }: Field.Props = $props();
</script>

<button onclick={() => model.remove(node)}>×</button>
