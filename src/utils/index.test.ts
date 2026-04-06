import { describe, it, expect } from "vitest";
import { valid } from "../../release/utils/index.js";

describe("valid.options", () => {
  it("returns true when options is undefined", () => {
    expect(valid.options("string", undefined)).toBe(true);
    expect(valid.options("number", undefined)).toBe(true);
    expect(valid.options("boolean", undefined)).toBe(true);
  });

  it("returns true for an empty array", () => {
    expect(valid.options("string", [])).toBe(true);
  });

  it("returns true when every element matches the kind", () => {
    expect(valid.options("string", ["a", "b", "c"])).toBe(true);
    expect(valid.options("number", [1, 2, 3])).toBe(true);
    expect(valid.options("boolean", [true, false])).toBe(true);
  });

  it("returns false when any element does not match the kind", () => {
    expect(valid.options("string", ["a", 1])).toBe(false);
    expect(valid.options("number", [1, "two"])).toBe(false);
    expect(valid.options("boolean", [true, "false"])).toBe(false);
  });

  it("returns false when the value is not an array and not undefined", () => {
    expect(valid.options("string", "hello" as any)).toBe(false);
    expect(valid.options("number", 42 as any)).toBe(false);
  });
});

describe("valid.default", () => {
  it("returns true when defaultValue is undefined", () => {
    expect(valid.default("string", undefined)).toBe(true);
    expect(valid.default("number", undefined)).toBe(true);
    expect(valid.default("boolean", undefined)).toBe(true);
  });

  it("returns true when defaultValue matches the kind", () => {
    expect(valid.default("string", "hello")).toBe(true);
    expect(valid.default("number", 42)).toBe(true);
    expect(valid.default("boolean", false)).toBe(true);
  });

  it("returns false when defaultValue does not match the kind", () => {
    expect(valid.default("string", 42)).toBe(false);
    expect(valid.default("number", "hello")).toBe(false);
    expect(valid.default("boolean", 1)).toBe(false);
  });

  it("returns false for null (not undefined)", () => {
    expect(valid.default("string", null)).toBe(false);
  });
});
