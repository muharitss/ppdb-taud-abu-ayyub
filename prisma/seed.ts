import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const email = process.env.INITIAL_ADMIN_EMAIL || 'admin@taud-abu-ayyub.sch.id';
const password = process.env.INITIAL_ADMIN_PASSWORD || 'AdminPassword2026!';
const fullName = process.env.INITIAL_ADMIN_NAME || 'Administrator PPDB TAUD Abu Ayyub';

if (!process.env.DATABASE_URL) {
  console.error('[PPDB Seed] DATABASE_URL is missing in environment variables.');
  process.exit(1);
}

async function main() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log(`[PPDB Seed] Connecting to database to ensure admin (${email})...`);

  const seedSql = `
  DO $$
  DECLARE
    new_user_id uuid := gen_random_uuid();
    encrypted_pw text;
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = '${email}') THEN
      encrypted_pw := crypt('${password}', gen_salt('bf', 10));

      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        new_user_id,
        'authenticated',
        'authenticated',
        '${email}',
        encrypted_pw,
        now(),
        now(),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        json_build_object('full_name', '${fullName}')::jsonb,
        now(),
        now(),
        '',
        '',
        '',
        ''
      );

      INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        new_user_id,
        json_build_object('sub', new_user_id::text, 'email', '${email}')::jsonb,
        'email',
        new_user_id::text,
        now(),
        now(),
        now()
      );

      INSERT INTO public.admin_profiles (id, full_name, role, created_at)
      VALUES (new_user_id, '${fullName}', 'admin', now())
      ON CONFLICT (id) DO NOTHING;
    END IF;
  END $$;
  `;

  await client.query(seedSql);

  const res = await client.query(
    'SELECT u.id, u.email, p.full_name, p.role FROM auth.users u JOIN public.admin_profiles p ON u.id = p.id WHERE u.email = $1',
    [email]
  );

  console.log('[PPDB Seed] Admin user ready:', res.rows[0]);
  await client.end();
}

main().catch((err) => {
  console.error('[PPDB Seed] Error running seed:', err);
  process.exit(1);
});
