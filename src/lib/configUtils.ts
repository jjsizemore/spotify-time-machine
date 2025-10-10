// Validates environment configuration via zod
import { z } from 'zod';

const nodeEnvSchema = z.enum(['development', 'production']);

const envSchema = z.object({
  NODE_ENV: nodeEnvSchema,
  SPOTIFY_CLIENT_ID: z.string().min(1, 'SPOTIFY_CLIENT_ID is required'),
  SPOTIFY_CLIENT_SECRET: z.string().min(1, 'SPOTIFY_CLIENT_SECRET is required'),
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
});

export const validateConfig = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const missingConfigs = result.error.issues.map((err) => err.path.join('.'));
    throw new Error(`Missing or invalid environment variables: ${missingConfigs.join(', ')}`);
  }
};
