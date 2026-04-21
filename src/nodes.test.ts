import { describe, it, expect } from "vitest";
import { root } from "../release/nodes.js";
import type { RenderNode } from "../release/types.js";
import type { JSONSchema7 } from "json-schema";

// Example schemas
import addressSchema from "../public/address/schema.json";
import blogPostSchema from "../public/blog-post/schema.json";
import calendarSchema from "../public/calendar/schema.json";
import deviceSchema from "../public/device/schema.json";
import ecommerceSchema from "../public/ecommerce/schema.json";
import geoSchema from "../public/geographical-location/schema.json";
import healthRecordSchema from "../public/health-record/schema.json";
import jobPostingSchema from "../public/job-posting/schema.json";
import movieSchema from "../public/movie/schema.json";
import userProfileSchema from "../public/user-profile/schema.json";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type NodeKind = RenderNode["kind"];

function kindOf(node: RenderNode): NodeKind {
  return node.kind;
}

// ---------------------------------------------------------------------------
// Primitive types
// ---------------------------------------------------------------------------

describe("buildRenderTree — string", () => {
  it("builds a string node", async () => {
    const node = await root({ type: "string" });
    expect(node.kind).toBe("string");
  });

  it("carries title, description, format, default", async () => {
    const node = await root({
      type: "string",
      title: "Name",
      description: "Your name",
      format: "email",
      default: "foo@example.com",
    });
    expect(node).toMatchObject({
      kind: "string",
      title: "Name",
      description: "Your name",
      format: "email",
      default: "foo@example.com",
    });
  });

  it("carries string enum options", async () => {
    const node = await root({ type: "string", enum: ["a", "b"] });
    expect(node).toMatchObject({ kind: "string", options: ["a", "b"] });
  });

  it("throws when enum options are not all strings", async () => {
    await expect(root({ type: "string", enum: [1, 2] })).rejects.toThrow(
      /expected array of strings/,
    );
  });

  it("throws when default is not a string", async () => {
    await expect(root({ type: "string", default: 42 as any })).rejects.toThrow(
      /expected string/,
    );
  });
});

describe("buildRenderTree — number / integer", () => {
  it("builds a number node", async () => {
    const node = await root({ type: "number" });
    expect(node.kind).toBe("number");
  });

  it("builds an integer node as kind=number", async () => {
    const node = await root({ type: "integer" });
    expect(node.kind).toBe("number");
  });

  it("carries min, max, default", async () => {
    const node = await root({
      type: "number",
      minimum: 0,
      maximum: 100,
      default: 42,
    });
    expect(node).toMatchObject({
      kind: "number",
      min: 0,
      max: 100,
      default: 42,
    });
  });

  it("falls back to exclusiveMinimum/exclusiveMaximum", async () => {
    const node = await root({
      type: "number",
      exclusiveMinimum: 1,
      exclusiveMaximum: 9,
    } as any);
    expect(node).toMatchObject({ kind: "number", min: 1, max: 9 });
  });

  it("throws when enum options are not all numbers", async () => {
    await expect(root({ type: "number", enum: ["x"] })).rejects.toThrow(
      /expected array of numbers/,
    );
  });

  it("throws when default is not a number", async () => {
    await expect(
      root({ type: "number", default: "oops" as any }),
    ).rejects.toThrow(/expected number/);
  });
});

describe("buildRenderTree — boolean", () => {
  it("builds a boolean node", async () => {
    const node = await root({ type: "boolean" });
    expect(node.kind).toBe("boolean");
  });

  it("carries default", async () => {
    const node = await root({ type: "boolean", default: true });
    expect(node).toMatchObject({ kind: "boolean", default: true });
  });

  it("throws when enum options are not all booleans", async () => {
    await expect(root({ type: "boolean", enum: ["yes"] })).rejects.toThrow(
      /expected array of booleans/,
    );
  });

  it("throws when default is not a boolean", async () => {
    await expect(root({ type: "boolean", default: 1 as any })).rejects.toThrow(
      /expected boolean/,
    );
  });
});

// ---------------------------------------------------------------------------
// Unknown
// ---------------------------------------------------------------------------

describe("buildRenderTree — unknown", () => {
  it("returns unknown for a schema with no type or inferrable keywords", async () => {
    const node = await root({ title: "Mystery" });
    expect(node.kind).toBe("unknown");
  });
});

