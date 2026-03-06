import { LOG_PREFIX } from "./constants";

export function log(...args: unknown[]): void {
  console.log(LOG_PREFIX, ...args);
}

export function warn(...args: unknown[]): void {
  console.warn(LOG_PREFIX, ...args);
}

export function error(...args: unknown[]): void {
  console.error(LOG_PREFIX, ...args);
}
