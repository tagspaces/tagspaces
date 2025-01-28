import { z } from 'zod';

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
export const Description = z.object({
  name: z.string(),
  summary: z.string(),
});
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

export const ImageDescription = z.object(imageDescriptionObj);