// ---------------------------------------------------------------------------
// Enum (untyped)
// ---------------------------------------------------------------------------

describe("buildRenderTree — enum (untyped)", () => {
  it("builds an enum node for mixed-type enums with no type", async () => {
    const node = await root({ enum: [1, "two", true] });
    expect(node).toMatchObject({ kind: "enum", options: [1, "two", true] });
  });

  it("carries title and description", async () => {
    const node = await root({
      enum: ["a", "b"],
      title: "Choice",
      description: "Pick one",
    });
    expect(node).toMatchObject({
      kind: "enum",
      title: "Choice",
      description: "Pick one",
    });
  });
});

// ---------------------------------------------------------------------------
// Object
// ---------------------------------------------------------------------------

describe("buildRenderTree — object", () => {
  it("builds an object node", async () => {
    const node = await root({ type: "object" });
    expect(node.kind).toBe("object");
  });

  it("builds children for each property", async () => {
    const node = await root({
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "number" },
      },
    });
    if (node.kind !== "object") throw new Error("expected object node");
    expect(node.children).toHaveLength(2);
    expect(node.children.map((c) => c.kind)).toEqual(["string", "number"]);
  });

  it("marks non-required properties as optional", async () => {
    const node = await root({
      type: "object",
      properties: {
        a: { type: "string" },
        b: { type: "string" },
      },
      required: ["a"],
    });
    if (node.kind !== "object") throw new Error("expected object node");
    const a = node.children.find((c) => c.path === "a")!;
    const b = node.children.find((c) => c.path === "b")!;
    expect(a.optional).toBe(false);
    expect(b.optional).toBe(true);
  });

  it("builds nested paths with dot notation", async () => {
    const node = await root({
      type: "object",
      properties: {
        address: {
          type: "object",
          properties: { city: { type: "string" } },
        },
      },
    });
    if (node.kind !== "object") throw new Error("expected object node");
    const address = node.children[0];
    if (address.kind !== "object")
      throw new Error("expected nested object node");
    expect(address.children[0].path).toBe("address.city");
  });

  it("infers object from properties keyword (no explicit type)", async () => {
    const node = await root({
      properties: { x: { type: "number" } },
    });
    expect(node.kind).toBe("object");
  });

  it("exposes the required Set on the node", async () => {
    const node = await root({
      type: "object",
      properties: { a: { type: "string" } },
      required: ["a"],
    });
    if (node.kind !== "object") throw new Error("expected object node");
    expect(node.required.has("a")).toBe(true);
  });

  it("skips boolean sub-schemas in properties", async () => {
    const node = await root({
      type: "object",
      properties: {
        allowed: true as any,
        denied: false as any,
        real: { type: "string" },
      },
    });
    if (node.kind !== "object") throw new Error("expected object node");
    expect(node.children).toHaveLength(1);
    expect(node.children[0].path).toBe("real");
  });
});

// ---------------------------------------------------------------------------
// Array
// ---------------------------------------------------------------------------

describe("buildRenderTree — array", () => {
  it("builds an array node", async () => {
    const node = await root({ type: "array" });
    expect(node.kind).toBe("array");
  });

  it("builds itemNode from items schema", async () => {
    const node = await root({
      type: "array",
      items: { type: "string" },
    });
    if (node.kind !== "array") throw new Error("expected array node");
    expect(node.itemNode.kind).toBe("string");
  });

  it("uses an empty unknown itemNode when no items defined", async () => {
    const node = await root({ type: "array" });
    if (node.kind !== "array") throw new Error("expected array node");
    expect(node.itemNode.kind).toBe("unknown");
  });

  it("builds itemNode path as <path>.*", async () => {
    const node = await root({
      type: "array",
      items: { type: "number" },
    });
    if (node.kind !== "array") throw new Error("expected array node");
    expect(node.itemNode.path).toBe(".*");
  });

  it("carries minItems and maxItems", async () => {
    const node = await root({
      type: "array",
      items: { type: "string" },
      minItems: 1,
      maxItems: 5,
    });
    expect(node).toMatchObject({ kind: "array", minItems: 1, maxItems: 5 });
  });

  it("merges tuple items (array of schemas) via allOf", async () => {
    const node = await root({
      type: "array",
      items: [
        { type: "string", properties: { a: { type: "string" } } },
        { type: "object", properties: { b: { type: "number" } } },
      ] as any,
    });
    if (node.kind !== "array") throw new Error("expected array node");
    if (node.itemNode.kind !== "object")
      throw new Error("expected object node");
    expect(node.itemNode.children.map((c) => c.kind)).toEqual([
      "string",
      "number",
    ]);
  });

  it("infers array from items keyword (no explicit type)", async () => {
    const node = await root({ items: { type: "boolean" } });
    expect(node.kind).toBe("array");
  });
});

