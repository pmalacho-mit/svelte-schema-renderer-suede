import type { Component } from "svelte";
import type { Field } from "../Field.svelte";
import type { Kind, RenderNode } from "../../types";
import String from "./String.svelte";
import Number from "./Number.svelte";
import Boolean from "./Boolean.svelte";
import Enum from "./Enum.svelte";
import Object from "./Object.svelte";
import Array from "./Array.svelte";
import OneOf from "./OneOf.svelte";
import Unknown from "./Unknown.svelte";
import OptIn from "./OptIn.svelte";
import OptOut from "./OptOut.svelte";
import Push from "./Push.svelte";
import Splice from "./Splice.svelte";

export const component = {
  byKind: {
    string: String,
    number: Number,
    boolean: Boolean,
    enum: Enum,
    object: Object,
    array: Array,
    oneOf: OneOf,
    unknown: Unknown,
  } satisfies {
    [K in Kind]: Component<Field.Props<K>>;
  },
  byAction: {
    opt_in__: OptIn,
    opt_out__: OptOut,
  } satisfies {
    [K in Field.RenderActions]: Component<Field.Props<any>>;
  },
  forArray: {
    push: Push,
    splice: Splice,
  },
};

type Defaultable = Exclude<Kind, "oneOf" | "enum" | "unknown">;

const defaults = {
  string: "",
  number: 0,
  boolean: false,
  get object() {
    return {};
  },
  get array() {
    return [];
  },
} satisfies Record<Defaultable, unknown>;

const defaultable = (
  node: RenderNode,
): node is RenderNode & { kind: Defaultable } => node.kind in defaults;

export const valueForNode = (node: RenderNode) =>
  "default" in node
    ? (node.default ?? defaults[node.kind])
    : defaultable(node)
      ? defaults[node.kind]
      : null;
