import { ErrorHandler } from "../services/ErrorHandler";

export const getEnvVar = (envName: string): string => {
  const env = process.env[envName];
  if (!env) throw new ErrorHandler(`${envName} is undefined`, 500);

  return env;
};
