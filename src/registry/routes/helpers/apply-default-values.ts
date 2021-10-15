import { OcParameter } from '../../../types';

interface OptionalParameterWithDefault extends OcParameter {
  mandatory: false;
  default: Exclude<OcParameter['default'], undefined>;
}

export default function applyDefaultValues(
  requestParameters: Dictionary<string | number | boolean> = {},
  expectedParameters: Dictionary<OcParameter> = {}
): Dictionary<string | number | boolean> {
  const optionalParametersWithDefaults = Object.entries(
    expectedParameters
  ).filter(
    (params): params is [string, OptionalParameterWithDefault] =>
      !params[1].mandatory && typeof params[1].default !== 'undefined'
  );

  optionalParametersWithDefaults.forEach(
    ([expectedParameterName, expectedParameter]) => {
      const param = requestParameters[expectedParameterName];
      if (param === null || param === undefined) {
        requestParameters[expectedParameterName] = expectedParameter.default;
      }
    }
  );

  return requestParameters;
}
