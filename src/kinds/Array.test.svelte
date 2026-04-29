<script lang="ts">
  import type { JSONSchema7 } from "json-schema";
  import { Sweater } from "../../.suede/sweater-vest-suede";
  import { Model, Schema, root } from "../../release";
  import { Pocket } from "../common.svelte";
</script>

<Sweater config>
  <Sweater
    lazy
    name="existing items are rendered"
    body={async ({ set, expect, container }) => {
      set(
        new Pocket(
          new Model("edit", { tags: ["alpha", "beta"] }),
          await root({
            type: "object",
            properties: { tags: { type: "array", items: { type: "string" } } },
            required: ["tags"],
          } as JSONSchema7),
        ),
      );
      expect(container.querySelectorAll('[data-path^="tags."]').length).toBe(2);
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="push button adds a new item"
    body={async ({ set, expect, container, withUserFocus }) => {
      const pocket = set(
        new Pocket(
          new Model("edit", { tags: [] }),
          await root({
            type: "object",
            properties: { tags: { type: "array", items: { type: "string" } } },
            required: ["tags"],
          } as JSONSchema7),
        ),
      );
      await withUserFocus(
        async ({ click }) =>
          await click(container.querySelector('[data-action="push"]')!),
      );
      expect(pocket.model!.get<"array">({ path: "tags" })!.length).toBe(1);
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="splice button removes an item"
    body={async ({ set, expect, container, withUserFocus }) => {
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

      await withUserFocus(({ click }) =>
        click(container.querySelector('[data-action="splice"]')!),
      );
      expect(pocket.model!.get<"array">({ path: "tags" })!.length).toBe(1);
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="push button is absent when maxItems is reached"
    body={async ({ set, expect, container }) => {
      set(
        new Pocket(
          new Model("edit", { tags: ["alpha", "beta"] }),
          await root({
            type: "object",
            properties: {
              tags: { type: "array", items: { type: "string" }, maxItems: 2 },
            },
            required: ["tags"],
          } as JSONSchema7),
        ),
      );
      expect(container.querySelector('[data-action="push"]')).toBeNull();
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="array of objects renders fieldsets with correct child paths"
    body={async ({ set, expect, container }) => {
      set(
        new Pocket(
          new Model("edit", {
            people: [
              { name: "Alice", age: 30 },
              { name: "Bob", age: 25 },
            ],
          }),
          await root({
            type: "object",
            properties: {
              people: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    age: { type: "number" },
                  },
                  required: ["name", "age"],
                },
              },
            },
            required: ["people"],
          } as JSONSchema7),
        ),
      );
      expect(
        container.querySelector('[data-path="people.0.name"]'),
      ).not.toBeNull();
      expect(
        container.querySelector('[data-path="people.1.age"]'),
      ).not.toBeNull();
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>
</Sweater>
