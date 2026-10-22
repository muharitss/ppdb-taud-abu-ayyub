import { useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

export interface AdminProfile {
  id: string;
  full_name: string;
  role: string;
  created_at: string;
}

export interface AdminAuthState {
  user: User | null;
  session: Session | null;
  profile: AdminProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAdminAuth() {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    session: null,
    profile: null,
    isAdmin: false,
    isLoading: true,
    error: null,
  });

  const checkAdminProfile = useCallback(async (user: User | null, session: Session | null) => {
    if (!user) {
      setState({
        user: null,
        session: null,
        profile: null,
        isAdmin: false,
        isLoading: false,
        error: null,
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('admin_profiles')
        .select('id, full_name, role, created_at')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        setState({
          user,
          session,
          profile: null,
          isAdmin: false,
          isLoading: false,
          error: error.message,
        });
        return;
      }

      if (!data || data.role !== 'admin') {
        setState({
          user,
          session,
          profile: null,
          isAdmin: false,
          isLoading: false,
          error: 'Akses ditolak: Akun Anda tidak memiliki hak akses administrator.',
        });
        return;
      }

      setState({
        user,
        session,
        profile: data as AdminProfile,
        isAdmin: true,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      setState({
        user,
        session,
        profile: null,
        isAdmin: false,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Gagal memverifikasi hak akses admin.',
      });
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // shortcut: session initial check and auth listener, token refresh handled automatically by Supabase client
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      checkAdminProfile(session?.user ?? null, session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      checkAdminProfile(session?.user ?? null, session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkAdminProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return {
    ...state,
    signOut,
  };
}

export default useAdminAuth;
