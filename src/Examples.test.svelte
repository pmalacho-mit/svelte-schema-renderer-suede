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

  // Generates streaming steps that mimic LLM token-by-token output:
  // - strings arrive a few characters at a time
  // - array elements populate one by one (each element's fields also stream)
  // - object fields appear sequentially
  // - numbers and booleans arrive in a single step
  function* streamSteps(
    data: unknown,
    chunk_size: number,
    base = "",
  ): Generator<{ path: string; value: unknown }> {
    if (typeof data === "string") {
      for (let i = chunk_size; i < data.length; i += chunk_size)
        yield { path: base, value: data.slice(0, i) };
      yield { path: base, value: data };
      return;
    }

    if (typeof data !== "object" || data === null) {
      yield { path: base, value: data };
      return;
    }

    if (Array.isArray(data)) {
      // Initialize to empty so the array container renders immediately
      if (base) yield { path: base, value: [] };
      for (let i = 0; i < data.length; i++)
        yield* streamSteps(
          data[i],
          chunk_size,
          base ? `${base}.${i}` : String(i),
        );
      return;
    }

    for (const [k, v] of Object.entries(data as Record<string, unknown>))
      yield* streamSteps(v, chunk_size, base ? `${base}.${k}` : k);
  }

  let selected = $state(0);
  let mode = $state<Mode>("edit");
  let streamRate = $state(300);
  let chunkSize = $state(5);

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

      const items = [...streamSteps(data, chunkSize)];
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

<div
  style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px; flex-wrap: wrap;"
>
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
      stream rate (ms / step):
      <input
        type="number"
        bind:value={streamRate}
        min={50}
        max={5000}
        step={50}
        style="width: 80px;"
      />
    </label>
    <label>
      string chunk size (chars / step):
      <input
        type="number"
        bind:value={chunkSize}
        min={1}
        max={20}
        step={1}
        style="width: 80px;"
      />
    </label>
  {/if}
</div>

{#if renderConfig}
  <Schema model={renderConfig.model} root={renderConfig.rootNode} />
{/if}
