import { generateUUID, sanitizeUser, parsePagination, buildPaginationMeta } from './helpers';

describe('helpers', () => {
  describe('generateUUID', () => {
    it('should return a UUID string', () => {
      const uuid = generateUUID();
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-/);
    });
  });

  describe('sanitizeUser', () => {
    it('should remove password field', () => {
      const result = sanitizeUser({ id: '1', email: 'a@b.com', password: 'secret', role: 'user' });
      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe('a@b.com');
    });

    it('should return null if user is null', () => {
      expect(sanitizeUser(null)).toBeNull();
    });
  });

  describe('parsePagination', () => {
    it('should return defaults', () => {
      const result = parsePagination();
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.skip).toBe(0);
    });

    it('should use provided values', () => {
      const result = parsePagination(3, 20);
      expect(result.page).toBe(3);
      expect(result.limit).toBe(20);
      expect(result.skip).toBe(40);
    });

    it('should cap limit at 100', () => {
      const result = parsePagination(1, 500);
      expect(result.limit).toBe(100);
    });

    it('should enforce minimum page of 1', () => {
      const result = parsePagination(0, 10);
      expect(result.page).toBe(1);
    });
  });

  describe('buildPaginationMeta', () => {
    it('should return correct meta', () => {
      const result = buildPaginationMeta(50, 1, 10);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.total).toBe(50);
      expect(result.totalPages).toBe(5);
    });

    it('should handle zero total', () => {
      const result = buildPaginationMeta(0, 1, 10);
      expect(result.totalPages).toBe(0);
    });
  });
});
