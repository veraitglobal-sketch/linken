function required(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function getSupabaseEnv() {
  return {
    url: required("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  };
}
