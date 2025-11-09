export type QueryObjectDeep<T> = {
  [P in keyof T]?: T[P] extends string
    ? string | string[]
    : QueryObjectDeep<T[P]>
}

export type PartialDeep<T> = {
  [P in keyof T]?: PartialDeep<T[P]>
}

export type ReadonlyDeep<T> = {
  readonly [P in keyof T]: ReadonlyDeep<T[P]>
}

type PathImpl<T, K extends keyof T> = K extends string
  ? T[K] extends Record<string, unknown>
    ? T[K] extends ArrayLike<unknown>
      ? K | `${K}.${PathImpl<T[K], Exclude<keyof T[K], keyof unknown[]>>}`
      : K | `${K}.${PathImpl<T[K], keyof T[K]>}`
    : K
  : never

export type Path<T> = string & (PathImpl<T, keyof T> | keyof T)

export type PathValue<
  T,
  P extends Path<T>,
> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? Rest extends Path<T[K]>
      ? PathValue<T[K], Rest>
      : never
    : never
  : P extends keyof T
    ? T[P]
    : never
