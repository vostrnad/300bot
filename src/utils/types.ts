export type QueryObjectDeep<T> = {
  [P in keyof T]?: T[P] extends string
    ? string | string[]
    : QueryObjectDeep<T[P]>
}
