import type { JSONSchema7 } from "json-schema";
import type { Context } from "../types.js";
import { isSchema } from "./schema.js";

export const warnings = {
  circularRef: (ref: string) => `Circular $ref detected: ${ref}`,
  unresolvedRef: (ref: string) => `Unresolved $ref: ${ref}`,
};

export const resolve = (schema: JSONSchema7, ctx: Context): JSONSchema7 => {
  if (!schema.$ref) return schema;

  const ref = schema.$ref;

  // Circular reference guard
  if (ctx.refStack.has(ref)) {
    console.warn(warnings.circularRef(ref));
    return { type: "object", title: `(circular: ${ref})` };
  }

  const resolved = lookup(ref, ctx.rootSchema);
  if (!resolved) {
    console.warn(warnings.unresolvedRef(ref));
    return { type: "object", title: `(unresolved: ${ref})` };
  }

  // Merge any sibling keywords from the referencing schema
  // (JSON Schema 2019-09+ allows siblings alongside $ref)
  const { $ref, ...siblings } = schema;
  const merged = { ...resolved, ...siblings };

  ctx.refStack.add(ref);
  const result = resolve(merged, ctx); // refs can chain
  ctx.refStack.delete(ref);

  return result;
};

const lookup = (ref: string, root: JSONSchema7): JSONSchema7 | null => {
  // Only supports local JSON pointer refs: "#/definitions/Foo"
  // or the newer "#/$defs/Foo"
  if (!ref.startsWith("#/")) return null;

  const segments = ref
    .slice(2) // strip "#/"
    .split("/")
    .map(decodeJsonPointer);

  let current: any = root;
  for (const seg of segments) {
    if (current == null || typeof current !== "object") return null;
    current = current[seg];
  }

  return isSchema(current) ? current : null;
};

const decodeJsonPointer = (segment: string): string =>
  // JSON Pointer escapes: ~1 = /, ~0 = ~
  segment.replace(/~1/g, "/").replace(/~0/g, "~");
