/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2026-present TagSpaces GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import {
  isAtLocationRoot,
  resolveBackAction,
} from '-/services/mobileBackAction';
import { describe, expect, test } from '@playwright/test';

const baseState = {
  drawerOpen: false,
  modalOpen: false,
  hasOpenedEntry: false,
  isSearchMode: false,
  hasDirectory: true,
  isAtLocationRoot: false,
};

describe('mobileBackAction', () => {
  // A. Priority chain: drawer > modal > entry > search > goUp > exit.
  describe('resolveBackAction priority', () => {
    test('drawer wins over everything', () => {
      expect(
        resolveBackAction({
          drawerOpen: true,
          modalOpen: true,
          hasOpenedEntry: true,
          isSearchMode: true,
          hasDirectory: true,
          isAtLocationRoot: false,
        }),
      ).toBe('closeDrawer');
    });
    test('modal wins over entry, search and navigation', () => {
      expect(
        resolveBackAction({
          ...baseState,
          modalOpen: true,
          hasOpenedEntry: true,
          isSearchMode: true,
        }),
      ).toBe('closeModal');
    });
    test('opened entry wins over search and navigation', () => {
      expect(
        resolveBackAction({
          ...baseState,
          hasOpenedEntry: true,
          isSearchMode: true,
        }),
      ).toBe('closeEntry');
    });
    test('search mode wins over navigation', () => {
      expect(resolveBackAction({ ...baseState, isSearchMode: true })).toBe(
        'exitSearch',
      );
    });
    test('inside a subfolder goes up', () => {
      expect(resolveBackAction(baseState)).toBe('goUp');
    });
    test('at the location root exits the app', () => {
      expect(
        resolveBackAction({ ...baseState, isAtLocationRoot: true }),
      ).toBe('exitApp');
    });
    test('no open directory (welcome screen) exits the app', () => {
      expect(
        resolveBackAction({
          ...baseState,
          hasDirectory: false,
          isAtLocationRoot: false,
        }),
      ).toBe('exitApp');
    });
  });

  // B. Location-root detection across platform path shapes.
  describe('isAtLocationRoot', () => {
    test('unix paths with trailing separator on the root', () => {
      expect(isAtLocationRoot('/Users/u/Docs', '/Users/u/Docs/')).toBe(true);
      expect(isAtLocationRoot('/Users/u/Docs/sub', '/Users/u/Docs/')).toBe(
        false,
      );
    });
    test('windows backslash paths', () => {
      expect(isAtLocationRoot('C:\\Users\\u\\Docs', 'C:/Users/u/Docs')).toBe(
        true,
      );
      expect(
        isAtLocationRoot('C:\\Users\\u\\Docs\\sub', 'C:/Users/u/Docs'),
      ).toBe(false);
    });
    test('s3 paths without leading slash vs enhanced leading slash', () => {
      expect(isAtLocationRoot('/my-folder', 'my-folder/')).toBe(true);
      expect(isAtLocationRoot('/my-folder/sub', 'my-folder/')).toBe(false);
    });
    test('bucket root: empty location path', () => {
      expect(isAtLocationRoot('/', '')).toBe(true);
      expect(isAtLocationRoot('folder', '')).toBe(false);
    });
    test('empty current directory counts as root', () => {
      expect(isAtLocationRoot('', '/Users/u/Docs')).toBe(true);
      expect(isAtLocationRoot(undefined, '/Users/u/Docs')).toBe(true);
    });
  });
});
