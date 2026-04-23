<script lang="ts">
  import type { JSONSchema7 } from "json-schema";
  import { Model, root, Schema } from "../release";
  import { flushSync } from "svelte";

  type Mode = "edit" | "view" | "stream";

  const examples = import.meta.glob<Record<string, unknown>>(
    "/public/**/*.json",
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
        data: data as Record<string, unknown>,
        schema: schema as JSONSchema7,
      })),
  }));

  // Flatten a data object to leaf { path, value } pairs.
  // Arrays and primitives are treated as atomic leaves (not recursed into).
  function leaves(
    obj: unknown,
    base = "",
  ): { path: string; value: unknown }[] {
    if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
      return base ? [{ path: base, value: obj }] : [];
    }
    return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) => {
      const path = base ? `${base}.${k}` : k;
      return typeof v === "object" && v !== null && !Array.isArray(v)
        ? leaves(v, path)
        : [{ path, value: v }];
    });
  }

  let selected = $state(0);
  let mode = $state<Mode>("edit");
  let streamRate = $state(300);

  type RootNode = Awaited<ReturnType<typeof root>>;
  type RenderConfig = { model: InstanceType<typeof Model>; rootNode: RootNode };

  let renderConfig = $state<RenderConfig | null>(null);

  $effect(() => {
    const idx = selected;
    const currentMode = mode;
    const rate = streamRate;

    renderConfig = null;
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    options[idx].importer().then(async ({ data, schema }) => {
      const rootNode = await root(schema);
      if (cancelled) return;

      const model = new Model(
        currentMode,
        currentMode === "stream" ? ({} as any) : (data as any),
      );
      renderConfig = { model, rootNode };

      if (currentMode !== "stream") return;

      const items = leaves(data);
      let i = 0;
      intervalId = setInterval(() => {
        if (i >= items.length) {
          clearInterval(intervalId!);
          return;
        }
        const { path, value } = items[i++];
        flushSync(() => model.set({ path }, value as any));
      }, rate);
    });

    return () => {
      cancelled = true;
      if (intervalId !== null) clearInterval(intervalId);
    };
  });
</script>

<div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px; flex-wrap: wrap;">
  <select bind:value={selected}>
    {#each options as option, index}
      <option value={index}>{option.path.split("/").at(-1)}</option>
    {/each}
  </select>

  <select bind:value={mode}>
    <option value="edit">edit</option>
    <option value="view">view</option>
    <option value="stream">stream</option>
  </select>

  {#if mode === "stream"}
    <label>
      stream rate:
      <input
        type="number"
        bind:value={streamRate}
        min={50}
        max={5000}
        step={50}
        style="width: 80px;"
      />
      ms / item
    </label>
  {/if}
</div>

{#if renderConfig}
  <Schema model={renderConfig.model} root={renderConfig.rootNode} />
{/if}
