<script lang="ts">
  import type { JSONSchema7 } from "json-schema";
  import { Sweater } from "../../suede/sweater-vest-suede";
  import { Model, Schema, root } from "../../release";
  import { Pocket } from "../common.svelte";
</script>

<Sweater config>
  <Sweater
    lazy
    name="model.element returns the div for a top-level field"
    body={async ({ set, expect }) => {
      const pocket = set(
        new Pocket(
          new Model("edit", { name: "" }),
          await root({
            type: "object",
            properties: { name: { type: "string" } },
            required: ["name"],
          } as JSONSchema7),
        ),
      );
      const element = pocket.model.element({ path: "name" });
      expect(element).not.toBeNull();
      expect(element?.dataset.path).toBe("name");
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="model.element returns the div for a nested field"
    body={async ({ set, expect }) => {
      const pocket = set(
        new Pocket(
          new Model("edit", { address: { city: "" } }),
          await root({
            type: "object",
            properties: {
              address: {
                type: "object",
                properties: { city: { type: "string" } },
                required: ["city"],
              },
            },
            required: ["address"],
          } as JSONSchema7),
        ),
      );
      const element = pocket.model.element({ path: "address.city" });
      expect(element).not.toBeNull();
      expect(element?.dataset.path).toBe("address.city");
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="model.element returns the div for an array item"
    body={async ({ set, expect }) => {
      const pocket = set(
        new Pocket(
          new Model("edit", { tags: ["alpha", "beta"] }),
          await root({
            type: "object",
            properties: { tags: { type: "array", items: { type: "string" } } },
            required: ["tags"],
          } as JSONSchema7),
        ),
      );
      const element0 = pocket.model.element({ path: "tags.0" });
      const element1 = pocket.model.element({ path: "tags.1" });
      expect(element0).not.toBeNull();
      expect(element0?.dataset.path).toBe("tags.0");
      expect(element1).not.toBeNull();
      expect(element1?.dataset.path).toBe("tags.1");
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="model.element returns the div for a field nested inside an array item"
    body={async ({ set, expect }) => {
      const pocket = set(
        new Pocket(
          new Model("edit", { people: [{ name: "Alice" }, { name: "Bob" }] }),
          await root({
            type: "object",
            properties: {
              people: {
                type: "array",
                items: {
                  type: "object",
                  properties: { name: { type: "string" } },
                  required: ["name"],
                },
              },
            },
            required: ["people"],
          } as JSONSchema7),
        ),
      );
      const element0 = pocket.model.element({ path: "people.0.name" });
      const element1 = pocket.model.element({ path: "people.1.name" });
      expect(element0).not.toBeNull();
      expect(element0?.dataset.path).toBe("people.0.name");
      expect(element1).not.toBeNull();
      expect(element1?.dataset.path).toBe("people.1.name");
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="model.element returns undefined for an out-of-bounds array index"
    body={async ({ set, expect }) => {
      const pocket = set(
        new Pocket(
          new Model("edit", { tags: ["alpha"] }),
          await root({
            type: "object",
            properties: { tags: { type: "array", items: { type: "string" } } },
            required: ["tags"],
          } as JSONSchema7),
        ),
      );
      const element = pocket.model.element({ path: "tags.5" });
      expect(element).toBeUndefined();
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="model.element returns undefined for a non-existent path"
    body={async ({ set, expect }) => {
      const pocket = set(
        new Pocket(
          new Model("edit", { name: "" }),
          await root({
            type: "object",
            properties: { name: { type: "string" } },
            required: ["name"],
          } as JSONSchema7),
        ),
      );
      const element = pocket.model.element({ path: "does.not.exist" });
      expect(element).toBeUndefined();
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>
</Sweater>
