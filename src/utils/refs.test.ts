import { describe, it, expect, vi } from "vitest";
import { resolve, warnings } from "../../release/utils/refs.js";
import type { Context } from "../../release/types.js";

const ctx = (rootSchema: object): Context => ({
  rootSchema: rootSchema as any,
  refStack: new Set(),
});

describe("resolve", () => {
  it("returns schema unchanged when there is no $ref", () => {
    const schema = { type: "string" as const };
    expect(resolve(schema, ctx({}))).toEqual({ type: "string" });
  });

  it("resolves a local $ref via #/definitions", () => {
    const root = {
      definitions: { Foo: { type: "string" } },
    };
    const schema = { $ref: "#/definitions/Foo" };
    expect(resolve(schema, ctx(root))).toEqual({ type: "string" });
  });

  it("resolves a local $ref via #/$defs", () => {
    const root = {
      $defs: { Bar: { type: "number" } },
    };
    const schema = { $ref: "#/$defs/Bar" };
    expect(resolve(schema, ctx(root))).toEqual({ type: "number" });
  });

  it("merges sibling keywords onto the resolved schema", () => {
    const root = {
      $defs: { Baz: { type: "string" } },
    };
    const schema = { $ref: "#/$defs/Baz", title: "My title" };
    const result = resolve(schema, ctx(root));
    expect(result).toEqual({ type: "string", title: "My title" });
  });

  it("resolves chained $refs", () => {
    const root = {
      $defs: {
        A: { $ref: "#/$defs/B" },
        B: { type: "boolean" },
      },
    };
    expect(resolve({ $ref: "#/$defs/A" }, ctx(root))).toEqual({
      type: "boolean",
    });
  });

  it("returns a fallback object for an unresolved $ref and warns", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = resolve({ $ref: "#/definitions/Missing" }, ctx({}));
    expect(result).toEqual({
      type: "object",
      title: "(unresolved: #/definitions/Missing)",
    });
    expect(warn).toHaveBeenCalledWith(
      warnings.unresolvedRef("#/definitions/Missing"),
    );
    warn.mockRestore();
  });

  it("returns a fallback object for circular $refs and warns", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const root = {
      $defs: { Self: { $ref: "#/$defs/Self" } },
    };
    const result = resolve({ $ref: "#/$defs/Self" }, ctx(root));
    expect(result).toEqual({
      type: "object",
      title: "(circular: #/$defs/Self)",
    });
    expect(warn).toHaveBeenCalledWith(warnings.circularRef("#/$defs/Self"));
    warn.mockRestore();
  });

  it("returns null for non-local $refs (e.g. remote URLs)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = resolve(
      { $ref: "https://example.com/schema.json" },
      ctx({}),
    );
    expect(result).toEqual({
      type: "object",
      title: "(unresolved: https://example.com/schema.json)",
    });
    warn.mockRestore();
  });

  it("decodes JSON Pointer escape sequences in ref segments", () => {
    const root = {
      definitions: { "foo/bar": { type: "integer" } },
    };
    // "foo/bar" encoded as "foo~1bar"
    const schema = { $ref: "#/definitions/foo~1bar" };
    expect(resolve(schema, ctx(root))).toEqual({ type: "integer" });
  });
});
