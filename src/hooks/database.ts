

// تبدیل اسم انگلیسی در دیتا بیس monthcarge ّه فارسی
type PersianMonthAbbr = 'far' | 'ordi' | 'khor' | 'tir' | 'mor' | 'shahr' | 'mehr' | 'aban' | 'azar' | 'dey' | 'bahman' | 'esfand';

const MONTH_MAP: Record<PersianMonthAbbr, string> = {
    far: 'فروردین',
    ordi: 'اردیبهشت',
    khor: 'خرداد',
    tir: 'تیر',
    mor: 'مرداد',
    shahr: 'شهریور',
    mehr: 'مهر',
    aban: 'آبان',
    azar: 'آذر',
    dey: 'دی',
    bahman: 'بهمن',
    esfand: 'اسفند'
}

export function getPersianMonthName(eng: string): string | undefined {
    return MONTH_MAP[eng.toLowerCase() as PersianMonthAbbr]
}

export const MONTHS = [
    'far', 'ordi', 'khor', 'tir', 'mor', 'shahr',
    'mehr', 'aban', 'azar', 'dey', 'bahman', 'esfand'
] as const;

type ChargeAbbr = 'charge' | 'electricity' | 'water' | 'Facilities' | 'extra' | 'facilities'
export const ChargeType_MAP: Record<ChargeAbbr, string> = {
    'charge': "شارژ ماعیانه", 'electricity': "برق ساختمان", 'water': "هزینه آب", 'Facilities': "امکانات رفاهی", facilities: 'امکانات رفاهی"', 'extra': "خدمات اضافی"
}
export const ChargeTypes = ['charge', 'electricity', 'water', 'Facilities', 'facilities', 'extra'] as const;
export function getPersianChargeName(eng: string): string | undefined {
    return ChargeType_MAP[eng.toLowerCase() as ChargeAbbr]
}