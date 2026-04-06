import type { PrimitiveKind, Primitives } from "../types.js";

export const valid = {
  options: <Kind extends PrimitiveKind>(
    kind: Kind,
    options?: unknown[] | undefined,
  ): options is Primitives[Kind][] | undefined =>
    !options ||
    (Array.isArray(options) && options.every((opt) => typeof opt === kind)),

  default: <Kind extends PrimitiveKind>(
    kind: Kind,
    defaultValue: unknown,
  ): defaultValue is Primitives[Kind] | undefined =>
    defaultValue === undefined || typeof defaultValue === kind,
};

export type Replace<
  S extends string,
  From extends string,
  To extends string,
> = S extends `${infer L}${From}${infer R}`
  ? `${L}${To}${Replace<R, From, To>}`
  : S;

export type JoinPath<
  Prefix extends string,
  Key extends string,
> = Prefix extends "" ? Key : `${Prefix}.${Key}`;

/** Standard union-to-intersection utility */
export type UnionToIntersection<U> = (
  U extends any ? (x: U) => void : never
) extends (x: infer I) => void
  ? I
  : never;

export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object | undefined
      ? RecursivePartial<T[P]>
      : T[P];
};
