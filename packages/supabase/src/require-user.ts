import type { JwtPayload, SupabaseClient } from '@supabase/supabase-js';

import { checkRequiresMultiFactorAuthentication } from './check-requires-mfa';

const MULTI_FACTOR_AUTH_VERIFY_PATH = '/auth/verify';
const SIGN_IN_PATH = '/auth/sign-in';

/**
 * @name requireUser
 * @description Require a session to be present in the request
 * @param client
 */
export async function requireUser(client: SupabaseClient): Promise<
  | {
      error: null;
      data: JwtPayload;
    }
  | (
      | {
          error: AuthenticationError;
          data: null;
          redirectTo: string;
        }
      | {
          error: MultiFactorAuthError;
          data: null;
          redirectTo: string;
        }
    )
> {
  const { data, error } = await client.auth.getClaims();

  if (!data?.claims || error) {
    return {
      data: null,
      error: new AuthenticationError(),
      redirectTo: SIGN_IN_PATH,
    };
  }

  const requiresMfa = await checkRequiresMultiFactorAuthentication(client);

  // If the user requires multi-factor authentication,
  // redirect them to the page where they can verify their identity.
  if (requiresMfa) {
    return {
      data: null,
      error: new MultiFactorAuthError(),
      redirectTo: MULTI_FACTOR_AUTH_VERIFY_PATH,
    };
  }

  return {
    error: null,
    data: {
      ...data.claims,
      id: data.claims.sub,
    },
  };
}

class AuthenticationError extends Error {
  constructor() {
    super(`Authentication required`);
  }
}

class MultiFactorAuthError extends Error {
  constructor() {
    super(`Multi-factor authentication required`);
  }
}
