import { z } from 'zod';

export const zodParseFactory =
  <T extends z.ZodType>(schema: T) =>
  (data: unknown): z.infer<T> => {
    try {
      return schema.parse(data);
    } catch (err) {
      console.error(err);

      // handle error
      throw new Error(`Invalid data: ${err as string}`);
    }
  };
