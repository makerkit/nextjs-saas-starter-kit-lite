import 'server-only';

import { z } from 'zod';

const message =
  'Invalid Supabase Service Role Key. Please add the environment variable SUPABASE_SERVICE_ROLE_KEY.';

/**
 * @name getServiceRoleKey
 * @description Get the Supabase Service Role Key.
 * ONLY USE IN SERVER-SIDE CODE. DO NOT EXPOSE THIS TO CLIENT-SIDE CODE.
 */
export function getServiceRoleKey() {
  return z
    .string({
      error: message,
    })
    .min(1, {
      message: message,
    })
    .parse(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Displays a warning message if the Supabase Service Role is being used.
 */
export function warnServiceRoleKeyUsage() {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `[Dev Only] This is a simple warning to let you know you are using the Supabase Service Role. Make sure it's the right call.`,
    );
  }
}
