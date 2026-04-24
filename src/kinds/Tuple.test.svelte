<script lang="ts">
  import type { JSONSchema7 } from "json-schema";
  import { Sweater } from "../../suede/sweater-vest-suede";
  import { Model, Schema, root } from "../../release";
  import { Pocket } from "../common.svelte";
</script>

<Sweater config>
  <Sweater
    lazy
    name="each tuple position is rendered with its concrete path"
    body={async ({ set, expect, container }) => {
      set(
        new Pocket(
          new Model("edit", { coords: [10, 20] }),
          await root({
            type: "object",
            properties: {
              coords: {
                type: "array",
                items: [{ type: "number" }, { type: "number" }],
              },
            },
            required: ["coords"],
          } as JSONSchema7),
        ),
      );
      expect(container.querySelector('[data-path="coords.0"]')).not.toBeNull();
      expect(container.querySelector('[data-path="coords.1"]')).not.toBeNull();
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="tuple positions render inputs matching their schema types"
    body={async ({ set, expect, container }) => {
      set(
        new Pocket(
          new Model("edit", { pair: ["hello", 42] }),
          await root({
            type: "object",
            properties: {
              pair: {
                type: "array",
                items: [{ type: "string" }, { type: "number" }],
              },
            },
            required: ["pair"],
          } as JSONSchema7),
        ),
      );
      const firstInput = container.querySelector(
        '[data-path="pair.0"] input',
      ) as HTMLInputElement | null;
      const secondInput = container.querySelector(
        '[data-path="pair.1"] input',
      ) as HTMLInputElement | null;
      expect(firstInput).not.toBeNull();
      expect(firstInput!.type).toBe("text");
      expect(secondInput).not.toBeNull();
      expect(secondInput!.type).toBe("number");
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="no push or splice buttons are rendered for tuples"
    body={async ({ set, expect, container }) => {
      set(
        new Pocket(
          new Model("edit", { coords: [0, 0] }),
          await root({
            type: "object",
            properties: {
              coords: {
                type: "array",
                items: [{ type: "number" }, { type: "number" }],
              },
            },
            required: ["coords"],
          } as JSONSchema7),
        ),
      );
      expect(container.querySelector('[data-action="push"]')).toBeNull();
      expect(container.querySelector('[data-action="splice"]')).toBeNull();
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="tuple nested inside an array resolves item paths correctly"
    body={async ({ set, expect, container }) => {
      set(
        new Pocket(
          new Model("edit", {
            points: [
              [1, 2],
              [3, 4],
            ],
          }),
          await root({
            type: "object",
            properties: {
              points: {
                type: "array",
                items: {
                  type: "array",
                  items: [{ type: "number" }, { type: "number" }],
                },
              },
            },
            required: ["points"],
          } as JSONSchema7),
        ),
      );
      expect(
        container.querySelector('[data-path="points.0.0"]'),
      ).not.toBeNull();
      expect(
        container.querySelector('[data-path="points.1.1"]'),
      ).not.toBeNull();
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>
</Sweater>
