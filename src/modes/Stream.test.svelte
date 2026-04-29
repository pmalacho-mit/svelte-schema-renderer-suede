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
    name="inputs are disabled"
    body={async ({ set, expect, container }) => {
      set(
        new Pocket(
          new Model("stream", { name: "Alice" }),
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
    name="array has no push or splice buttons"
    body={async ({ set, expect, container }) => {
      set(
        new Pocket(
          new Model("stream", { tags: ["alpha"] }),
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

  <Sweater
    lazy
    name="renders with partially defined data without crashing"
    body={async ({ set, expect, container }) => {
      // Stream data may arrive before all fields are populated
      set(
        new Pocket(
          new Model("stream", {}),
          await root({
            type: "object",
            properties: {
              name: { type: "string" },
              age: { type: "number" },
            },
            required: ["name", "age"],
          } as JSONSchema7),
        ),
      );
      expect(
        container.querySelector('[data-path="name"] input'),
      ).not.toBeNull();
      expect(container.querySelector('[data-path="age"] input')).not.toBeNull();
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="applyPartial updates a string field"
    body={async ({ set, expect, container }) => {
      const pocket = set(
        new Pocket(
          new Model("stream", {}),
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
      expect(input.value).toBe("");
      flushSync(() => pocket.model.applyPartial({ name: "Alice" }));
      expect(input.value).toBe("Alice");
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="applyPartial updates a number field"
    body={async ({ set, expect, container }) => {
      const pocket = set(
        new Pocket(
          new Model("stream", {}),
          await root({
            type: "object",
            properties: { age: { type: "number" } },
            required: ["age"],
          } as JSONSchema7),
        ),
      );
      const input = container.querySelector(
        '[data-path="age"] input',
      ) as HTMLInputElement;
      flushSync(() => pocket.model.applyPartial({ age: 42 }));
      expect(Number(input.value)).toBe(42);
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="applyPartial updates a nested field without overwriting siblings"
    body={async ({ set, expect, container }) => {
      const pocket = set(
        new Pocket(
          new Model("stream", { address: { city: "Boston" } }),
          await root({
            type: "object",
            properties: {
              address: {
                type: "object",
                properties: {
                  street: { type: "string" },
                  city: { type: "string" },
                },
                required: ["street", "city"],
              },
            },
            required: ["address"],
          } as JSONSchema7),
        ),
      );
      flushSync(() =>
        pocket.model.applyPartial({ address: { street: "123 Main St" } }),
      );
      const street = container.querySelector(
        '[data-path="address.street"] input',
      ) as HTMLInputElement;
      const city = container.querySelector(
        '[data-path="address.city"] input',
      ) as HTMLInputElement;
      expect(street.value).toBe("123 Main St");
      expect(city.value).toBe("Boston"); // untouched
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="applyPartial streams in array items one by one"
    body={async ({ set, expect, container }) => {
      const pocket = set(
        new Pocket(
          new Model("stream", { tags: [] }),
          await root({
            type: "object",
            properties: { tags: { type: "array", items: { type: "string" } } },
            required: ["tags"],
          } as JSONSchema7),
        ),
      );
      expect(container.querySelectorAll('[data-path^="tags."]').length).toBe(0);

      flushSync(() => pocket.model.set({ path: "tags" }, ["alpha"]));
      expect(container.querySelectorAll('[data-path^="tags."]').length).toBe(1);

      flushSync(() => pocket.model.set({ path: "tags" }, ["alpha", "beta"]));
      expect(container.querySelectorAll('[data-path^="tags."]').length).toBe(2);
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>

  <Sweater
    lazy
    name="multiple applyPartial calls accumulate into final state"
    body={async ({ set, expect, container }) => {
      const pocket = set(
        new Pocket(
          new Model("stream", {}),
          await root({
            type: "object",
            properties: {
              first: { type: "string" },
              last: { type: "string" },
            },
            required: ["first", "last"],
          } as JSONSchema7),
        ),
      );

      flushSync(() => {
        pocket.model.applyPartial({ first: "Jane" });
        pocket.model.applyPartial({ last: "Doe" });
      });
      const first = container.querySelector(
        '[data-path="first"] input',
      ) as HTMLInputElement;
      const last = container.querySelector(
        '[data-path="last"] input',
      ) as HTMLInputElement;
      expect(first.value).toBe("Jane");
      expect(last.value).toBe("Doe");
    }}
  >
    {#snippet vest(pocket: Pocket)}
      <Schema {...pocket} />
    {/snippet}
  </Sweater>
</Sweater>
