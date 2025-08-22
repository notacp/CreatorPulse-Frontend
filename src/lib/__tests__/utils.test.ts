import { ensureArray, safeMap, validateApiResponse } from '../utils';

describe('Array Validation Utils', () => {
  describe('ensureArray', () => {
    it('should return the original array if input is an array', () => {
      const input = [1, 2, 3];
      const result = ensureArray(input);
      expect(result).toBe(input);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array for undefined input', () => {
      const result = ensureArray(undefined);
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array for null input', () => {
      const result = ensureArray(null);
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array for non-array input', () => {
      const result = ensureArray('not an array');
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array for object input', () => {
      const result = ensureArray({ key: 'value' });
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('safeMap', () => {
    it('should map over valid array', () => {
      const input = [1, 2, 3];
      const result = safeMap(input, (x: number) => x * 2);
      expect(result).toEqual([2, 4, 6]);
    });

    it('should return empty array for undefined input', () => {
      const result = safeMap(undefined, (x: number) => x * 2);
      expect(result).toEqual([]);
    });

    it('should return empty array for null input', () => {
      const result = safeMap(null, (x: number) => x * 2);
      expect(result).toEqual([]);
    });

    it('should return empty array for non-array input', () => {
      const result = safeMap('not an array', (x: any) => x);
      expect(result).toEqual([]);
    });
  });

  describe('validateApiResponse', () => {
    it('should validate response with array field', () => {
      const input = {
        data: [1, 2, 3],
        success: true
      };
      const result = validateApiResponse(input, 'data');
      expect(result.data).toEqual([1, 2, 3]);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should fix non-array field', () => {
      const input = {
        data: 'not an array',
        success: true
      };
      const result = validateApiResponse(input, 'data');
      expect(result.data).toEqual([]);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should handle undefined response', () => {
      const result = validateApiResponse(undefined, 'data');
      expect(result).toEqual({ data: [] });
    });

    it('should handle null response', () => {
      const result = validateApiResponse(null, 'data');
      expect(result).toEqual({ data: [] });
    });

    it('should return empty array for invalid response without field', () => {
      const result = validateApiResponse(undefined);
      expect(result).toEqual([]);
    });
  });
});