// ---------------------------------------------------------------------------
// $ref resolution
// ---------------------------------------------------------------------------

describe("buildRenderTree — $ref", () => {
  it("resolves a $ref to a definition", async () => {
    const node = await root({
      $ref: "#/$defs/Name",
      $defs: { Name: { type: "string" } },
    });
    expect(node.kind).toBe("string");
  });

  it("resolves a $ref inside object properties", async () => {
    const schema = {
      type: "object",
      $defs: { Age: { type: "number" } },
      properties: { age: { $ref: "#/$defs/Age" } },
    } satisfies JSONSchema7;
    const node = await root(schema);
    if (node.kind !== "object") throw new Error("expected object node");
    expect(node.children[0].kind).toBe("number");
  });
});

// ---------------------------------------------------------------------------
// Composition — allOf
// ---------------------------------------------------------------------------

describe("buildRenderTree — allOf", () => {
  it("merges allOf into a single object node", async () => {
    const node = await root({
      allOf: [
        { type: "object", properties: { a: { type: "string" } } },
        { properties: { b: { type: "number" } } },
      ],
    });
    if (node.kind !== "object") throw new Error("expected object node");
    expect(node.children.map((c) => c.path)).toEqual(["a", "b"]);
  });
});

// ---------------------------------------------------------------------------
// Composition — oneOf / anyOf
// ---------------------------------------------------------------------------

describe("buildRenderTree — oneOf / anyOf (multi-variant)", () => {
  it("builds a oneOf variant node for multiple oneOf schemas", async () => {
    const node = await root({
      oneOf: [{ type: "string" }, { type: "number" }],
    });
    expect(node.kind).toBe("oneOf");
    if (node.kind !== "oneOf") throw new Error("expected oneOf node");
    expect(node.variants).toHaveLength(2);
    expect(node.variants.map(kindOf)).toEqual(["string", "number"]);
  });

  it("builds a oneOf variant node for multiple anyOf schemas", async () => {
    const node = await root({
      anyOf: [{ type: "boolean" }, { type: "string" }],
    });
    expect(node.kind).toBe("oneOf");
    if (node.kind !== "oneOf") throw new Error("expected oneOf node");
    expect(node.variants).toHaveLength(2);
  });

  it("inlines a single-variant oneOf", async () => {
    const node = await root({ oneOf: [{ type: "string" }] });
    expect(node.kind).toBe("string");
  });

  it("inlines a single-variant anyOf", async () => {
    const node = await root({ anyOf: [{ type: "number" }] });
    expect(node.kind).toBe("number");
  });

  it("propagates parent title/description to the variant node", async () => {
    const node = await root({
      title: "Union",
      description: "One of these",
      oneOf: [{ type: "string" }, { type: "number" }],
    });
    expect(node).toMatchObject({ title: "Union", description: "One of these" });
  });
});

// ---------------------------------------------------------------------------
// path argument
// ---------------------------------------------------------------------------

describe("buildRenderTree — path", () => {
  it("uses the provided root path", async () => {
    const node = await root({ type: "string" }, "root");
    expect(node.path).toBe("root");
  });

  it("defaults to empty string path", async () => {
    const node = await root({ type: "string" });
    expect(node.path).toBe("");
  });
});

// ---------------------------------------------------------------------------
// Integration — real example schemas
// ---------------------------------------------------------------------------

