<script lang="ts">
  import type { Field } from "../Field.svelte";

  let { node, renderChild }: Field.Props<"object"> = $props();
</script>

<fieldset>
  {#if node.title}
    <legend>{node.title}</legend>
  {/if}
  {#each node.children as child (child.path)}
    {@render renderChild(child, "object")}
  {/each}
</fieldset>
