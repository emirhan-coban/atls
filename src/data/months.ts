export const MONTHS = [
  { id: '01', shortTr: 'Oca', shortEn: 'Jan', longTr: 'Ocak', longEn: 'January' },
  { id: '02', shortTr: 'Şub', shortEn: 'Feb', longTr: 'Şubat', longEn: 'February' },
  { id: '03', shortTr: 'Mar', shortEn: 'Mar', longTr: 'Mart', longEn: 'March' },
  { id: '04', shortTr: 'Nis', shortEn: 'Apr', longTr: 'Nisan', longEn: 'April' },
  { id: '05', shortTr: 'May', shortEn: 'May', longTr: 'Mayıs', longEn: 'May' },
  { id: '06', shortTr: 'Haz', shortEn: 'Jun', longTr: 'Haziran', longEn: 'June' },
  { id: '07', shortTr: 'Tem', shortEn: 'Jul', longTr: 'Temmuz', longEn: 'July' },
  { id: '08', shortTr: 'Ağu', shortEn: 'Aug', longTr: 'Ağustos', longEn: 'August' },
  { id: '09', shortTr: 'Eyl', shortEn: 'Sep', longTr: 'Eylül', longEn: 'September' },
  { id: '10', shortTr: 'Eki', shortEn: 'Oct', longTr: 'Ekim', longEn: 'October' },
  { id: '11', shortTr: 'Kas', shortEn: 'Nov', longTr: 'Kasım', longEn: 'November' },
  { id: '12', shortTr: 'Ara', shortEn: 'Dec', longTr: 'Aralık', longEn: 'December' },
];

export const monthShort = (id: string | null | undefined, lang: 'tr' | 'en') => {
  const m = MONTHS.find((x) => x.id === id);
  return m ? (lang === 'tr' ? m.shortTr : m.shortEn) : '';
};
