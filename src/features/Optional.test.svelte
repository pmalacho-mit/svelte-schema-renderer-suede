<script lang="ts">
  import type { JSONSchema7 } from "json-schema";
  import { Sweater } from "../../suede/sweater-vest-suede";
  import { Model, Schema, root } from "../../release";
  import { Pocket } from "../common.svelte";

  const schema = {
    type: "object",
    properties: { nickname: { type: "string" } },
  } as JSONSchema7;
</script>

<Sweater config>
  <Sweater
    lazy
    name="absent optional field shows opt-in not an input"
    body={async ({ set, expect, container }) => {
      set(new Pocket(new Model("edit", {}), await root(schema)));
      expect(container.querySelector('[data-action="opt-in"]')).not.toBeNull();
      expect(
        container.querySelector('[data-path="nickname"] input'),
      ).toBeNull();
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="clicking opt-in reveals the input field"
    body={async ({ set, expect, container, withUserFocus }) => {
      set(new Pocket(new Model("edit", {}), await root(schema)));
      const optIn = container.querySelector(
        '[data-action="opt-in"]',
      ) as HTMLButtonElement;
      await withUserFocus((userEvent) => userEvent.click(optIn));
      expect(
        container.querySelector('[data-path="nickname"] input'),
      ).not.toBeNull();
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="required field has no opt-in button"
    body={async ({ set, expect, container }) => {
      set(
        new Pocket(
          new Model("edit", { name: "" }),
          await root({
            type: "object",
            properties: { name: { type: "string" } },
            required: ["name"],
          } as JSONSchema7),
        ),
      );
      expect(container.querySelector('[data-action="opt-in"]')).toBeNull();
      expect(
        container.querySelector('[data-path="name"] input'),
      ).not.toBeNull();
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="a present optional field shows an opt-out button"
    body={async ({ set, expect, container }) => {
      set(
        new Pocket(new Model("edit", { nickname: "Neo" }), await root(schema)),
      );
      expect(container.querySelector('[data-action="opt-out"]')).not.toBeNull();
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="clicking opt-out removes the value and shows opt-in again"
    body={async ({ set, expect, container, withUserFocus }) => {
      const pocket = set(
        new Pocket(new Model("edit", { nickname: "Neo" }), await root(schema)),
      );
      const optOut = container.querySelector(
        '[data-action="opt-out"]',
      ) as HTMLButtonElement;
      await withUserFocus((userEvent) => userEvent.click(optOut));
      expect(
        pocket.model.get({ kind: "string", path: "nickname" }),
      ).toBeUndefined();
      expect(container.querySelector('[data-action="opt-in"]')).not.toBeNull();
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>
</Sweater>
