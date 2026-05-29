export const fmtNum = (value: number): string =>
  value % 1 === 0 ? String(value) : value.toFixed(2);
