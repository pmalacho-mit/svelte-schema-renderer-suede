import type { JSONSchema7 } from "json-schema";
import type { Context, RenderNode } from "./types";
import { valid } from "./utils/index.js";
import { merge, mergeSchemas } from "./utils/merge.js";
import { isSchema, infer } from "./utils/schema.js";
import { resolve } from "./utils/refs.js";

export const root = (schema: JSONSchema7, path: string = "") =>
  node(schema, path, {
    rootSchema: schema,
    refStack: new Set(),
  });

const node = (raw: JSONSchema7, path: string, ctx: Context): RenderNode => {
  // Step 1: Resolve $ref (possibly recursive)
  let schema = resolve(raw, ctx);

  // Step 2: Merge composition keywords into a single effective schema
  schema = merge(schema, ctx);

  const { oneOf, anyOf, title, description, enum: options } = schema;

  // Step 3: If we still have oneOf/anyOf that couldn't be merged,
  // produce a variant node (discriminated union in the UI)
  if (oneOf || anyOf) return variant(schema, path, ctx);

  // Step 4: Infer type if not explicitly stated
  const kind = infer(schema);

  // Step 5: Only catch *untyped* enums as a generic enum node.
  // Typed enums fall through to their type-specific handler
  if (options && !kind)
    return { kind: "enum", path, title, description, options };

  // Step 6: Dispatch on type
  switch (kind) {
    case "string":
      if (!valid.options("string", options))
        throw new Error(
          `Invalid enum options for ${path}: expected array of strings.`,
        );
      if (!valid.default("string", schema.default))
        throw new Error(`Invalid default value for ${path}: expected string.`);
      return {
        kind,
        path,
        title,
        description,
        options,
        format: schema.format,
        default: schema.default,
      };
    case "number":
    case "integer":
      const min = schema.minimum ?? schema.exclusiveMinimum;
      const max = schema.maximum ?? schema.exclusiveMaximum;
      if (!valid.options("number", options))
        throw new Error(
          `Invalid enum options for ${path}: expected array of numbers.`,
        );
      if (!valid.default("number", schema.default))
        throw new Error(`Invalid default value for ${path}: expected number.`);
      return {
        kind: "number",
        min,
        max,
        path,
        title,
        description,
        options,
        default: schema.default,
      };

    case "boolean":
      if (!valid.options("boolean", options))
        throw new Error(
          `Invalid enum options for ${path}: expected array of booleans.`,
        );
      if (!valid.default("boolean", schema.default))
        throw new Error(`Invalid default value for ${path}: expected boolean.`);
      return { kind, path, title, description, default: schema.default };
    case "object":
      return object(schema, path, ctx);
    case "array":
      return array(schema, path, ctx);
    default:
      return { kind: "unknown", path, schema };
  }
};

const variant = (schema: JSONSchema7, path: string, ctx: Context) => {
  const { oneOf, anyOf, title, description } = schema;
  const branches = (oneOf ?? anyOf)!;

  const variants = branches.filter(isSchema).map((branch, i) => {
    const resolved = resolve(branch as JSONSchema7, ctx);
    // Merge parent-level constraints into each variant so
    // shared properties (title, description, base fields) propagate
    const { oneOf, anyOf, ...parentFields } = schema;
    const effective = mergeSchemas(parentFields, resolved);
    return node(effective, path, ctx);
  });

  return {
    kind: "oneOf",
    path,
    title,
    description,
    variants,
  } satisfies RenderNode;
};

const object = (schema: JSONSchema7, path: string, ctx: Context) => {
  const { properties, title, description } = schema;
  const required = new Set(schema.required ?? []);

  const children = Object.entries(properties ?? {})
    .filter(([, v]) => isSchema(v))
    .map(([key, sub]) => {
      const childPath = path ? `${path}.${key}` : key;
      const child = node(sub as JSONSchema7, childPath, ctx);
      child.optional = !required.has(key);
      return child;
    });

  return {
    kind: "object",
    path,
    title,
    description,
    children,
    required,
  } satisfies RenderNode;
};

const array = (schema: JSONSchema7, path: string, ctx: Context) => {
  let itemSchema: JSONSchema7 = {};

  if (schema.items)
    if (Array.isArray(schema.items))
      // Tuple validation — merge all item schemas as an allOf
      // so the render tree captures all possible shapes.
      // (A more sophisticated approach would use a tuple node.)
      itemSchema = { allOf: schema.items.filter(isSchema) };
    else if (isSchema(schema.items)) itemSchema = schema.items;

  const itemNode = node(itemSchema, `${path}.*`, ctx);

  return {
    kind: "array",
    path,
    title: schema.title,
    description: schema.description,
    itemNode,
    minItems: schema.minItems,
    maxItems: schema.maxItems,
  } satisfies RenderNode;
};
