<script lang="ts">
  import type { Field } from "../Field.svelte";
  import Action from "./Action.svelte";
  import { title, valueForNode } from "./common.js";

  let { node, model }: Field.Props = $props();

  const onclick = () => model.set(node, valueForNode(node));
</script>

<Action {node} {model} {onclick} action="opt-in">
  + {title(node, model)}
</Action>
