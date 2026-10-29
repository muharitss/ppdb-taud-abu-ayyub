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
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
  });

  await client.connect();
  console.log(`[PPDB Seed] Connecting to database to ensure admin (${email})...`);

  try {
    await client.query('BEGIN');

    const existing = await client.query(
      'SELECT id FROM auth.users WHERE email = $1 LIMIT 1',
      [email]
    );

    if (existing.rowCount === 0) {
      const userInsert = await client.query<{ id: string }>(
        `INSERT INTO auth.users (
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
          gen_random_uuid(),
          'authenticated',
          'authenticated',
          $1,
          crypt($2, gen_salt('bf', 10)),
          now(),
          now(),
          now(),
          '{"provider":"email","providers":["email"]}'::jsonb,
          jsonb_build_object('full_name', $3::text),
          now(),
          now(),
          '',
          '',
          '',
          ''
        ) RETURNING id`,
        [email, password, fullName]
      );

      const newUserId = userInsert.rows[0].id;

      await client.query(
        `INSERT INTO auth.identities (
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
          $1::uuid,
          jsonb_build_object('sub', $1::text, 'email', $2::text),
          'email',
          $1::text,
          now(),
          now(),
          now()
        )`,
        [newUserId, email]
      );

      await client.query(
        `INSERT INTO public.admin_profiles (id, full_name, role, created_at)
         VALUES ($1::uuid, $2::text, 'admin', now())
         ON CONFLICT (id) DO NOTHING`,
        [newUserId, fullName]
      );
    }

    await client.query('COMMIT');

    const res = await client.query(
      'SELECT u.id, u.email, p.full_name, p.role FROM auth.users u JOIN public.admin_profiles p ON u.id = p.id WHERE u.email = $1',
      [email]
    );

    console.log('[PPDB Seed] Admin user ready:', res.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('[PPDB Seed] Error running seed:', err);
  process.exit(1);
});
