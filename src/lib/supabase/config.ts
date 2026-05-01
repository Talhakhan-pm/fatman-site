const required = (value: string | undefined, name: string) => {
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
};

export const supabaseUrl = required(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  "NEXT_PUBLIC_SUPABASE_URL",
);

export const supabasePublishableKey = required(
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
);

export const supabaseServiceRoleKey = required(
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  "SUPABASE_SERVICE_ROLE_KEY",
);
