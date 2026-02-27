import { beforeEach, describe, expect, test } from '@playwright/test';

// Mock AppConfig
const mockAppConfig = {
  SearchTypeGroups: {
    files: ['files'],
    folders: ['folders'],
    untagged: ['untagged'],
    any: ['any'],
  },
  dirSeparator: '/',
  isMobile: false,
  isWeb: false,
};

// Simple mock of CommonLocation for testing
class MockCommonLocation {
  constructor(config) {
    this.uuid = config.uuid;
    this.name = config.name;
    this.type = config.type;
    this.isReadOnly = config.isReadOnly || false;
    this.isDefault = config.isDefault || false;
    this.path = config.path || '';
    this.paths = config.paths || [];
  }

  getDirSeparator() {
    return mockAppConfig.dirSeparator;
  }
}

import {
  canMoveDown,
  canMoveUp,
  findLocalLocation,
  findLocationById,
  findLocationByType,
  getDirSeparatorForLocation,
  getFirstReadWriteLocation,
  getLocationPathString,
  getLocationPositionByUUID,
  locationExists,
  validateMoveLocation,
} from '-/utils/locationUtils';
import { locationType } from '@tagspaces/tagspaces-common/misc';

// Mock data helper
function createMockLocation(
  uuid,
  name,
  type = locationType.TYPE_LOCAL,
  isReadOnly = false,
  isDefault = false,
  path = '',
) {
  const location = new MockCommonLocation({
    uuid,
    name,
    type,
    isReadOnly,
    isDefault,
    path,
  });
  return location;
}

