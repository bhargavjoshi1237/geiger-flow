export const toast = {
  success: (...args) => console.info('[planning toast]', ...args),
  error: (...args) => console.error('[planning toast]', ...args),
  info: (...args) => console.info('[planning toast]', ...args),
  loading: (...args) => {
    console.info('[planning toast]', ...args);
    return undefined;
  },
};
