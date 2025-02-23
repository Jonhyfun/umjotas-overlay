export type SelfDestructComposition<T = object> = React.FC<
  {
    onFinished?: VoidFunction;
  } & T
>;
