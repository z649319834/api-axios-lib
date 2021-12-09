import { IfetchConfig } from "./types";

const noop = <T>(data: T): T => data;

export const fetchConfig: IfetchConfig = {
  onMessage: noop,
  onLocation: () => false,
  onLoading: noop,
  formatPostBody: noop
};
