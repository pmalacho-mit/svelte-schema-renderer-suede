import type { Model, Schema } from "../release";

export class Pocket {
  model = $state<InstanceType<typeof Model>>()!;
  root = $state<Schema.Node>()!;

  constructor(model: InstanceType<typeof Model>, root: Schema.Node) {
    this.model = model;
    this.root = root;
  }
}
