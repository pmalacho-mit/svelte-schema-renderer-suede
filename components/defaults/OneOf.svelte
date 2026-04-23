<script lang="ts" module>
  import type { RenderNode, SpecificNode } from "../../types.js";
  import type { SchemaModel } from "../../models.svelte.js";
  import type { RenderChild } from "../Field.svelte";
  import { constDiscriminators, is, valueForNode } from "./common.js";
  import { basename } from "../naming.js";

  /**
   * Rough structural match: checks whether the current value
   * is plausibly described by the given variant node.
   */
  const match = (variant: RenderNode, value: unknown): boolean => {
    switch (variant.kind) {
      case "string":
        if (typeof value !== "string") return false;
        if (variant.options && !variant.options.includes(value)) return false;
        return true;
      case "number":
        return typeof value === "number";
      case "boolean":
        return typeof value === "boolean";
      case "object":
        if (typeof value !== "object" || value === null || Array.isArray(value))
          return false;
        const casted = value as Record<string, unknown>;
        const { children, required } = variant;

        for (const [key, val] of Object.entries(constDiscriminators(children)))
          if (casted[key] !== val) return false;

        for (const key of required) {
          const childPath = children.find(({ path }) => basename(path) === key);
          if (childPath && !(key in casted)) return false;
        }
        return true;
      case "array":
        return Array.isArray(value);
      case "enum":
        return (variant as SpecificNode<"enum">).options.includes(value);
      default:
        return false;
    }
  };

  export type Props = {
    node: SpecificNode<"oneOf">;
    model: SchemaModel;
    renderChild: RenderChild;
  };

  const label = (variant: RenderNode, index: number): string => {
    if (variant.title) return variant.title;
    if (variant.kind === "object")
      for (const child of variant.children)
        if (is.const(child)) return String(child.const);
    return `Option ${index + 1}`;
  };
</script>

<script lang="ts">
  import { attributes, tooltip, title } from "./common.js";
  import PlaceholderOption from "./PlaceholderOption.svelte";

  let { node, model, renderChild }: Props = $props();

  const value = $derived.by(() => {
    const current = model.get(node);
    console.log("Current value for oneOf:", current);
    return node.variants.findIndex((variant) => match(variant, current));
  });
</script>

{value}
<fieldset>
  <legend title={tooltip(node, model)} {...attributes.role("name")}>
    {title(node, model)}
  </legend>

  {#if model.editable}
    <label {...attributes.role("variant-selector")}>
      <span {...attributes.role("name")}>Type</span>
      <select
        {value}
        onchange={({ currentTarget: { value } }) =>
          model.set(node, valueForNode(node.variants[Number(value)]))}
      >
        <PlaceholderOption />
        {#each node.variants as variant, i}
          <option value={i}>{label(variant, i)}</option>
        {/each}
      </select>
    </label>
  {/if}

  {#if value >= 0}
    {@render renderChild(node.variants[value], "oneOf")}
  {/if}
</fieldset>
