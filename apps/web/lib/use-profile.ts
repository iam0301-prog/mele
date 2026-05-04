'use client';

import { useEffect, useState } from 'react';

export interface BirthProfile {
  loaded: boolean;
  isAuthed: boolean;
  hasData: boolean;
  display_name: string | null;
  birth_date: string | null;
  birth_time: string | null;
  birth_location: string | null;
  birth_lat: number | null;
  birth_lon: number | null;
  birth_timezone: string | null;
  gender: string | null;
}

const EMPTY: BirthProfile = {
  loaded: false,
  isAuthed: false,
  hasData: false,
  display_name: null,
  birth_date: null,
  birth_time: null,
  birth_location: null,
  birth_lat: null,
  birth_lon: null,
  birth_timezone: null,
  gender: null,
};

export function useProfile(): BirthProfile {
  const [profile, setProfile] = useState<BirthProfile>(EMPTY);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        if (mounted) setProfile({ ...EMPTY, loaded: true });
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('display_name, birth_date, birth_time, birth_location, birth_lat, birth_lon, birth_timezone, gender')
        .eq('id', user.id)
        .maybeSingle();

      if (!mounted) return;

      const hasData = Boolean(data && (data.birth_date || data.birth_time || data.birth_lat || data.birth_lon));
      setProfile({
        loaded: true,
        isAuthed: true,
        hasData,
        display_name: data?.display_name ?? user.user_metadata?.display_name ?? null,
        birth_date: data?.birth_date ?? null,
        birth_time: data?.birth_time ?? null,
        birth_location: data?.birth_location ?? null,
        birth_lat: data?.birth_lat ?? null,
        birth_lon: data?.birth_lon ?? null,
        birth_timezone: data?.birth_timezone ?? null,
        gender: data?.gender ?? null,
      });
    }

    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  return profile;
}

export function normalizeTime(value: string | null | undefined): string {
  if (!value) return '';
  return value.slice(0, 5);
}
