/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2025-present TagSpaces GmbH
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

import { z } from 'zod';
export type StructuredDataProps = {
  name?: boolean;
  summary?: boolean;
  objects?: boolean;
  scene?: boolean;
  colors?: boolean;
  time_of_day?: boolean;
  settings?: boolean;
  text_content?: boolean;
  topics?: boolean;
};

export const getZodTags = (max = 4, tagsArray: string[] = []) => {
  if (tagsArray.length > 0) {
    const [firstTag, ...restTags] = tagsArray;
    return z.object({
      topics: z
        .array(z.enum([firstTag, ...restTags]))
        .min(1)
        .max(max)
        .describe('The predefined topics'),
    });
  }
  return z.object({
    topics: z
      .array(z.string())
      .min(1)
      .max(max)
      .describe('The predefined topics'),
  });
};
/*export const Description = z.object({
  name: z.string(),
  summary: z.string(),
});*/
const ObjectSchema = z.object({
  name: z.string().describe('The name of the object'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('The confidence score of the object detection'),
  attributes: z
    .record(z.any())
    .optional()
    .describe('Additional attributes of the object'),
  //attributes: z.string(),
});
export const imageDescriptionObj = {
  name: z.string().describe('The name of the Image'),
  summary: z.string().describe('A concise summary of the image'),
  objects: z
    .array(ObjectSchema)
    .describe('An array of objects detected in the image'),
  scene: z.string().describe('The scene of the image'),
  colors: z
    .array(z.string())
    .describe('An array of colors detected in the image'),
  time_of_day: z
    .enum(['Morning', 'Afternoon', 'Evening', 'Night', 'Unknown'])
    .describe('The time of day the image was taken'),
  setting: z
    .enum(['Indoor', 'Outdoor', 'Unknown'])
    .describe('The setting of the image'),
  text_content: z
    .string()
    .optional()
    .describe('Any text detected in the image'),
};

export const getZodDescription = (options: StructuredDataProps) =>
  z.object({
    ...(options.name && { name: imageDescriptionObj.name }),
    ...(options.summary && { summary: imageDescriptionObj.summary }),
    ...(options.objects && { objects: imageDescriptionObj.objects }),
    ...(options.scene && { scene: imageDescriptionObj.scene }),
    ...(options.colors && { colors: imageDescriptionObj.colors }),
    ...(options.time_of_day && {
      time_of_day: imageDescriptionObj.time_of_day,
    }),
    ...(options.settings && { setting: imageDescriptionObj.setting }),
    ...(options.text_content && {
      text_content: imageDescriptionObj.text_content,
    }),
  });
