/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2024-present TagSpaces GmbH
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
 * https://usehooks-typescript.com/use-event-listener/
 * eslint-disable @typescript-eslint/ban-types
 */
import { useEffect, useState } from 'react';

type UseCancelableResult = {
  signal: AbortSignal;
  abort: () => void;
};

export const useCancelable = (): UseCancelableResult => {
  const [controller, setController] = useState(new AbortController());

  // Abort it automatically in the destructor
  useEffect(() => {
    return () => controller.abort();
  }, [controller]);

  return {
    signal: controller.signal,
    abort: () => {
      controller.abort();
      setController(new AbortController());
    },
  };
};
