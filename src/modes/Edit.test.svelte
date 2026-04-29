<script lang="ts">
  import type { JSONSchema7 } from "json-schema";
  import { Sweater } from "../../.suede/sweater-vest-suede";
  import { Model, Schema, root } from "../../release";
  import { Pocket } from "../common.svelte";
  import { flushSync } from "svelte";
</script>

<Sweater config>
  <Sweater
    lazy
    name="inputs are enabled"
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
      expect(
        (
          container.querySelector(
            '[data-path="name"] input',
          ) as HTMLInputElement
        ).disabled,
      ).toBe(false);
      expect(
        (container.querySelector('[data-path="age"] input') as HTMLInputElement)
          .disabled,
      ).toBe(false);
      expect(
        (
          container.querySelector(
            '[data-path="active"] input',
          ) as HTMLInputElement
        ).disabled,
      ).toBe(false);
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="array has push and splice buttons"
    body={async ({ set, expect, container }) => {
      set(
        new Pocket(
          new Model("edit", { tags: ["alpha"] }),
          await root({
            type: "object",
            properties: { tags: { type: "array", items: { type: "string" } } },
            required: ["tags"],
          } as JSONSchema7),
        ),
      );
      expect(container.querySelector('[data-action="push"]')).not.toBeNull();
      expect(container.querySelector('[data-action="splice"]')).not.toBeNull();
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="programmatic model.set() updates are reflected in the input"
    body={async ({ set, expect, container }) => {
      const pocket = set(
        new Pocket(
          new Model("edit", { name: "Alice" }),
          await root({
            type: "object",
            properties: { name: { type: "string" } },
            required: ["name"],
          } as JSONSchema7),
        ),
      );
      const input = container.querySelector(
        '[data-path="name"] input',
      ) as HTMLInputElement;
      expect(input.value).toBe("Alice");
      flushSync(() => pocket.model.set({ path: "name" }, "Bob"));
      expect(input.value).toBe("Bob");
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>
</Sweater>
