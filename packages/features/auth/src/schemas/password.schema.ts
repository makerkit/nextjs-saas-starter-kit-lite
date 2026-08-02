import { z } from 'zod';

/**
 * Password requirements
 * These are the requirements for the password when signing up or changing the password
 */
const requirements = {
  minLength: 8,
  maxLength: 99,
  specialChars:
    process.env.NEXT_PUBLIC_PASSWORD_REQUIRE_SPECIAL_CHARS === 'true',
  numbers: process.env.NEXT_PUBLIC_PASSWORD_REQUIRE_NUMBERS === 'true',
  uppercase: process.env.NEXT_PUBLIC_PASSWORD_REQUIRE_UPPERCASE === 'true',
};

/**
 * Password schema
 * This is used to validate the password on sign in (for existing users when requirements are not enforced)
 */
export const PasswordSchema = z
  .string()
  .min(requirements.minLength)
  .max(requirements.maxLength);

/**
 * Refined password schema with additional requirements
 * This is required to validate the password requirements on sign up and password change
 */
export const RefinedPasswordSchema = PasswordSchema.superRefine((val, ctx) => {
  validatePassword(val, ctx);
});

export function refineRepeatPassword<
  T extends { password: string; repeatPassword: string },
>(data: T, ctx: z.RefinementCtx<T>) {
  if (data.password !== data.repeatPassword) {
    ctx.addIssue({
      message: 'auth.errors.passwordsDoNotMatch',
      path: ['repeatPassword'],
      code: 'custom',
    });
  }
}

function validatePassword(password: string, ctx: z.RefinementCtx<string>) {
  if (requirements.specialChars) {
    const specialCharsCount =
      password.match(/[!@#$%^&*(),.?":{}|<>]/g)?.length ?? 0;

    if (specialCharsCount < 1) {
      ctx.addIssue({
        message: 'auth.errors.minPasswordSpecialChars',
        code: 'custom',
      });
    }
  }

  if (requirements.numbers) {
    const numbersCount = password.match(/\d/g)?.length ?? 0;

    if (numbersCount < 1) {
      ctx.addIssue({
        message: 'auth.errors.minPasswordNumbers',
        code: 'custom',
      });
    }
  }

  if (requirements.uppercase) {
    if (!/[A-Z]/.test(password)) {
      ctx.addIssue({
        message: 'auth.errors.uppercasePassword',
        code: 'custom',
      });
    }
  }
}
