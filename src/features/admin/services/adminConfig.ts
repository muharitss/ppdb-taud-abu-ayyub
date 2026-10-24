import { supabase } from '@/lib/supabase/client';
import { SCHOOL_BANK_INFO, ADMIN_CONTACTS } from '@/config/schoolInfo';

export interface PpdbConfigValues {
  registration_open: boolean;
  ppdb_period: string;
  registration_fee: number;
  bank_name: string;
  bank_account_number: string;
  bank_account_holder: string;
  admin_whatsapp_primary: string;
  admin_whatsapp_secondary: string;
  open_date: string;
  close_date: string;
}

export async function getPpdbConfigs(): Promise<PpdbConfigValues> {
  const { data, error } = await supabase.from('ppdb_config').select('key, value');

  const configs: Record<string, unknown> = {};
  if (!error && data) {
    for (const item of data) {
      configs[item.key] = item.value;
    }
  }

  // Handle bank_info object or individual keys
  const bankObj = (typeof configs.bank_info === 'object' && configs.bank_info !== null
    ? configs.bank_info
    : {}) as Record<string, string>;
  const datesObj = (typeof configs.registration_dates === 'object' && configs.registration_dates !== null
    ? configs.registration_dates
    : {}) as Record<string, string>;
  const waList = Array.isArray(configs.admin_whatsapp) ? configs.admin_whatsapp : [];

  return {
    registration_open: configs.registration_open !== undefined ? Boolean(configs.registration_open) : true,
    ppdb_period: (configs.ppdb_period as string) || '2027/2028',
    registration_fee: Number(configs.registration_fee) || SCHOOL_BANK_INFO.amount,
    bank_name: bankObj.bankName || (configs.bank_name as string) || SCHOOL_BANK_INFO.bankName,
    bank_account_number: bankObj.accountNumber || (configs.bank_account_number as string) || SCHOOL_BANK_INFO.accountNumber,
    bank_account_holder: bankObj.accountHolder || (configs.bank_account_holder as string) || SCHOOL_BANK_INFO.accountHolder,
    admin_whatsapp_primary: (waList[0] as string) || (configs.admin_whatsapp_primary as string) || ADMIN_CONTACTS.primary.whatsappNumber,
    admin_whatsapp_secondary: (waList[1] as string) || (configs.admin_whatsapp_secondary as string) || ADMIN_CONTACTS.secondary.whatsappNumber,
    open_date: datesObj.openDate || (configs.open_date as string) || '2026-11-01',
    close_date: datesObj.closeDate || (configs.close_date as string) || '2026-12-31',
  };
}

export async function savePpdbConfigs(
  values: PpdbConfigValues,
  adminId?: string
): Promise<void> {
  const updates = [
    { key: 'registration_open', value: values.registration_open },
    { key: 'ppdb_period', value: values.ppdb_period },
    { key: 'registration_fee', value: values.registration_fee },
    {
      key: 'bank_info',
      value: {
        bankName: values.bank_name,
        accountNumber: values.bank_account_number,
        accountHolder: values.bank_account_holder,
      },
    },
    {
      key: 'admin_whatsapp',
      value: [values.admin_whatsapp_primary, values.admin_whatsapp_secondary],
    },
    {
      key: 'registration_dates',
      value: {
        openDate: values.open_date,
        closeDate: values.close_date,
      },
    },
  ];

  for (const item of updates) {
    const { error } = await supabase.from('ppdb_config').upsert({
      key: item.key,
      value: item.value,
      updated_by: adminId || null,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      throw new Error(`Gagal menyimpan konfigurasi ${item.key}: ${error.message}`);
    }
  }

  // Attempt to write audit event
  try {
    await supabase.from('audit_events').insert({
      actor_id: adminId || null,
      actor_type: 'admin',
      action: 'config_updated',
      entity_type: 'ppdb_config',
      metadata: {
        registration_open: values.registration_open,
        ppdb_period: values.ppdb_period,
        registration_fee: values.registration_fee,
        bank_name: values.bank_name,
      },
    });
  } catch {
    // Non-blocking
  }
}
