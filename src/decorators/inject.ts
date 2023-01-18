type Extract<T extends ReadonlyArray<() => Promise<any>>> = {
  [Index in keyof T]: T[Index] extends () => Promise<infer V> ? V : never;
};

export type DecoratedHandler<Params, T, ReturnType> = (
  params: Params,
  additionalData: T
) => ReturnType;

export type Decorator<T> = () => Promise<T>;

export const inject = <Params, ReturnType, Decorators extends Decorator<any>[]>(
  handler: DecoratedHandler<Params, Extract<Decorators>, ReturnType>,
  ...decorators: Decorators
) => {
  return async (params: Params): Promise<ReturnType> => {
    const obj = (await Promise.all(
      decorators.map((fn) => fn())
    )) as Extract<Decorators>;
    return handler(params, obj);
  };
};
