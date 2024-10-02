// src/utils/sanitizeId.ts
export const sanitizeId = (id: string): string => {
  return id.replace(/[^a-zA-Z0-9.-]/g, "");
};
