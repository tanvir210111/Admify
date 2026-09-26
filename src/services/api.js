import { api as libApi } from "../lib/api";

const client = {
  get: async (url, config) => {
    const res = await libApi.get(url, config);
    return { data: res, ...res };
  },
  post: async (url, body, config) => {
    const res = await libApi.post(url, body, config);
    return { data: res, ...res };
  },
  put: async (url, body, config) => {
    const res = await libApi.put(url, body, config);
    return { data: res, ...res };
  },
  delete: async (url, config) => {
    const res = await libApi.delete(url, config);
    return { data: res, ...res };
  },
};

export const api = client;
export default client;
