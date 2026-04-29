<script lang="ts">
  import type { JSONSchema7 } from "json-schema";
  import { Sweater } from "../../.suede/sweater-vest-suede";
  import { Model, Schema, root } from "../../release";
  import { Pocket } from "../common.svelte";
</script>

<Sweater config>
  <Sweater
    lazy
    name="string input is disabled"
    body={async ({ set, expect, container }) => {
      set(
        new Pocket(
          new Model("view", { name: "Alice" }),
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
      expect(input.disabled).toBe(true);
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="checkbox is disabled"
    body={async ({ set, expect, container }) => {
      set(
        new Pocket(
          new Model("view", { active: true }),
          await root({
            type: "object",
            properties: { active: { type: "boolean" } },
            required: ["active"],
          } as JSONSchema7),
        ),
      );
      const checkbox = container.querySelector(
        '[data-path="active"] input[type="checkbox"]',
      ) as HTMLInputElement;
      expect(checkbox.disabled).toBe(true);
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="opt-in and opt-out buttons are absent for optional fields"
    body={async ({ set, expect, container }) => {
      set(
        new Pocket(
          new Model("view", { nickname: "Neo" }),
          await root({
            type: "object",
            properties: { nickname: { type: "string" } },
          } as JSONSchema7),
        ),
      );
      expect(container.querySelector('[data-action="opt-out"]')).toBeNull();
      expect(container.querySelector('[data-action="opt-in"]')).toBeNull();
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="array has no push or splice buttons"
    body={async ({ set, expect, container }) => {
      set(
        new Pocket(
          new Model("view", { tags: ["alpha", "beta"] }),
          await root({
            type: "object",
            properties: { tags: { type: "array", items: { type: "string" } } },
            required: ["tags"],
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
</Sweater>
