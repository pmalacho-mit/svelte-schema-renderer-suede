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
  const addable = $derived(
    model.editable && (node.maxItems == null || items!.length < node.maxItems),
  );
</script>

<fieldset>
  <legend>{node.title ?? node.path}</legend>

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

  {#if addable}
    {@const index = items!.length}
    {#if pushRenderer}
      {@render pushRenderer({ node, model, index })}
    {:else}
      {@const Component = component.forArray["push"]}
      <Component {node} {model} {index} />
    {/if}
  {/if}
</fieldset>
