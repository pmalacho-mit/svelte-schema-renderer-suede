<script lang="ts">
  import type { Field } from "../Field.svelte";

  let { node, renderChild }: Field.Props<"object"> = $props();
</script>

<fieldset>
  <legend>{node.title ?? node.path}</legend>
  {#each node.children as child (child.path)}
    {@render renderChild(child, "object")}
  {/each}
</fieldset>
