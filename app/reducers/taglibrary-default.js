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
    desciption: '',
    color: '#008000',
    textcolor: '#ffffff',
    children: [
      {
        id: uuidv1(),
        title: 'done',
        type: 'plain',
        description: '',
        color: '#008000',
        textcolor: '#ffffff',
        icon: '',
        keyBinding: ''
      },
      {
        id: uuidv1(),
        title: 'next',
        type: 'plain',
        description: '',
        color: '#008000',
        textcolor: '#ffffff',
        icon: '',
      },
      {
        id: uuidv1(),
        title: 'maybe',
        type: 'plain',
        description: '',
        color: '#008000',
        textcolor: '#ffffff',
        icon: '',
      },
      {
        id: uuidv1(),
        title: 'waiting',
        type: 'plain',
        description: '',
        color: '#008000',
        textcolor: '#ffffff',
        icon: '',
      },
      {
        id: uuidv1(),
        type: 'plain',
        description: '',
        title: 'todo',
        color: '#008000',
        textcolor: '#ffffff',
        icon: '',
      }
    ]
  },
  {
    title: 'Common Tags',
    uuid: '17882854-44a7-4b2d-a2b1-b022846ac41d',
    expanded: true,
    desciption: '',
    color: '#008000',
    textcolor: '#ffffff',
    children: [
      {
        id: uuidv1(),
        type: 'plain',
        title: 'book',
        desciption: '',
        color: '#008000',
        textcolor: '#ffffff',
        icon: '',
      },
      {
        id: uuidv1(),
        type: 'plain',
        title: 'paper',
        desciption: '',
        color: '#008000',
        textcolor: '#ffffff',
        icon: '',
      },
      {
        id: uuidv1(),
        type: 'plain',
        title: 'article',
        desciption: '',
        color: '#008000',
        textcolor: '#ffffff',
        icon: '',
      }
    ]
  },
  {
    title: 'Smart Tags',
    uuid: 'cfd4e8c7-94b6-4529-a1aa-a8e66c7a1f44',
    expanded: true,
    desciption: '',
    color: '#4986e7',
    textcolor: '#ffffff',
    children: [
      {
        id: '73e5a6a7-9aed-4935-bc2d-3aa7959edae5',
        type: 'plain',
        title: 'now',
        functionality: 'now',
        desciption: 'Adds the current date and time as tag',
        color: '#4986e7',
        textcolor: '#ffffff',
        icon: '',
      },
      {
        id: '615b27eb-889c-4966-9fa0-930023f213c0',
        type: 'plain',
        title: 'today',
        functionality: 'today',
        desciption: 'Adds the current date as tag',
        color: '#4986e7',
        textcolor: '#ffffff',
        icon: '',
      },
      {
        id: '0f2d34ee-9923-4bb0-9a64-9264c15a3b57',
        type: 'plain',
        title: 'tomorrow',
        functionality: 'tomorrow',
        desciption: 'Adds tomorrow\'s date as tag',
        color: '#4986e7',
        textcolor: '#ffffff',
        icon: '',
      },
      {
        id: '8ec44eaa-5fae-498a-997d-0b9b51d2963f',
        type: 'plain',
        title: 'yesterday',
        functionality: 'yesterday',
        desciption: 'Adds the date of yesterday as tag',
        color: '#4986e7',
        textcolor: '#ffffff',
        icon: '',
      },
      {
        id: 'f31feb14-9567-41e9-9fe2-5f8de70ec8c5',
        type: 'plain',
        title: 'month',
        functionality: 'currentMonth',
        desciption: 'Adds the current year and month as tag',
        color: '#4986e7',
        textcolor: '#ffffff',
        icon: '',
      },
      {
        id: '208fa38e-115f-4440-8ea9-7550fd974576',
        type: 'plain',
        title: 'year',
        functionality: 'currentYear',
        desciption: 'Adds the current year as tag',
        color: '#4986e7',
        textcolor: '#ffffff',
        icon: '',
      },
      /* {
        id: 'e1f0760e-471c-4418-a404-6cb09e6f6c24',
        type: 'plain',
        title: 'geo-tag',
        functionality: 'geoTagging',
        desciption: 'Add geo coordinates as a tag',
        color: '#4986e7',
        textcolor: '#ffffff',
        icon: '',
      } */
    ]
  },
  {
    title: 'Priorities',
    uuid: 'e21711da-ee78-4c83-bae3-e0007fe426a3',
    expanded: true,
    desciption: '',
    color: '#008000',
    textcolor: '#ffffff',
    children: [
      {
        id: uuidv1(),
        type: 'plain',
        title: 'high',
        desciption: '',
        color: '#ff7537',
        textcolor: '#ffffff',
        icon: '',
      },
      {
        id: uuidv1(),
        type: 'plain',
        title: 'medium',
        desciption: '',
        color: '#ffad46',
        textcolor: '#ffffff',
        icon: '',
      },
      {
        id: uuidv1(),
        type: 'plain',
        title: 'low',
        desciption: '',
        color: '#7bd148',
        textcolor: '#ffffff',
        icon: '',
      }
    ]
  },
  {
    title: 'Ratings',
    uuid: '5cf5173d-738c-4413-9386-3f4411aa7b64',
    expanded: true,
    desciption: '',
    color: '#ffcc24',
    textcolor: '#ffffff',
    children: [
      {
        id: uuidv1(),
        type: 'plain',
        title: '1star',
        desciption: '',
        color: '#ffcc24',
        textcolor: '#ffffff',
        icon: '',
      },
      {
        id: uuidv1(),
        type: 'plain',
        title: '2star',
        desciption: '',
        color: '#ffcc24',
        textcolor: '#ffffff',
        icon: '',
      },
      {
        id: uuidv1(),
        type: 'plain',
        title: '3star',
        desciption: '',
        color: '#ffcc24',
        textcolor: '#ffffff',
        icon: '',
      },
      {
        id: uuidv1(),
        type: 'plain',
        title: '4star',
        desciption: '',
        color: '#ffcc24',
        textcolor: '#ffffff',
        icon: '',
      },
      {
        id: uuidv1(),
        type: 'plain',
        title: '5star',
        desciption: '',
        color: '#ffcc24',
        textcolor: '#ffffff',
        icon: '',
      }
    ]
  }
];
