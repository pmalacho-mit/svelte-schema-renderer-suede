<script lang="ts">
  import type { JSONSchema7 } from "json-schema";
  import { Sweater } from "../../suede/sweater-vest-suede";
  import { Model, Schema, root } from "../../release";
  import { Pocket } from "../common.svelte";
</script>

<Sweater config>
  <Sweater
    lazy
    name="renders a text input"
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
      const input = container.querySelector(
        '[data-path="name"] input',
      ) as HTMLInputElement | null;
      expect(input).not.toBeNull();
      expect(input!.type).toBe("text");
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="typing into the input updates the model"
    body={async ({ set, expect, container, withUserFocus }) => {
      const pocket = set(
        new Pocket(
          new Model("edit", { name: "" }),
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
      await withUserFocus(async (userEvent) => {
        await userEvent.type(input, "Alice");
      });
      expect(pocket.model.get({ kind: "string", path: "name" })).toBe("Alice");
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="email format renders type=email"
    body={async ({ set, expect, container }) => {
      set(
        new Pocket(
          new Model("edit", { email: "" }),
          await root({
            type: "object",
            properties: { email: { type: "string", format: "email" } },
            required: ["email"],
          } as JSONSchema7),
        ),
      );
      const input = container.querySelector(
        '[data-path="email"] input',
      ) as HTMLInputElement | null;
      expect(input).not.toBeNull();
      expect(input!.type).toBe("email");
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="date format renders type=date"
    body={async ({ set, expect, container }) => {
      set(
        new Pocket(
          new Model("edit", { birthday: "" }),
          await root({
            type: "object",
            properties: { birthday: { type: "string", format: "date" } },
            required: ["birthday"],
          } as JSONSchema7),
        ),
      );
      const input = container.querySelector(
        '[data-path="birthday"] input',
      ) as HTMLInputElement | null;
      expect(input).not.toBeNull();
      expect(input!.type).toBe("date");
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="const renders a pre-filled disabled input"
    body={async ({ set, expect, container }) => {
      set(
        new Pocket(
          new Model("edit", {}),
          await root({
            type: "object",
            properties: { status: { type: "string", const: "active" } },
            required: ["status"],
          } as JSONSchema7),
        ),
      );
      const input = container.querySelector(
        '[data-path="status"] input',
      ) as HTMLInputElement | null;
      expect(input).not.toBeNull();
      expect(input!.disabled).toBe(true);
      expect(input!.value).toBe("active");
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
          new Model("edit", { color: "red" }),
          await root({
            type: "object",
            properties: {
              color: { type: "string", enum: ["red", "green", "blue"] },
            },
            required: ["color"],
          } as JSONSchema7),
        ),
      );
      const select = container.querySelector(
        '[data-path="color"] select',
      ) as HTMLSelectElement | null;
      expect(select).not.toBeNull();
      const opts = Array.from(select!.options).filter((o) => !o.disabled);
      expect(opts.map((o) => o.value)).toEqual(["red", "green", "blue"]);
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>
</Sweater>
