<script lang="ts">
  import type { JSONSchema7 } from "json-schema";
  import { Sweater } from "../../.suede/sweater-vest-suede";
  import { Model, Schema, root } from "../../release";
  import { Pocket } from "../common.svelte";

  const schema = {
    type: "object",
    properties: { status: { enum: ["draft", "published", "archived"] } },
    required: ["status"],
  } as JSONSchema7;
</script>

<Sweater config>
  <Sweater
    lazy
    name="renders a select with all options"
    body={async ({ set, expect, container }) => {
      set(new Pocket(new Model("edit", {}), await root(schema)));
      const select = container.querySelector(
        '[data-kind="enum"] select',
      ) as HTMLSelectElement | null;
      expect(select).not.toBeNull();
      const opts = Array.from(select!.options).filter((o) => !o.disabled);
      expect(opts.map((o) => o.value)).toEqual([
        "draft",
        "published",
        "archived",
      ]);
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="selecting an option updates the model"
    body={async ({ set, expect, container, withUserFocus }) => {
      const pocket = set(new Pocket(new Model("edit", {}), await root(schema)));
      const select = container.querySelector(
        '[data-kind="enum"] select',
      ) as HTMLSelectElement;
      await withUserFocus((userEvent) =>
        userEvent.selectOptions(select, "published"),
      );
      expect(pocket.model.get({ path: "status" })).toBe("published");
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>
</Sweater>
