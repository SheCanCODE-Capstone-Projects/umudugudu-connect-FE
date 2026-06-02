import apiClient from './client';

export type MobileMoneyProvider = 'MTN' | 'AIRTEL';
export type PaymentType = 'PENALTY' | 'CONTRIBUTION';
export type PaymentStatus = 'PENDING' | 'PAID' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export type InitiatePenaltyPaymentPayload = {
  penaltyId: string;
  amount: number;
  phoneNumber: string;
  provider: MobileMoneyProvider;
};

export type InitiatePaymentResponse = {
  success: boolean;
  message: string;
  transactionId?: string;
  paymentId?: string;
  status?: PaymentStatus;
  raw: Record<string, unknown>;
};

export type PaymentRecord = {
  id: string;
  citizenId?: string;
  citizenName: string;
  amount: number;
  paymentType: PaymentType;
  paymentMethod: MobileMoneyProvider | string;
  status: PaymentStatus | string;
  timestamp: string;
  village?: string;
  isibo?: string;
  reference?: string;
};

export type PaymentFilters = {
  page?: number;
  size?: number;
  search?: string;
  from?: string;
  to?: string;
  isibo?: string;
  paymentType?: string;
  status?: string;
  sort?: string;
};

export type PaymentPage = {
  content: PaymentRecord[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

const unwrap = (value: unknown): unknown => {
  const body = asRecord(value);
  return 'data' in body ? body.data : value;
};

const stringValue = (source: Record<string, unknown>, keys: string[], fallback = '') => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return fallback;
};

const numberValue = (source: Record<string, unknown>, keys: string[], fallback = 0) => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) return Number(value);
  }
  return fallback;
};

const normalizePaymentRecord = (value: unknown): PaymentRecord => {
  const row = asRecord(value);
  const citizen = asRecord(row.citizen);
  const user = asRecord(row.user);
  const village = asRecord(row.village);
  const isibo = asRecord(row.isibo);
  const firstName = stringValue(citizen, ['firstName']) || stringValue(user, ['firstName']);
  const lastName = stringValue(citizen, ['lastName']) || stringValue(user, ['lastName']);
  const fullName =
    stringValue(row, ['citizenName', 'citizenFullName', 'payerName', 'fullName']) ||
    [firstName, lastName].filter(Boolean).join(' ') ||
    '-';

  return {
    id: stringValue(row, ['id', 'paymentId', 'transactionId', 'reference'], crypto.randomUUID()),
    citizenId: stringValue(row, ['citizenId', 'payerId', 'userId']) || undefined,
    citizenName: fullName,
    amount: numberValue(row, ['amount', 'amountRwf', 'amountRwfs', 'totalAmount']),
    paymentType: (stringValue(row, ['paymentType', 'type'], 'PENALTY').toUpperCase() as PaymentType) || 'PENALTY',
    paymentMethod: stringValue(row, ['paymentMethod', 'method', 'provider'], '-'),
    status: stringValue(row, ['status'], 'PENDING'),
    timestamp: stringValue(row, ['timestamp', 'createdAt', 'paidAt', 'initiatedAt'], new Date().toISOString()),
    village: stringValue(row, ['villageName']) || stringValue(village, ['name']) || undefined,
    isibo: stringValue(row, ['isiboName']) || stringValue(isibo, ['name']) || undefined,
    reference: stringValue(row, ['reference', 'externalTxId', 'transactionId']) || undefined,
  };
};

const normalizePage = (payload: unknown, fallbackPage: number, fallbackSize: number): PaymentPage => {
  const data = unwrap(payload);
  const body = asRecord(data);
  const contentSource = Array.isArray(data)
    ? data
    : Array.isArray(body.content)
      ? body.content
      : Array.isArray(body.records)
        ? body.records
        : Array.isArray(body.payments)
          ? body.payments
          : [];

  return {
    content: contentSource.map(normalizePaymentRecord),
    totalElements: numberValue(body, ['totalElements', 'total', 'count'], contentSource.length),
    totalPages: numberValue(body, ['totalPages'], 1),
    size: numberValue(body, ['size'], fallbackSize),
    number: numberValue(body, ['number', 'page'], fallbackPage),
  };
};

export async function initiatePenaltyPayment(payload: InitiatePenaltyPaymentPayload): Promise<InitiatePaymentResponse> {
  const requestBody = {
    penaltyId: payload.penaltyId,
    payableId: payload.penaltyId,
    paymentType: 'PENALTY',
    type: 'PENALTY',
    amount: payload.amount,
    amountRwf: payload.amount,
    phoneNumber: payload.phoneNumber.trim(),
    provider: payload.provider,
    paymentMethod: payload.provider === 'MTN' ? 'MTN_MOMO' : 'AIRTEL_MONEY',
    method: payload.provider,
  };

  const { data } = await apiClient.post('/payments/initiate', requestBody);
  const body = asRecord(unwrap(data));

  return {
    success: Boolean(body.success ?? true),
    message: stringValue(body, ['message'], 'Payment request sent. Confirm the prompt on your phone.'),
    transactionId: stringValue(body, ['transactionId', 'externalTxId', 'reference']) || undefined,
    paymentId: stringValue(body, ['paymentId', 'id']) || undefined,
    status: (stringValue(body, ['status']) as PaymentStatus) || undefined,
    raw: body,
  };
}

export async function getVillagePayments(filters: PaymentFilters = {}): Promise<PaymentPage> {
  const { data } = await apiClient.get('/payments/village', {
    params: {
      page: filters.page ?? 0,
      size: filters.size ?? 20,
    },
  });
  return normalizePage(data, filters.page ?? 0, filters.size ?? 20);
}

export async function exportPaymentsCsv(from: string, to: string): Promise<Blob> {
  const response = await apiClient.get('/payments/export', {
    params: { from, to },
    responseType: 'blob',
  });
  return response.data;
}

export function filterPaymentRecords(records: PaymentRecord[], filters: PaymentFilters) {
  const query = filters.search?.trim().toLowerCase();
  const fromTime = filters.from ? new Date(`${filters.from}T00:00:00`).getTime() : undefined;
  const toTime = filters.to ? new Date(`${filters.to}T23:59:59`).getTime() : undefined;

  return records.filter((record) => {
    const timestamp = new Date(record.timestamp).getTime();
    if (fromTime && timestamp < fromTime) return false;
    if (toTime && timestamp > toTime) return false;
    if (filters.isibo && record.isibo !== filters.isibo) return false;
    if (filters.paymentType && record.paymentType !== filters.paymentType) return false;
    if (filters.status && record.status !== filters.status) return false;
    if (query) {
      const haystack = [
        record.citizenName,
        record.amount,
        record.paymentType,
        record.paymentMethod,
        record.status,
        record.village,
        record.isibo,
        record.reference,
      ].join(' ').toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}
