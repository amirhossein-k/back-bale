

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