/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
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
 * @flow
 */

// import AppConfig from '../config';
import uuidv1 from 'uuid';

export default [
  {
    title: 'ToDo Workflow',
    uuid: '50567824-16ba-4fda-a128-3865df97472f',
    expanded: true,
    color: '#008000',
    textcolor: '#ffffff',
    children: [
      {
        id: uuidv1(),
        title: 'done',
        type: 'plain',
        color: '#008000',
        textcolor: '#ffffff',
        keyBinding: ''
      },
      {
        id: uuidv1(),
        title: 'next',
        type: 'plain',
        color: '#008000',
        textcolor: '#ffffff',
      },
      {
        id: uuidv1(),
        title: 'maybe',
        type: 'plain',
        color: '#008000',
        textcolor: '#ffffff',
      },
      {
        id: uuidv1(),
        title: 'waiting',
        type: 'plain',
        color: '#008000',
        textcolor: '#ffffff',
      },
      {
        id: uuidv1(),
        type: 'plain',
        title: 'todo',
        color: '#008000',
        textcolor: '#ffffff',
      }
    ]
  },
  {
    title: 'Common Tags',
    uuid: '17882854-44a7-4b2d-a2b1-b022846ac41d',
    expanded: true,
    color: '#008000',
    textcolor: '#ffffff',
    children: [
      {
        id: uuidv1(),
        type: 'plain',
        title: 'book',
        color: '#008000',
        textcolor: '#ffffff',
      },
      {
        id: uuidv1(),
        type: 'plain',
        title: 'paper',
        color: '#008000',
        textcolor: '#ffffff',
      },
      {
        id: uuidv1(),
        type: 'plain',
        title: 'article',
        color: '#008000',
        textcolor: '#ffffff',
      }
    ]
  },
  {
    title: 'Priorities',
    uuid: 'e21711da-ee78-4c83-bae3-e0007fe426a3',
    expanded: true,
    color: '#008000',
    textcolor: '#ffffff',
    children: [
      {
        id: uuidv1(),
        type: 'plain',
        title: 'high',
        description: '',
        color: '#ff7537',
        textcolor: '#ffffff',
      },
      {
        id: uuidv1(),
        type: 'plain',
        title: 'medium',
        color: '#ffad46',
        textcolor: '#ffffff',
      },
      {
        id: uuidv1(),
        type: 'plain',
        title: 'low',
        color: '#7bd148',
        textcolor: '#ffffff',
      }
    ]
  },
  {
    title: 'Ratings',
    uuid: '5cf5173d-738c-4413-9386-3f4411aa7b64',
    expanded: true,
    color: '#ffcc24',
    textcolor: '#ffffff',
    children: [
      {
        id: uuidv1(),
        type: 'plain',
        title: '1star',
        color: '#ffcc24',
        textcolor: '#ffffff',
      },
      {
        id: uuidv1(),
        type: 'plain',
        title: '2star',
        color: '#ffcc24',
        textcolor: '#ffffff',
      },
      {
        id: uuidv1(),
        type: 'plain',
        title: '3star',
        color: '#ffcc24',
        textcolor: '#ffffff',
      },
      {
        id: uuidv1(),
        type: 'plain',
        title: '4star',
        color: '#ffcc24',
        textcolor: '#ffffff',
      },
      {
        id: uuidv1(),
        type: 'plain',
        title: '5star',
        color: '#ffcc24',
        textcolor: '#ffffff',
      }
    ]
  }
];
