<script lang="ts" module>
  import type { RenderNode } from "../types";
  import type { Data, Mode, SchemaModel } from "../models.svelte.js";

  export type Props<TMode extends Mode, TData extends Data> = {
    node: RenderNode;
    model: SchemaModel<TMode, TData>;
  } & (Data extends TData ? {} : Field.Renderers<TData>);
</script>

<script lang="ts" generics="TMode extends Mode, TData extends Data">
  import FieldComponent, { type Field } from "./Field.svelte";

  let { node, model, ...renderers }: Props<TMode, TData> = $props();
</script>

<FieldComponent {node} {model} renderers={renderers as Field.Renderers} />
