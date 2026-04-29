<script lang="ts">
  import type { JSONSchema7 } from "json-schema";
  import { Sweater } from "../../.suede/sweater-vest-suede";
  import { Model, Schema, root } from "../../release";
  import { Pocket } from "../common.svelte";
</script>

<Sweater config>
  <Sweater
    lazy
    name="renders a number input"
    body={async ({ set, expect, container }) => {
      set(
        new Pocket(
          new Model("edit", { age: 0 }),
          await root({
            type: "object",
            properties: { age: { type: "number" } },
            required: ["age"],
          } as JSONSchema7),
        ),
      );
      const input = container.querySelector(
        '[data-path="age"] input',
      ) as HTMLInputElement | null;
      expect(input).not.toBeNull();
      expect(input!.type).toBe("number");
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="minimum and maximum propagate to input attributes"
    body={async ({ set, expect, container }) => {
      set(
        new Pocket(
          new Model("edit", { rating: 5 }),
          await root({
            type: "object",
            properties: { rating: { type: "number", minimum: 1, maximum: 10 } },
            required: ["rating"],
          } as JSONSchema7),
        ),
      );
      const input = container.querySelector(
        '[data-path="rating"] input',
      ) as HTMLInputElement | null;
      expect(input).not.toBeNull();
      expect(Number(input!.min)).toBe(1);
      expect(Number(input!.max)).toBe(10);
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="enum options render as a select element"
    body={async ({ set, expect, container }) => {
      set(
        new Pocket(
          new Model("edit", { priority: 1 }),
          await root({
            type: "object",
            properties: { priority: { type: "number", enum: [1, 2, 3] } },
            required: ["priority"],
          } as JSONSchema7),
        ),
      );
      const select = container.querySelector(
        '[data-path="priority"] select',
      ) as HTMLSelectElement | null;
      expect(select).not.toBeNull();
      const opts = Array.from(select!.options).filter((o) => !o.disabled);
      expect(opts.length).toBe(3);
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>
</Sweater>
