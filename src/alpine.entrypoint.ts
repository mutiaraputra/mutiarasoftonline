import type { Alpine } from 'alpinejs';

export default (Alpine: Alpine) => {
  // Formatter rupiah dipakai lintas komponen (form, kalkulator demo, dll).
  Alpine.magic('rupiah', () => (angka: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(angka || 0),
  );

  Alpine.store('nav', { terbuka: false });
};
