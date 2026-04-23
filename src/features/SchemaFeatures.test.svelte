<script lang="ts">
  import type { JSONSchema7 } from "json-schema";
  import { Sweater } from "../../suede/sweater-vest-suede";
  import { Model, Schema, root } from "../../release";
  import { Pocket } from "../common.svelte";
</script>

<Sweater config>
  <Sweater
    lazy
    name="title attribute appears in the field label"
    body={async ({ set, expect, container }) => {
      set(
        new Pocket(
          new Model("edit", { firstName: "" }),
          await root({
            type: "object",
            properties: { firstName: { type: "string", title: "First Name" } },
            required: ["firstName"],
          } as JSONSchema7),
        ),
      );
      const nameEl = container.querySelector(
        '[data-path="firstName"] [data-role="name"]',
      );
      expect(nameEl?.textContent?.trim()).toBe("First Name");
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="allOf merges properties from multiple sub-schemas"
    body={async ({ set, expect, container }) => {
      set(
        new Pocket(
          new Model("edit", { name: "", age: 0 }),
          await root({
            allOf: [
              {
                type: "object",
                properties: { name: { type: "string" } },
                required: ["name"],
              },
              {
                type: "object",
                properties: { age: { type: "number" } },
                required: ["age"],
              },
            ],
          } as JSONSchema7),
        ),
      );
      expect(container.querySelector('[data-path="name"]')).not.toBeNull();
      expect(container.querySelector('[data-path="age"]')).not.toBeNull();
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="$ref is resolved to the referenced definition"
    body={async ({ set, expect, container }) => {
      set(
        new Pocket(
          new Model("edit", { name: "" }),
          await root({
            definitions: { Name: { type: "string", title: "Full Name" } },
            type: "object",
            properties: { name: { $ref: "#/definitions/Name" } },
            required: ["name"],
          } as JSONSchema7),
        ),
      );
      const nameEl = container.querySelector(
        '[data-path="name"] [data-role="name"]',
      );
      expect(nameEl?.textContent?.trim()).toBe("Full Name");
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="path abbreviation shows basename not full path in label"
    body={async ({ set, expect, container }) => {
      set(
        new Pocket(
          new Model("edit", { address: { streetName: "" } }),
          await root({
            type: "object",
            properties: {
              address: {
                type: "object",
                properties: { streetName: { type: "string" } },
                required: ["streetName"],
              },
            },
            required: ["address"],
          } as JSONSchema7),
        ),
      );
      const nameEl = container.querySelector(
        '[data-path="address.streetName"] [data-role="name"]',
      );
      expect(nameEl?.textContent?.trim()).toBe("streetName");
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>
</Sweater>
