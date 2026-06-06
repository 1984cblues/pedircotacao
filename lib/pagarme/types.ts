export interface PagarmeCustomer {
  name: string;
  email: string;
  type: "individual" | "company";
  document: string; // CPF ou CNPJ
  phones?: {
    mobile_phone: {
      country_code: string;
      area_code: string;
      number: string;
    };
  };
}

export interface PagarmeItem {
  amount: number; // in cents
  description: string;
  quantity: number;
  code: string;
}

export interface PagarmePixPayment {
  payment_method: "pix";
  pix: {
    expires_in: number; // in seconds
    additional_information?: { name: string; value: string }[];
  };
}

export interface PagarmeOrderRequest {
  items: PagarmeItem[];
  customer: PagarmeCustomer;
  payments: PagarmePixPayment[];
  metadata?: Record<string, string>;
}

export interface PagarmeOrderResponse {
  id: string;
  code: string;
  amount: number;
  currency: string;
  closed: boolean;
  items: unknown[];
  customer: unknown;
  status: string; // pending, paid, canceled, failed
  created_at: string;
  updated_at: string;
  charges: {
    id: string;
    code: string;
    amount: number;
    status: string;
    payment_method: string;
    last_transaction: {
      id: string;
      transaction_type: string;
      amount: number;
      status: string;
      success: boolean;
      qr_code?: string;
      qr_code_url?: string;
      expires_at?: string;
    };
  }[];
}

export interface PagarmeWebhookPayload {
  id: string;
  type: string; // 'order.paid', 'charge.paid', etc
  created_at: string;
  data: PagarmeOrderResponse;
}
