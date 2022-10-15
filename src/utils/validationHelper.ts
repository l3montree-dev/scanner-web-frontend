// predicate should return true, if the test did pass - it should return false, if the test fails and the error
// or recommendation should be included.
export const validationHelper = (
  errors: { [key: string]: () => boolean },
  recommendations?: { [key: string]: () => boolean }
): { didPass: boolean; errors: string[]; recommendations: string[] } => {
  const errorKeys = Object.keys(errors);
  const recommendationKeys = Object.keys(recommendations || {});
  const err = errorKeys.filter((key) => !errors[key]());
  return {
    didPass: err.length === 0,
    errors: err,
    recommendations:
      recommendations !== undefined
        ? recommendationKeys.filter((key) => !recommendations[key]())
        : [],
  };
};
