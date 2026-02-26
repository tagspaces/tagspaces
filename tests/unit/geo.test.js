import {
    isGeoTag,
    isMgrsString,
    isPlusCode,
    parseLatLon,
} from '-/utils/geo';
import { describe, expect, test } from '@playwright/test';

describe('Geo Utilities', () => {
  describe('isPlusCode', () => {
    test('should return true for valid plus code 8FWH4HVG+3V', () => {
      expect(isPlusCode('8FWH4HVG+3V')).toBe(true);
    });

    test('should return true for valid plus code 8FWH4HVG+2X', () => {
      expect(isPlusCode('8FWH4HVG+2X')).toBe(true);
    });

    test('should return true for valid plus code with 3 suffix chars 8FWH4HVG+2XQ', () => {
      expect(isPlusCode('8FWH4HVG+2XQ')).toBe(true);
    });

    test('should return true for plus code with surrounding spaces', () => {
      expect(isPlusCode(' 8FWH4HVG+3V ')).toBe(true);
    });

    test('should return false for empty string', () => {
      expect(isPlusCode('')).toBe(false);
    });

    test('should return false for null or undefined', () => {
      expect(isPlusCode(null)).toBe(false);
      expect(isPlusCode(undefined)).toBe(false);
    });

    test('should return false for invalid plus code without +', () => {
      expect(isPlusCode('8FWH4HVG3V')).toBe(false);
    });

    test('should return false for invalid characters', () => {
      expect(isPlusCode('INVALID+CODE')).toBe(false);
    });

    test('should handle lowercase plus codes', () => {
      expect(isPlusCode('8fwh4hvg+3v')).toBe(true);
    });
  });

  describe('isMgrsString', () => {
    test('should return true for valid MGRS code 18SUJ7082315291', () => {
      expect(isMgrsString('18SUJ7082315291')).toBe(true);
    });

    test('should return true for valid MGRS code 18SUJ70821529', () => {
      expect(isMgrsString('18SUJ70821529')).toBe(true);
    });

    test('should return true for valid MGRS code 18SUJ708152', () => {
      expect(isMgrsString('18SUJ708152')).toBe(true);
    });

    test('should return true for MGRS code with spaces', () => {
      expect(isMgrsString('18 SUJ 708 152')).toBe(true);
    });

    test('should return true for lowercase MGRS code', () => {
      expect(isMgrsString('18suj7082315291')).toBe(true);
    });

    test('should return false for empty string', () => {
      expect(isMgrsString('')).toBe(false);
    });

    test('should return false for null or undefined', () => {
      expect(isMgrsString(null)).toBe(false);
      expect(isMgrsString(undefined)).toBe(false);
    });

    test('should return false for invalid MGRS format', () => {
      expect(isMgrsString('INVALID')).toBe(false);
      expect(isMgrsString('ABC')).toBe(false);
    });

    test('should return false for wrong zone letter', () => {
      // 'B' is not valid for zone letter
      expect(isMgrsString('18BUJ7082315291')).toBe(false);
    });
  });

  describe('parseLatLon', () => {
    test('should parse valid latitude and longitude', () => {
      const result = parseLatLon('40.7128,-74.0060');
      expect(result).not.toBe(false);
      expect(result.lat).toBe(40.7128);
      expect(result.lon).toBe(-74.006);
    });

    test('should parse coordinates with spaces', () => {
      const result = parseLatLon('40.7128 , -74.0060');
      expect(result).not.toBe(false);
      expect(result.lat).toBe(40.7128);
      expect(result.lon).toBe(-74.006);
    });

    test('should handle positive coordinates', () => {
      const result = parseLatLon('35.6895,139.6917');
      expect(result).not.toBe(false);
      expect(result.lat).toBe(35.6895);
      expect(result.lon).toBe(139.6917);
    });

    test('should handle maximum valid latitude (90)', () => {
      const result = parseLatLon('90,0');
      expect(result).not.toBe(false);
      expect(result.lat).toBe(90);
    });

    test('should handle maximum valid longitude (180)', () => {
      const result = parseLatLon('0,180');
      expect(result).not.toBe(false);
      expect(result.lon).toBe(180);
    });

    test('should return false for empty string', () => {
      expect(parseLatLon('')).toBe(false);
    });

    test('should return false for invalid format (no comma)', () => {
      expect(parseLatLon('40.7128 -74.0060')).toBe(false);
    });

    test('should return false for out of range latitude', () => {
      expect(parseLatLon('91,0')).toBe(false);
      expect(parseLatLon('-91,0')).toBe(false);
    });

    test('should return false for out of range longitude', () => {
      expect(parseLatLon('0,181')).toBe(false);
      expect(parseLatLon('0,-181')).toBe(false);
    });

    test('should return false for non-numeric input', () => {
      expect(parseLatLon('abc,def')).toBe(false);
    });
  });

  describe('isGeoTag', () => {
    test('should return true for valid plus code', () => {
      expect(isGeoTag('8FWH4HVG+3V')).toBe(true);
    });

    test('should return true for valid MGRS code', () => {
      expect(isGeoTag('18SUJ7082315291')).toBe(true);
    });

    test('should return false for non-geo strings', () => {
      expect(isGeoTag('random text')).toBe(false);
      expect(isGeoTag('12345')).toBe(false);
    });

    test('should return false for empty string', () => {
      expect(isGeoTag('')).toBe(false);
    });
  });
});
