<script lang="ts">
  import type { JSONSchema7 } from "json-schema";
  import { Sweater } from "../../.suede/sweater-vest-suede";
  import { Model, Schema, root } from "../../release";
  import { Pocket } from "../common.svelte";

  const primitiveOneOf = {
    oneOf: [
      { type: "string", title: "Text" },
      { type: "number", title: "Count" },
    ],
  } as JSONSchema7;
</script>

<Sweater config>
  <Sweater
    lazy
    name="renders a variant selector dropdown"
    body={async ({ set, expect, container }) => {
      set(
        new Pocket(
          new Model("edit", { contact: {} }),
          await root({
            type: "object",
            properties: {
              contact: {
                oneOf: [
                  {
                    type: "object",
                    title: "Email",
                    properties: { email: { type: "string", format: "email" } },
                    required: ["email"],
                  },
                  {
                    type: "object",
                    title: "Phone",
                    properties: { phone: { type: "string" } },
                    required: ["phone"],
                  },
                ],
              },
            },
            required: ["contact"],
          } as JSONSchema7),
        ),
      );
      expect(
        container.querySelector('[data-role="variant-selector"] select'),
      ).not.toBeNull();
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="option labels in the selector match schema titles"
    body={async ({ set, expect, container }) => {
      set(
        new Pocket(
          new Model("edit", {} as any),
          await root({
            oneOf: [
              { type: "string", title: "Text" },
              { type: "number", title: "Count" },
              { type: "boolean", title: "Flag" },
            ],
          } as JSONSchema7),
        ),
      );
      const select = container.querySelector(
        '[data-role="variant-selector"] select',
      ) as HTMLSelectElement;
      const labels = Array.from(select.options)
        .filter((o) => !o.disabled)
        .map((o) => o.text);
      expect(labels).toEqual(["Text", "Count", "Flag"]);
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="selecting a variant renders its fields"
    body={async ({ set, expect, container, withUserFocus }) => {
      set(new Pocket(new Model("edit", {} as any), await root(primitiveOneOf)));
      const select = container.querySelector(
        '[data-role="variant-selector"] select',
      ) as HTMLSelectElement;
      await withUserFocus(async (userEvent) => {
        await userEvent.selectOptions(select, "Text");
      });
      expect(container.querySelector('[data-kind="string"]')).not.toBeNull();
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="pre-selects the variant that matches existing data"
    body={async ({ set, expect, container }) => {
      set(new Pocket(new Model("edit", 42 as any), await root(primitiveOneOf)));
      expect(
        container.querySelector('[data-kind="number"] input'),
      ).not.toBeNull();
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>
</Sweater>
