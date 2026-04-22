<script lang="ts" module>
  import type { ChangeEventHandler } from "svelte/elements";
  import type { SpecificNode } from "../../types.js";

  const formats = {
    email: "email",
    uri: "url",
    "date-time": "datetime-local",
    date: "date",
    default: "text",
  } as const;

  const format = ({ format }: SpecificNode<"string">) =>
    format && format in formats
      ? formats[format as keyof typeof formats]
      : formats.default;
</script>

<script lang="ts">
  import type { Field } from "../Field.svelte";
  import { tooltip, title, attributes } from "./common.js";
  import PlaceholderOption from "./PlaceholderOption.svelte";

  let { node, model }: Field.Props<"string"> = $props();

  const { get, set } = $derived(model.accessors(node));
  const update: ChangeEventHandler<HTMLInputElement | HTMLSelectElement> = ({
    currentTarget: { value },
  }) => set(value);

  const type = $derived(format(node));
  const value = $derived(
    node.const !== undefined ? String(node.const) : (get() ?? ""),
  );
  const disabled = $derived(!model.editable || node.const !== undefined);
</script>

<label {...attributes(node)}>
  <span title={tooltip(node, model)} {...attributes.role("name")}>
    {title(node, model)}
  </span>

  {#if node.options}
    <select {value} {disabled} onchange={update}>
      <PlaceholderOption />
      {#each node.options as opt}
        <option value={opt}>{opt}</option>
      {/each}
    </select>
  {:else}
    <input {type} {value} {disabled} oninput={update} />
  {/if}
</label>
