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

import { evaluateSwipe, isHorizontalIntent } from '-/utils/useSwipeBack';
import { describe, expect, test } from '@playwright/test';

describe('useSwipeBack gesture math', () => {
  describe('evaluateSwipe', () => {
    test('commits when the drag crosses the commit ratio', () => {
      expect(
        evaluateSwipe({ dx: 160, dy: 5, elapsedMs: 900, width: 400 }),
      ).toBe('commit');
    });
    test('cancels a slow drag below the commit ratio', () => {
      expect(
        evaluateSwipe({ dx: 100, dy: 5, elapsedMs: 900, width: 400 }),
      ).toBe('cancel');
    });
    test('commits a fast flick below the commit ratio', () => {
      // 100px in 100ms = 1 px/ms, well above the 0.3 px/ms threshold
      expect(
        evaluateSwipe({ dx: 100, dy: 5, elapsedMs: 100, width: 400 }),
      ).toBe('commit');
    });
    test('a fast but tiny twitch does not commit', () => {
      expect(evaluateSwipe({ dx: 10, dy: 0, elapsedMs: 10, width: 400 })).toBe(
        'cancel',
      );
    });
    test('leftward or zero drags cancel', () => {
      expect(evaluateSwipe({ dx: 0, dy: 0, elapsedMs: 100, width: 400 })).toBe(
        'cancel',
      );
      expect(
        evaluateSwipe({ dx: -80, dy: 0, elapsedMs: 100, width: 400 }),
      ).toBe('cancel');
    });
    test('degenerate width cancels', () => {
      expect(evaluateSwipe({ dx: 100, dy: 0, elapsedMs: 100, width: 0 })).toBe(
        'cancel',
      );
    });
    test('custom commitRatio is respected', () => {
      expect(
        evaluateSwipe({
          dx: 100,
          dy: 0,
          elapsedMs: 900,
          width: 400,
          commitRatio: 0.25,
        }),
      ).toBe('commit');
    });
  });

  describe('isHorizontalIntent', () => {
    test('rightward drag dominating vertical is horizontal', () => {
      expect(isHorizontalIntent(30, 5)).toBe(true);
    });
    test('movement within the slop is undecided', () => {
      expect(isHorizontalIntent(8, 2)).toBe(false);
    });
    test('vertical-first drag is not horizontal', () => {
      expect(isHorizontalIntent(15, 20)).toBe(false);
      expect(isHorizontalIntent(15, -20)).toBe(false);
    });
    test('leftward drag is not horizontal', () => {
      expect(isHorizontalIntent(-30, 2)).toBe(false);
    });
    test('diagonal drag needs 1.5x horizontal dominance', () => {
      expect(isHorizontalIntent(30, 21)).toBe(false);
      expect(isHorizontalIntent(30, 19)).toBe(true);
    });
  });
});
