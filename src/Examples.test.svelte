<script lang="ts">
  import type { JSONSchema7 } from "json-schema";
  import { Model, root, Schema } from "../release";

  const examples = import.meta.glob<Record<string, unknown>>(
    "/src/examples/**/*.json",
    { import: "default" },
  );

  const options = Array.from(
    new Set(
      Object.keys(examples).map((path) => path.replace(/\/[^\/]+\.json$/, "")),
    ),
  ).map((path) => ({
    path,
    importer: () =>
      Promise.all([
        examples[path + "/data.json"](),
        examples[path + "/schema.json"](),
      ]).then(([data, schema]) => ({
        data,
        schema: schema as JSONSchema7,
      })),
  }));

  let selected = 0;
</script>

<select bind:value={selected}>
  {#each options as option, index}
    <option value={index}>
      {option.path.split("/").at(-1)}
    </option>
  {/each}
</select>

{#await options[selected].importer() then { data, schema }}
  <Schema model={new Model("edit", data)} node={root(schema)} />
{/await}
