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
  evaluateDismissSwipe,
  isDismissIntent,
} from '-/utils/useSwipeToDismiss';
import { describe, expect, test } from '@playwright/test';

describe('useSwipeToDismiss gesture math', () => {
  describe('evaluateDismissSwipe', () => {
    test('commits a slow drag past 35% of the width, to the right', () => {
      expect(evaluateDismissSwipe(150, 900, 400)).toBe('commit');
    });
    test('commits a slow drag past 35% of the width, to the left', () => {
      expect(evaluateDismissSwipe(-150, 900, 400)).toBe('commit');
    });
    test('cancels a slow short drag', () => {
      expect(evaluateDismissSwipe(-100, 900, 400)).toBe('cancel');
    });
    test('commits a fast flick in either direction', () => {
      expect(evaluateDismissSwipe(60, 100, 400)).toBe('commit');
      expect(evaluateDismissSwipe(-60, 100, 400)).toBe('commit');
    });
    test('cancels a no-op drag', () => {
      expect(evaluateDismissSwipe(0, 50, 400)).toBe('cancel');
    });
  });

  describe('isDismissIntent', () => {
    test('accepts a clearly horizontal drag in either direction', () => {
      expect(isDismissIntent(20, 4)).toBe(true);
      expect(isDismissIntent(-20, 4)).toBe(true);
    });
    test('rejects a drag inside the slop', () => {
      expect(isDismissIntent(-6, 0)).toBe(false);
    });
    test('rejects a mostly vertical drag (scrolling)', () => {
      expect(isDismissIntent(-20, 30)).toBe(false);
    });
  });
});
