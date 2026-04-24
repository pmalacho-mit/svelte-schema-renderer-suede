<script lang="ts">
  import type { JSONSchema7 } from "json-schema";
  import { Sweater } from "../../suede/sweater-vest-suede";
  import { Model, Schema, root } from "../../release";
  import { Pocket } from "../common.svelte";

  const schema = {
    type: "object",
    properties: { active: { type: "boolean" } },
    required: ["active"],
  } as JSONSchema7;
</script>

<Sweater config>
  <Sweater
    lazy
    name="renders a checkbox"
    body={async ({ set, expect, container }) => {
      set(new Pocket(new Model("edit", { active: false }), await root(schema)));
      expect(
        container.querySelector('[data-path="active"] input[type="checkbox"]'),
      ).not.toBeNull();
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="checkbox is pre-checked when data value is true"
    body={async ({ set, expect, container }) => {
      set(new Pocket(new Model("edit", { active: true }), await root(schema)));
      const checkbox = container.querySelector(
        '[data-path="active"] input[type="checkbox"]',
      ) as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="clicking the checkbox updates the model"
    body={async ({ set, expect, container, withUserFocus }) => {
      const pocket = set(
        new Pocket(new Model("edit", { active: false }), await root(schema)),
      );
      const checkbox = container.querySelector(
        '[data-path="active"] input[type="checkbox"]',
      ) as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
      await withUserFocus(async (userEvent) => {
        await userEvent.click(checkbox);
      });
      expect(pocket.model.get({ kind: "boolean", path: "active" })).toBe(true);
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>
</Sweater>
