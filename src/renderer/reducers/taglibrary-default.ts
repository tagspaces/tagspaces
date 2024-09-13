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
 */

import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import { TS } from '-/tagspaces.namespace';

export default [
  {
    title: 'ToDo Workflow',
    uuid: getUuid(),
    color: '#008000',
    textcolor: '#ffffff',
    children: [
      {
        title: 'done',
        color: '#008000',
        textcolor: '#ffffff',
      },
      {
        title: 'next',
        color: '#008000',
        textcolor: '#ffffff',
      },
      {
        title: 'maybe',
        color: '#008000',
        textcolor: '#ffffff',
      },
      {
        title: 'waiting',
        color: '#008000',
        textcolor: '#ffffff',
      },
      {
        title: 'todo',
        color: '#008000',
        textcolor: '#ffffff',
      },
    ],
  },
  {
    title: 'Common Tags',
    uuid: getUuid(),
    color: '#008000',
    textcolor: '#ffffff',
    children: [
      {
        title: 'book',
        color: '#008000',
        textcolor: '#ffffff',
      },
      {
        title: 'paper',
        color: '#008000',
        textcolor: '#ffffff',
      },
      {
        title: 'article',
        color: '#008000',
        textcolor: '#ffffff',
      },
    ],
  },
  {
    title: 'Priorities',
    uuid: getUuid(),
    color: '#008000',
    textcolor: '#ffffff',
    children: [
      {
        title: 'high',
        color: '#ff7537',
        textcolor: '#ffffff',
      },
      {
        title: 'medium',
        color: '#ffad46',
        textcolor: '#ffffff',
      },
      {
        title: 'low',
        color: '#7bd148',
        textcolor: '#ffffff',
      },
    ],
  },
  {
    title: 'Emojis 🎨',
    // description: '',
    uuid: getUuid(),
    color: '#d2d1d19e',
    textcolor: '#000000',
    children: [
      {
        title: '💡',
        description: 'lightbulb',
        color: '#d2d1d19e',
        textcolor: '#000000',
      },
      {
        title: '⭐',
        description: 'star',
        color: '#d2d1d19e',
        textcolor: '#000000',
      },
      {
        title: '💎',
        description: 'diamond',
        color: '#d2d1d19e',
        textcolor: '#000000',
      },
      {
        title: '🧬',
        description: 'dna',
        color: '#d2d1d19e',
        textcolor: '#000000',
      },
      {
        title: '🚲',
        description: 'bicycle',
        color: '#d2d1d19e',
        textcolor: '#000000',
      },

      {
        title: '🎁',
        description: 'gift',
        color: '#d2d1d19e',
        textcolor: '#000000',
      },
      {
        title: '🥝',
        description: 'kiwi',
        color: '#d2d1d19e',
        textcolor: '#000000',
      },
      {
        title: '🥥',
        description: 'coconut',
        color: '#d2d1d19e',
        textcolor: '#000000',
      },
      {
        title: '📖',
        description: 'book',
        color: '#d2d1d19e',
        textcolor: '#000000',
      },
      {
        title: '🥨',
        description: 'pretzel',
        color: '#d2d1d19e',
        textcolor: '#000000',
      },
    ],
  },
  {
    title: 'Ratings',
    uuid: getUuid(),
    color: '#ffcc24',
    textcolor: '#ffffff',
    children: [
      {
        title: '1star',
        color: '#ffcc24',
        textcolor: '#ffffff',
      },
      {
        title: '2star',
        color: '#ffcc24',
        textcolor: '#ffffff',
      },
      {
        title: '3star',
        color: '#ffcc24',
        textcolor: '#ffffff',
      },
      {
        title: '4star',
        color: '#ffcc24',
        textcolor: '#ffffff',
      },
      {
        title: '5star',
        color: '#ffcc24',
        textcolor: '#ffffff',
      },
    ],
  },
] as TS.TagGroup[];
