import { describe, it, expect } from "vitest";
import { isSchema, asDef, infer } from "../../release/utils/schema.js";

describe("isSchema", () => {
  it("returns true for plain objects", () => {
    expect(isSchema({ type: "string" })).toBe(true);
    expect(isSchema({})).toBe(true);
  });

  it("returns false for booleans", () => {
    expect(isSchema(true)).toBe(false);
    expect(isSchema(false)).toBe(false);
  });

  it("returns false for null and undefined", () => {
    expect(isSchema(null)).toBe(false);
    expect(isSchema(undefined)).toBe(false);
  });
});

describe("asDef", () => {
  it("passes through object schemas unchanged", () => {
    const schema = { type: "string" as const };
    expect(asDef(schema)).toBe(schema);
  });

  it("converts true to empty schema {}", () => {
    expect(asDef(true)).toEqual({});
  });

  it("converts false to { not: {} }", () => {
    expect(asDef(false)).toEqual({ not: {} });
  });
});

describe("infer", () => {
  it("returns explicit type when set as a string", () => {
    expect(infer({ type: "string" })).toBe("string");
    expect(infer({ type: "number" })).toBe("number");
    expect(infer({ type: "boolean" })).toBe("boolean");
    expect(infer({ type: "object" })).toBe("object");
    expect(infer({ type: "array" })).toBe("array");
  });

  it("returns first element when type is an array", () => {
    expect(infer({ type: ["string", "null"] })).toBe("string");
  });

  it("infers object from properties keyword", () => {
    expect(infer({ properties: { foo: { type: "string" } } })).toBe("object");
  });

  it("infers object from additionalProperties keyword", () => {
    expect(infer({ additionalProperties: true })).toBe("object");
  });

  it("infers object from required keyword", () => {
    expect(infer({ required: ["foo"] })).toBe("object");
  });

  it("infers array from items keyword", () => {
    expect(infer({ items: { type: "string" } })).toBe("array");
  });

  it("infers array from minItems", () => {
    expect(infer({ minItems: 1 })).toBe("array");
  });

  it("infers array from maxItems", () => {
    expect(infer({ maxItems: 5 })).toBe("array");
  });

  it("infers number from minimum", () => {
    expect(infer({ minimum: 0 })).toBe("number");
  });

  it("infers number from maximum", () => {
    expect(infer({ maximum: 100 })).toBe("number");
  });

  it("infers number from multipleOf", () => {
    expect(infer({ multipleOf: 2 })).toBe("number");
  });

  it("infers string from minLength", () => {
    expect(infer({ minLength: 1 })).toBe("string");
  });

  it("infers string from maxLength", () => {
    expect(infer({ maxLength: 50 })).toBe("string");
  });

  it("infers string from pattern", () => {
    expect(infer({ pattern: "^[a-z]+$" })).toBe("string");
  });

  it("returns undefined when no type can be inferred", () => {
    expect(infer({})).toBeUndefined();
    expect(infer({ title: "Something" })).toBeUndefined();
  });
});
