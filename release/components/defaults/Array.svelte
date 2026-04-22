<script lang="ts">
  import type { Field } from "../Field.svelte";
  import { arrayItemAtIndex } from "../naming.js";
  import { component } from ".";
  import { attributes, title, tooltip } from "./common.js";

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

<fieldset {...attributes(node, model)}>
  <legend title={tooltip(node, model)}>{title(node, model)}</legend>

  {#each items as _, index (index)}
    {@render renderChild(arrayItemAtIndex(node, index), "array", index)}
    {#if model.editable}
      {#if spliceRenderer}
        {@render spliceRenderer({ node, model, index })}
      {:else}
        {@const Component = component.forArray["splice"]}
        <Component {node} {model} {index} />
      {/if}
    {/if}
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
