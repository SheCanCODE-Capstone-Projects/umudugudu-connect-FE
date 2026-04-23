/** Format amount in Rwandan Francs */
export const formatRwf = (amount: number): string =>
  new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(amount);

/** Format date for display */
export const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat('en-RW', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso));

/** Format datetime for display */
export const formatDateTime = (iso: string): string =>
  new Intl.DateTimeFormat('en-RW', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));

/** Format phone number for display */
export const formatPhone = (phone: string): string =>
  phone.startsWith('+250') ? phone : `+250${phone.replace(/^0/, '')}`;