describe('locationUtils', () => {
  let locations;

  beforeEach(async () => {
    locations = [
      createMockLocation('loc-1', 'Home', locationType.TYPE_LOCAL, false, true, '/home'),
      createMockLocation('loc-2', 'Downloads', locationType.TYPE_LOCAL, false, false, '/downloads'),
      createMockLocation('loc-3', 'Cloud', locationType.TYPE_CLOUD, true, false),
      createMockLocation('loc-4', 'S3', locationType.TYPE_OBJECTSTORE, false, false),
    ];
  });

  describe('findLocationById', () => {
    test('should find location by ID', async () => {
      const result = findLocationById(locations, 'loc-2');
      expect(result).toBeDefined();
      expect(result.name).toBe('Downloads');
    });

    test('should return undefined for non-existent ID', async () => {
      const result = findLocationById(locations, 'loc-nonexistent');
      expect(result).toBeUndefined();
    });

    test('should fallback to current location when locationId is undefined', async () => {
      const result = findLocationById(locations, undefined, 'loc-1');
      expect(result).toBeDefined();
      expect(result.name).toBe('Home');
    });

    test('should prioritize locationId over currentId', async () => {
      const result = findLocationById(locations, 'loc-2', 'loc-1');
      expect(result.name).toBe('Downloads');
    });

    test('should handle empty array', async () => {
      const result = findLocationById([], 'loc-1');
      expect(result).toBeUndefined();
    });
  });

  describe('getFirstReadWriteLocation', () => {
    test('should find default writable location first', async () => {
      const result = getFirstReadWriteLocation(locations);
      expect(result).toBeDefined();
      expect(result.uuid).toBe('loc-1');
      expect(result.isDefault).toBe(true);
    });

    test('should find non-default writable location if no default exists', async () => {
      const testLocations = [
        createMockLocation('loc-1', 'ReadOnly', locationType.TYPE_LOCAL, true, true),
        createMockLocation('loc-2', 'Writable', locationType.TYPE_LOCAL, false, false),
      ];
      const result = getFirstReadWriteLocation(testLocations);
      expect(result.name).toBe('Writable');
    });

    test('should return undefined if all locations are read-only', async () => {
      const testLocations = [
        createMockLocation('loc-1', 'RO1', locationType.TYPE_LOCAL, true),
        createMockLocation('loc-2', 'RO2', locationType.TYPE_LOCAL, true),
      ];
      const result = getFirstReadWriteLocation(testLocations);
      expect(result).toBeUndefined();
    });

    test('should return undefined for empty array', async () => {
      const result = getFirstReadWriteLocation([]);
      expect(result).toBeUndefined();
    });
  });

  describe('findLocationByType', () => {
    test('should find location by type', async () => {
      const result = findLocationByType(locations, locationType.TYPE_CLOUD);
      expect(result).toBeDefined();
      expect(result.name).toBe('Cloud');
    });

    test('should return undefined for non-existent type', async () => {
      const result = findLocationByType(locations, 'non-existent-type');
      expect(result).toBeUndefined();
    });

    test('should return first match when multiple locations have same type', async () => {
      const result = findLocationByType(locations, locationType.TYPE_LOCAL);
      expect(result.uuid).toBe('loc-1');
    });

    test('should handle empty array', async () => {
      const result = findLocationByType([], locationType.TYPE_LOCAL);
      expect(result).toBeUndefined();
    });
  });

  describe('findLocalLocation', () => {
    test('should return undefined if no local location', async () => {
      const testLocations = [
        createMockLocation('loc-1', 'Cloud', locationType.TYPE_CLOUD),
        createMockLocation('loc-2', 'WebDAV', locationType.TYPE_WEBDAV),
      ];
      const result = findLocalLocation(testLocations);
      expect(result).toBeUndefined();
    });

    test('should handle empty array', async () => {
      const result = findLocalLocation([]);
      expect(result).toBeUndefined();
    });
  });

  describe('getDirSeparatorForLocation', () => {
    test('should return location separator if location exists', async () => {
      const location = locations[0];
      const result = getDirSeparatorForLocation(location);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    test('should return AppConfig separator for undefined location', async () => {
      const result = getDirSeparatorForLocation(undefined);
      expect(result).toBe(global.isWin ? '\\\\': '/');
    });

    test('should return AppConfig separator for null location', async () => {
      const result = getDirSeparatorForLocation(null);
      expect(result).toBe(global.isWin ? '\\\\': '/');
    });
  });

  describe('getLocationPositionByUUID', () => {
    test('should find location at correct index', async () => {
      const result = getLocationPositionByUUID(locations, 'loc-2');
      expect(result).toBe(1);
    });

    test('should return -1 for non-existent location', async () => {
      const result = getLocationPositionByUUID(locations, 'non-existent');
      expect(result).toBe(-1);
    });

    test('should find location at start of array', async () => {
      const result = getLocationPositionByUUID(locations, 'loc-1');
      expect(result).toBe(0);
    });

    test('should find location at end of array', async () => {
      const result = getLocationPositionByUUID(locations, 'loc-4');
      expect(result).toBe(locations.length - 1);
    });

    test('should handle empty array', async () => {
      const result = getLocationPositionByUUID([], 'loc-1');
      expect(result).toBe(-1);
    });
  });

  describe('validateMoveLocation', () => {
    test('should validate valid move parameters', async () => {
      const result = validateMoveLocation(locations, 'loc-2', 0);
      expect(result.currentIndex).toBe(1);
      expect(result.newIndex).toBe(0);
    });

    test('should throw error for invalid array', async () => {
      expect(() => {
        validateMoveLocation(null, 'loc-1', 0);
      }).toThrow('Locations must be an array');
    });

    test('should throw error for negative newIndex', async () => {
      expect(() => {
        validateMoveLocation(locations, 'loc-1', -1);
      }).toThrow('Invalid newIndex');
    });

    test('should throw error for newIndex >= array length', async () => {
      expect(() => {
        validateMoveLocation(locations, 'loc-1', locations.length);
      }).toThrow('Invalid newIndex');
    });

    test('should throw error for non-existent location UUID', async () => {
      expect(() => {
        validateMoveLocation(locations, 'non-existent', 0);
      }).toThrow('Location with UUID non-existent not found');
    });

    test('should accept newIndex at array length - 1', async () => {
      const result = validateMoveLocation(locations, 'loc-1', locations.length - 1);
      expect(result.newIndex).toBe(locations.length - 1);
    });
  });

  describe('canMoveUp', () => {
    test('should return true for non-first location', async () => {
      const result = canMoveUp(locations, 'loc-2');
      expect(result).toBe(true);
    });

    test('should return false for first location', async () => {
      const result = canMoveUp(locations, 'loc-1');
      expect(result).toBe(false);
    });

    test('should return false for non-existent location', async () => {
      const result = canMoveUp(locations, 'non-existent');
      expect(result).toBe(false);
    });

    test('should return false for empty array', async () => {
      const result = canMoveUp([], 'loc-1');
      expect(result).toBe(false);
    });
  });

  describe('canMoveDown', () => {
    test('should return true for non-last location', async () => {
      const result = canMoveDown(locations, 'loc-1');
      expect(result).toBe(true);
    });

    test('should return false for last location', async () => {
      const result = canMoveDown(locations, 'loc-4');
      expect(result).toBe(false);
    });

    test('should return false for non-existent location', async () => {
      const result = canMoveDown(locations, 'non-existent');
      expect(result).toBe(false);
    });

    test('should return false for empty array', async () => {
      const result = canMoveDown([], 'loc-1');
      expect(result).toBe(false);
    });
  });

  describe('locationExists', () => {
    test('should return true for existing location', async () => {
      const result = locationExists(locations, 'loc-1');
      expect(result).toBe(true);
    });

    test('should return false for non-existent location', async () => {
      const result = locationExists(locations, 'non-existent');
      expect(result).toBe(false);
    });

    test('should return false for empty array', async () => {
      const result = locationExists([], 'loc-1');
      expect(result).toBe(false);
    });

    test('should handle multiple matches correctly', async () => {
      const testLocations = [
        createMockLocation('loc-1', 'Home'),
        createMockLocation('loc-1', 'Duplicate'),
      ];
      const result = locationExists(testLocations, 'loc-1');
      expect(result).toBe(true);
    });
  });

  describe('getLocationPathString', () => {
    test('should return path from location', async () => {
      const location = createMockLocation('loc-1', 'Home', locationType.TYPE_LOCAL, false, false, '/home');
      const result = getLocationPathString(location);
      expect(result).toBe('/home');
    });

    test('should return first path from paths array if path is empty', async () => {
      const location = new MockCommonLocation({
        uuid: 'loc-1',
        name: 'Test',
        type: locationType.TYPE_LOCAL,
        paths: ['/first', '/second'],
      });
      const result = getLocationPathString(location);
      expect(result).toBe('/first');
    });

    test('should prefer path over paths array', async () => {
      const location = new MockCommonLocation({
        uuid: 'loc-1',
        name: 'Test',
        type: locationType.TYPE_LOCAL,
        path: '/primary',
        paths: ['/fallback'],
      });
      const result = getLocationPathString(location);
      expect(result).toBe('/primary');
    });

    test('should return empty string if no path available', async () => {
      const location = new MockCommonLocation({
        uuid: 'loc-1',
        name: 'Test',
        type: locationType.TYPE_LOCAL,
      });
      const result = getLocationPathString(location);
      expect(result).toBe('');
    });

    test('should return empty string for undefined location', async () => {
      const result = getLocationPathString(undefined);
      expect(result).toBe('');
    });
  });
});