describe("buildRenderTree — address example", () => {
  it("produces an object node", async () => {
    const node = await root(addressSchema as JSONSchema7);
    expect(node.kind).toBe("object");
  });

  it("has all 7 properties as string children", async () => {
    const node = await root(addressSchema as JSONSchema7);
    if (node.kind !== "object") throw new Error("expected object");
    expect(node.children).toHaveLength(7);
    expect(node.children.every((c) => c.kind === "string")).toBe(true);
  });

  it("marks locality, region, countryName as required", async () => {
    const node = await root(addressSchema as JSONSchema7);
    if (node.kind !== "object") throw new Error("expected object");
    expect(node.required).toEqual(
      new Set(["locality", "region", "countryName"]),
    );
    const locality = node.children.find((c) => c.path === "locality")!;
    const postalCode = node.children.find((c) => c.path === "postalCode")!;
    expect(locality.optional).toBe(false);
    expect(postalCode.optional).toBe(true);
  });
});

describe("buildRenderTree — blog-post example", () => {
  it("produces an object node with 5 children", async () => {
    const node = await root(blogPostSchema as JSONSchema7);
    if (node.kind !== "object") throw new Error("expected object");
    expect(node.children).toHaveLength(5);
  });

  it("renders publishedDate as a string with format=date-time", async () => {
    const node = await root(blogPostSchema as JSONSchema7);
    if (node.kind !== "object") throw new Error("expected object");
    const date = node.children.find((c) => c.path === "publishedDate")!;
    expect(date).toMatchObject({ kind: "string", format: "date-time" });
  });

  it("renders tags as an array of strings", async () => {
    const node = await root(blogPostSchema as JSONSchema7);
    if (node.kind !== "object") throw new Error("expected object");
    const tags = node.children.find((c) => c.path === "tags")!;
    expect(tags.kind).toBe("array");
    if (tags.kind !== "array") throw new Error("expected array");
    expect(tags.itemNode.kind).toBe("string");
  });
});

describe("buildRenderTree — calendar example", () => {
  it("produces an object node", async () => {
    const node = await root(calendarSchema as JSONSchema7);
    expect(node.kind).toBe("object");
  });

  it("has 11 properties", async () => {
    const node = await root(calendarSchema as JSONSchema7);
    if (node.kind !== "object") throw new Error("expected object");
    expect(node.children).toHaveLength(11);
  });

  it("renders all scalar fields as strings", async () => {
    const node = await root(calendarSchema as JSONSchema7);
    if (node.kind !== "object") throw new Error("expected object");
    const scalars = node.children.filter((c) => c.path !== "geo");
    expect(scalars.every((c) => c.kind === "string")).toBe(true);
  });
});

describe("buildRenderTree — device example", () => {
  it("produces a oneOf variant node with 2 variants", async () => {
    const node = await root(deviceSchema as JSONSchema7);
    expect(node.kind).toBe("oneOf");
    if (node.kind !== "oneOf") throw new Error("expected oneOf");
    expect(node.variants).toHaveLength(2);
  });

  it("each variant is an object node", async () => {
    const node = await root(deviceSchema as JSONSchema7);
    if (node.kind !== "oneOf") throw new Error("expected oneOf");
    expect(node.variants.every((v) => v.kind === "object")).toBe(true);
  });
});

describe("buildRenderTree — ecommerce example", () => {
  it("does not throw", async () => {
    await expect(root(ecommerceSchema as JSONSchema7)).resolves.toBeDefined();
  });
});

describe("buildRenderTree — geographical-location example", () => {
  it("produces an object node", async () => {
    const node = await root(geoSchema as JSONSchema7);
    expect(node.kind).toBe("object");
  });

  it("has latitude and longitude as number children with min/max", async () => {
    const node = await root(geoSchema as JSONSchema7);
    if (node.kind !== "object") throw new Error("expected object");
    const lat = node.children.find((c) => c.path === "latitude")!;
    const lon = node.children.find((c) => c.path === "longitude")!;
    expect(lat).toMatchObject({ kind: "number", min: -90, max: 90 });
    expect(lon).toMatchObject({ kind: "number", min: -180, max: 180 });
  });

  it("marks both fields as required", async () => {
    const node = await root(geoSchema as JSONSchema7);
    if (node.kind !== "object") throw new Error("expected object");
    expect(node.required).toEqual(new Set(["latitude", "longitude"]));
    expect(node.children.every((c) => c.optional === false)).toBe(true);
  });
});

