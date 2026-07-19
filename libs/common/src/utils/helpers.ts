import { v4 as uuidv4 } from 'uuid';

export const generateUUID = (): string => uuidv4();

export const sanitizeUser = (user: any) => {
  if (!user) return null;
  const { password, ...sanitized } = user;
  return sanitized;
};

export const parsePagination = (
  page?: number,
  limit?: number,
): { page: number; limit: number; skip: number } => {
  const p = Math.max(1, page || 1);
  const l = Math.min(Math.max(1, limit || 10), 100);
  return { page: p, limit: l, skip: (p - 1) * l };
};

export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number,
) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});
