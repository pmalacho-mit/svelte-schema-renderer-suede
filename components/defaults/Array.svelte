<script lang="ts">
  import type { Field } from "../Field.svelte";
  import { arrayItemAtIndex } from "../naming.js";
  import { component } from ".";

  let {
    node,
    model,
    renderChild,
    pushRenderer,
    spliceRenderer,
  }: Field.Props<"array"> = $props();

  const items = $derived(model.get(node)!);
</script>

<fieldset>
  {#if node.title}
    <legend>{node.title}</legend>
  {/if}

  {#each items as _, index (index)}
    <div>
      {@render renderChild(arrayItemAtIndex(node, index), "array", index)}
      {#if model.editable}
        {#if spliceRenderer}
          {@render spliceRenderer({ node, model, index })}
        {:else}
          {@const Component = component.forArray["splice"]}
          <Component {node} {model} {index} />
        {/if}
      {/if}
    </div>
  {/each}

  {#if model.editable && (node.maxItems == null || items!.length < node.maxItems)}
    {@const index = items!.length}
    {#if pushRenderer}
      {@render pushRenderer({ node, model, index })}
    {:else}
      {@const Component = component.forArray["push"]}
      <Component {node} {model} {index} />
    {/if}
  {/if}
</fieldset>
