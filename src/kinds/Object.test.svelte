<script lang="ts">
  import type { JSONSchema7 } from "json-schema";
  import { Sweater } from "../../suede/sweater-vest-suede";
  import { Model, Schema, root } from "../../release";
  import { Pocket } from "../common.svelte";
</script>

<Sweater config>
  <Sweater
    lazy
    name="renders a fieldset with its title as the legend"
    body={async ({ set, expect, container }) => {
      set(
        new Pocket(
          new Model("edit", { name: "", age: 0 }),
          await root({
            type: "object",
            title: "User",
            properties: { name: { type: "string" }, age: { type: "number" } },
            required: ["name", "age"],
          } as JSONSchema7),
        ),
      );
      const fieldset = container.querySelector("fieldset");
      expect(fieldset).not.toBeNull();
      expect(fieldset!.querySelector("legend")?.textContent?.trim()).toBe(
        "User",
      );
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="all properties are rendered as children"
    body={async ({ set, expect, container }) => {
      set(
        new Pocket(
          new Model("edit", { name: "", age: 0, active: false }),
          await root({
            type: "object",
            properties: {
              name: { type: "string" },
              age: { type: "number" },
              active: { type: "boolean" },
            },
            required: ["name", "age", "active"],
          } as JSONSchema7),
        ),
      );
      expect(container.querySelector('[data-path="name"]')).not.toBeNull();
      expect(container.querySelector('[data-path="age"]')).not.toBeNull();
      expect(container.querySelector('[data-path="active"]')).not.toBeNull();
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="nested objects render as nested fieldsets with correct paths"
    body={async ({ set, expect, container }) => {
      set(
        new Pocket(
          new Model("edit", { address: { street: "", city: "" } }),
          await root({
            type: "object",
            properties: {
              address: {
                type: "object",
                properties: {
                  street: { type: "string" },
                  city: { type: "string" },
                },
                required: ["street", "city"],
              },
            },
            required: ["address"],
          } as JSONSchema7),
        ),
      );
      expect(
        container.querySelectorAll("fieldset").length,
      ).toBeGreaterThanOrEqual(2);
      expect(
        container.querySelector('[data-path="address.street"]'),
      ).not.toBeNull();
      expect(
        container.querySelector('[data-path="address.city"]'),
      ).not.toBeNull();
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>
</Sweater>
