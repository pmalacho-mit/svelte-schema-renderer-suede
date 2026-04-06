import { describe, it, expect } from "vitest";
import { merge, mergeSchemas } from "../../release/utils/merge.js";
import type { Context } from "../../release/types.js";
import type { JSONSchema7 } from "json-schema";

function ctx(rootSchema: object = {}): Context {
  return { rootSchema: rootSchema as any, refStack: new Set() };
}

// ---------------------------------------------------------------------------
// mergeSchemas
// ---------------------------------------------------------------------------

describe("mergeSchemas", () => {
  it("produces a shallow merge of two schemas", () => {
    const result = mergeSchemas({ type: "object" }, { title: "Foo" });
    expect(result).toMatchObject({ type: "object", title: "Foo" });
  });

  it("override wins for conflicting scalar fields", () => {
    const result = mergeSchemas({ type: "string" }, { type: "number" });
    expect(result.type).toBe("number");
  });

  it("deep-merges properties", () => {
    const base = {
      properties: { a: { type: "string" } },
    } satisfies JSONSchema7;
    const override = {
      properties: { b: { type: "number" } },
    } satisfies JSONSchema7;
    const result = mergeSchemas(base, override);
    expect(result.properties).toEqual({
      a: { type: "string" },
      b: { type: "number" },
    });
  });

  it("override properties win over base properties for the same key", () => {
    const base = {
      properties: { a: { type: "string" } },
    } satisfies JSONSchema7;
    const override = {
      properties: { a: { type: "number" } },
    } satisfies JSONSchema7;
    expect(mergeSchemas(base, override).properties?.a).toEqual({
      type: "number",
    });
  });

  it("unions required arrays and deduplicates", () => {
    const base = { required: ["a", "b"] };
    const override = { required: ["b", "c"] };
    const result = mergeSchemas(base, override);
    expect(result.required).toEqual(["a", "b", "c"]);
  });

  it("picks the higher minimum", () => {
    expect(mergeSchemas({ minimum: 1 }, { minimum: 5 }).minimum).toBe(5);
    expect(mergeSchemas({ minimum: 10 }, { minimum: 3 }).minimum).toBe(10);
  });

  it("picks the lower maximum", () => {
    expect(mergeSchemas({ maximum: 10 }, { maximum: 5 }).maximum).toBe(5);
    expect(mergeSchemas({ maximum: 3 }, { maximum: 100 }).maximum).toBe(3);
  });

  it("picks the higher minLength", () => {
    expect(mergeSchemas({ minLength: 2 }, { minLength: 8 }).minLength).toBe(8);
  });

  it("picks the lower maxLength", () => {
    expect(mergeSchemas({ maxLength: 20 }, { maxLength: 10 }).maxLength).toBe(
      10,
    );
  });

  it("leaves minimum/maximum alone when only one side has them", () => {
    expect(mergeSchemas({ minimum: 1 }, {}).minimum).toBe(1);
    expect(mergeSchemas({}, { maximum: 99 }).maximum).toBe(99);
  });
});

// ---------------------------------------------------------------------------
// merge
// ---------------------------------------------------------------------------

describe("merge", () => {
  it("returns schema unchanged when no composition keywords are present", () => {
    const schema = { type: "string" as const, title: "Name" };
    expect(merge(schema, ctx())).toEqual(schema);
  });

  it("merges allOf sub-schemas", () => {
    const result = merge(
      {
        type: "object",
        allOf: [
          { properties: { a: { type: "string" } } },
          { properties: { b: { type: "number" } } },
        ],
      },
      ctx(),
    );
    expect(result.allOf).toBeUndefined();
    expect(result.properties?.a).toEqual({ type: "string" });
    expect(result.properties?.b).toEqual({ type: "number" });
  });

  it("inlines a single-variant anyOf", () => {
    const result = merge({ anyOf: [{ type: "string" }] }, ctx());
    expect(result.anyOf).toBeUndefined();
    expect(result.type).toBe("string");
  });

  it("does NOT inline a multi-variant anyOf", () => {
    const result = merge(
      { anyOf: [{ type: "string" }, { type: "number" }] },
      ctx(),
    );
    expect(result.anyOf).toBeDefined();
    expect(result.anyOf).toHaveLength(2);
  });

  it("inlines a single-variant oneOf", () => {
    const result = merge({ oneOf: [{ type: "boolean" }] }, ctx());
    expect(result.oneOf).toBeUndefined();
    expect(result.type).toBe("boolean");
  });

  it("does NOT inline a multi-variant oneOf", () => {
    const result = merge(
      { oneOf: [{ type: "string" }, { type: "number" }] },
      ctx(),
    );
    expect(result.oneOf).toBeDefined();
  });

  it("merges then/else and removes if/then/else", () => {
    const result = merge(
      {
        if: { properties: { flag: { type: "boolean" } } },
        then: { properties: { a: { type: "string" } } },
        else: { properties: { b: { type: "number" } } },
      },
      ctx(),
    );
    expect(result.if).toBeUndefined();
    expect(result.then).toBeUndefined();
    expect(result.else).toBeUndefined();
    expect(result.properties?.a).toEqual({ type: "string" });
    expect(result.properties?.b).toEqual({ type: "number" });
  });

  it("resolves $ref inside allOf against rootSchema", () => {
    const root = {
      $defs: { Name: { properties: { first: { type: "string" } } } },
    };
    const result = merge({ allOf: [{ $ref: "#/$defs/Name" }] }, ctx(root));
    expect(result.properties?.first).toEqual({ type: "string" });
  });
});
