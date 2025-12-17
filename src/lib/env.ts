/**
 * Environment variable validation and configuration
 */

/**
 * Validates required environment variables at startup
 */
export function validateEnv(): void 
{
  const requiredEnvVars = ['DATABASE_URL'];
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) 
  {
    if (!process.env[envVar]) 
    {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) 
  {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.'
    );
  }

  // Validate DATABASE_URL format
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('mongodb://') && !process.env.DATABASE_URL.startsWith('mongodb+srv://')) 
  {
    console.warn(
      'Warning: DATABASE_URL does not appear to be a valid MongoDB connection string.\n' +
      'Expected format: mongodb://[username:password@]host[:port][/database] or mongodb+srv://...'
    );
  }
}

/**
 * Get environment variable with optional default value
 */
export function getEnv(key: string, defaultValue?: string): string 
{
  const value = process.env[key];
  
  if (value === undefined && defaultValue === undefined) 
  {
    throw new Error(`Environment variable ${key} is not set and no default value provided`);
  }
  
  return value || defaultValue!;
}

/**
 * Get optional environment variable
 */
export function getOptionalEnv(key: string): string | undefined 
{
  return process.env[key];
}

