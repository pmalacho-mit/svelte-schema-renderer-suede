import type { FromKind, Kind, RenderNode } from "./types.js";
import type { RecursivePartial } from "./utils";

export type Mode = "edit" | "stream" | "view";
export type Data = Record<string, unknown>;

type State<TMode extends Mode, TData> = TMode extends "stream"
  ? RecursivePartial<TData>
  : TData;

export class SchemaModel<TMode extends Mode = Mode, TData extends Data = Data> {
  data = $state({} as State<TMode, TData>);

  readonly mode: TMode;

  get editable() {
    return this.mode === "edit";
  }

  constructor(mode: TMode, initial?: State<TMode, TData>) {
    this.mode = mode;
    if (initial) this.data = structuredClone(initial);
  }

  /** Read a value at a dotted path */
  get<K extends Kind>({
    path,
  }: Pick<RenderNode & { kind: K }, "path" | "kind">): FromKind<K> | undefined {
    return path.split(".").reduce<any>((obj, key) => obj?.[key], this.data);
  }

  set<K extends Kind>(
    { path }: Pick<RenderNode & { kind: K }, "path" | "kind">,
    value: FromKind<K>,
  ): void {
    this.#set(path, value);
  }

  #set(path: string, value: unknown) {
    if (path === "") return (this.data = value as State<TMode, TData>);
    const keys = path.split(".");
    let target: any = this.data;
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (target[k] === undefined)
        target[k] = isNaN(Number(keys[i + 1])) ? {} : [];
      target = target[k];
    }
    target[keys[keys.length - 1]] = value;
  }

  remove({ path }: Pick<RenderNode, "path">): void {
    const keys = path.split(".");
    let obj: any = this.data;
    for (const k of keys.slice(0, -1)) {
      if (obj?.[k] === undefined) return;
      obj = obj[k];
    }
    delete obj[keys[keys.length - 1]];
  }

  applyPartial(partial: Record<string, unknown>, basePath = ""): void {
    for (const [key, value] of Object.entries(partial)) {
      const path = basePath ? `${basePath}.${key}` : key;
      if (value !== null && typeof value === "object" && !Array.isArray(value))
        this.applyPartial(value as Record<string, unknown>, path);
      else this.#set(path, value);
    }
  }
}
