/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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
import { useRef, useEffect, RefObject } from 'react';

/*
// Usage
function Component() {
    // Define button ref
    const buttonRef = useRef<HTMLButtonElement>(null)
    const onScroll = (event: Event) => {
        console.log('window scrolled!', event)
    }
    const onClick = (event: Event) => {
        console.log('button clicked!', event)
    }
    // example with window based event
    useEventListener('scroll', onScroll)
    // example with element based event
    useEventListener('click', onClick, buttonRef)
    return (
        <div style={{ minHeight: '200vh' }}>
    <button ref={buttonRef}>Click me</button>
    </div>
)
}
*/

// Hook
export default function useEventListener<
  T extends HTMLElement = HTMLDivElement,
>(eventName: string, handler: Function, element?: RefObject<T>) {
  // Create a ref that stores handler
  const savedHandler = useRef<Function>();
  useEffect(() => {
    // Define the listening target
    const targetElement: T | Window = element?.current || window;
    if (!(targetElement && targetElement.addEventListener)) {
      return;
    }
    // Update saved handler if necessary
    if (savedHandler.current !== handler) {
      savedHandler.current = handler;
    }
    // Create event listener that calls handler function stored in ref
    const eventListener = (event: Event) => {
      // eslint-disable-next-line no-extra-boolean-cast
      if (!!savedHandler?.current) {
        savedHandler.current(event);
      }
    };
    targetElement.addEventListener(eventName, eventListener);
    // Remove event listener on cleanup
    return () => {
      targetElement.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element, handler]);
}
