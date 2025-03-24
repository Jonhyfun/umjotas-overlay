import { interpolate, type InterpolateOptions } from "remotion";

export const offsetInterpolate = (
  startsAt: number,
  input: number,
  inputRange: readonly number[],
  outputRange: readonly number[],
  options?: InterpolateOptions,
) =>
  interpolate(
    input,
    inputRange.map((frame) => frame + startsAt),
    outputRange,
    options,
  );

export const defined = <T>(...args: (T | undefined)[]): T | undefined => {
  let result: T | undefined = undefined;
  for (let index = 0; index < args.length; index++) {
    result = args[index];
    if (result) break;
  }
  return result;
};
