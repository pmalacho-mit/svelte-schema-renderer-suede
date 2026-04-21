<script lang="ts" module>
  import type { RenderNode, SpecificNode } from "../../types.js";
  import type { SchemaModel } from "../../models.svelte.js";
  import type { RenderChild } from "../Field.svelte";

  /**
   * Rough structural match: checks whether the current value
   * is plausibly described by the given variant node.
   */
  const matchesVariant = (variant: RenderNode, value: unknown): boolean => {
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
        const obj = value as Record<string, unknown>;
        // Check const-discriminator fields match
        for (const child of variant.children) {
          if (child.kind === "string" && child.const !== undefined) {
            const key = child.path.split(".").at(-1)!;
            if (obj[key] !== child.const) return false;
          }
        }
        // Check that at least some of the required children exist
        for (const key of variant.required) {
          const childPath = variant.children.find(
            (c) => c.path.split(".").at(-1) === key,
          );
          if (childPath && !(key in obj)) return false;
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

  const _default = (variant: RenderNode): unknown => {
    switch (variant.kind) {
      case "string":
        return variant.default ?? "";
      case "number":
        return variant.default ?? 0;
      case "boolean":
        return variant.default ?? false;
      case "object": {
        const seed: Record<string, unknown> = {};
        for (const child of variant.children) {
          if (child.kind === "string" && child.const !== undefined)
            seed[child.path.split(".").at(-1)!] = child.const;
        }
        return seed;
      }
      case "array":
        return [];
      case "enum":
        return (variant as SpecificNode<"enum">).options[0] ?? null;
      default:
        return null;
    }
  };

  const label = (variant: RenderNode, index: number): string => {
    if (variant.title) return variant.title;
    // For object variants, use the first child's const value as a label
    if (variant.kind === "object") {
      for (const child of variant.children) {
        if (child.kind === "string" && child.const !== undefined)
          return String(child.const);
      }
    }
    return `Option ${index + 1}`;
  };
</script>

<script lang="ts">
  let { node, model, renderChild }: Props = $props();

  let selectedIndex: number | null = $state(null);

  // Attempt to auto-detect which variant matches the current data
  // by finding the first variant whose shape is compatible.
  const detectedIndex = $derived.by(() => {
    const value = model.get(node);
    if (value === undefined) return null;

    for (let i = 0; i < node.variants.length; i++) {
      const variant = node.variants[i];
      if (matchesVariant(variant, value)) return i;
    }
    return null;
  });

  let activeIndex = $derived(selectedIndex ?? detectedIndex);
  let activeVariant = $derived(
    activeIndex != null ? node.variants[activeIndex] : null,
  );

  function selectVariant(index: number) {
    selectedIndex = index;

    // Clear existing data and seed with the right default shape
    const variant = node.variants[index];
    model.set(node, _default(variant));
  }
</script>

<fieldset>
  {#if node.title}
    <legend>{node.title}</legend>
  {/if}

  {#if model.editable}
    <div>
      <label>
        <span>Type</span>
        <select
          value={activeIndex != null ? String(activeIndex) : ""}
          onchange={(e) => selectVariant(Number(e.currentTarget.value))}
        >
          <option value="" disabled>Select type…</option>
          {#each node.variants as variant, i}
            <option value={String(i)}>{label(variant, i)}</option>
          {/each}
        </select>
      </label>
    </div>
  {:else if activeIndex == null}
    <!-- Stream mode: no variant resolved yet -->
    <div>
      <span>Type</span>
      <span>●●●</span>
    </div>
  {/if}

  {#if activeVariant}
    <div>
      {@render renderChild(activeVariant, "oneOf")}
    </div>
  {/if}
</fieldset>