describe("buildRenderTree — health-record example", () => {
  it("produces an object node", async () => {
    const node = await root(healthRecordSchema as JSONSchema7);
    expect(node.kind).toBe("object");
  });

  it("renders dateOfBirth as string with format=date", async () => {
    const node = await root(healthRecordSchema as JSONSchema7);
    if (node.kind !== "object") throw new Error("expected object");
    const dob = node.children.find((c) => c.path === "dateOfBirth")!;
    expect(dob).toMatchObject({ kind: "string", format: "date" });
  });

  it("renders array fields (allergies, conditions, medications) with string items", async () => {
    const node = await root(healthRecordSchema as JSONSchema7);
    if (node.kind !== "object") throw new Error("expected object");
    for (const field of ["allergies", "conditions", "medications"]) {
      const child = node.children.find((c) => c.path === field)!;
      expect(child.kind).toBe("array");
      if (child.kind !== "array")
        throw new Error(`expected array for ${field}`);
      expect(child.itemNode.kind).toBe("string");
    }
  });
});

describe("buildRenderTree — job-posting example", () => {
  it("produces an object node", async () => {
    const node = await root(jobPostingSchema as JSONSchema7);
    expect(node.kind).toBe("object");
  });

  it("renders salary as a number with min=0", async () => {
    const node = await root(jobPostingSchema as JSONSchema7);
    if (node.kind !== "object") throw new Error("expected object");
    const salary = node.children.find((c) => c.path === "salary")!;
    expect(salary).toMatchObject({ kind: "number", min: 0 });
  });

  it("renders applicationDeadline as string with format=date", async () => {
    const node = await root(jobPostingSchema as JSONSchema7);
    if (node.kind !== "object") throw new Error("expected object");
    const deadline = node.children.find(
      (c) => c.path === "applicationDeadline",
    )!;
    expect(deadline).toMatchObject({ kind: "string", format: "date" });
  });

  it("marks title, company, location, description as required", async () => {
    const node = await root(jobPostingSchema as JSONSchema7);
    if (node.kind !== "object") throw new Error("expected object");
    expect(node.required).toEqual(
      new Set(["title", "company", "location", "description"]),
    );
  });
});

describe("buildRenderTree — movie example", () => {
  it("produces an object node", async () => {
    const node = await root(movieSchema as JSONSchema7);
    expect(node.kind).toBe("object");
  });

  it("renders genre as a string node with enum options", async () => {
    const node = await root(movieSchema as JSONSchema7);
    if (node.kind !== "object") throw new Error("expected object");
    const genre = node.children.find((c) => c.path === "genre")!;
    expect(genre).toMatchObject({
      kind: "string",
      options: ["Action", "Comedy", "Drama", "Science Fiction"],
    });
  });

  it("renders cast as an array of strings", async () => {
    const node = await root(movieSchema as JSONSchema7);
    if (node.kind !== "object") throw new Error("expected object");
    const cast = node.children.find((c) => c.path === "cast")!;
    expect(cast.kind).toBe("array");
    if (cast.kind !== "array") throw new Error("expected array");
    expect(cast.itemNode.kind).toBe("string");
  });
});

describe("buildRenderTree — user-profile example", () => {
  it("produces an object node", async () => {
    const node = await root(userProfileSchema as JSONSchema7);
    expect(node.kind).toBe("object");
  });

  it("renders email as string with format=email", async () => {
    const node = await root(userProfileSchema as JSONSchema7);
    if (node.kind !== "object") throw new Error("expected object");
    const email = node.children.find((c) => c.path === "email")!;
    expect(email).toMatchObject({ kind: "string", format: "email" });
  });

  it("renders age as number with min=0", async () => {
    const node = await root(userProfileSchema as JSONSchema7);
    if (node.kind !== "object") throw new Error("expected object");
    const age = node.children.find((c) => c.path === "age")!;
    expect(age).toMatchObject({ kind: "number", min: 0 });
  });

  it("renders interests as an array of strings", async () => {
    const node = await root(userProfileSchema as JSONSchema7);
    if (node.kind !== "object") throw new Error("expected object");
    const interests = node.children.find((c) => c.path === "interests")!;
    expect(interests.kind).toBe("array");
    if (interests.kind !== "array") throw new Error("expected array");
    expect(interests.itemNode.kind).toBe("string");
  });

  it("marks username and email as required", async () => {
    const node = await root(userProfileSchema as JSONSchema7);
    if (node.kind !== "object") throw new Error("expected object");
    expect(node.required).toEqual(new Set(["username", "email"]));
  });
});
