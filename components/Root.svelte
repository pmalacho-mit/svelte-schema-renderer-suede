<script lang="ts" module>
  import type { RenderNode } from "../types";
  import type { Data, Mode, SchemaModel } from "../models.svelte.js";

  export type Props<TMode extends Mode, TData extends Data> = {
    root: RenderNode;
    model: SchemaModel<TMode, TData>;
  } & (Data extends TData ? {} : TField.Renderers<TData>);
</script>

<script lang="ts" generics="TMode extends Mode, TData extends Data">
  import Field, { type Field as TField } from "./Field.svelte";

  let { root: node, model, ...renderers }: Props<TMode, TData> = $props();
</script>

<Field {node} {model} renderers={renderers as TField.Renderers} />
