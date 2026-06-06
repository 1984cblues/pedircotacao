import "server-only";
import { PagarmeOrderRequest, PagarmeOrderResponse } from "./types";

const PAGARME_API_URL = "https://api.pagar.me/core/v5";

function getSecretKey() {
  const key = process.env.PAGARME_SECRET_KEY;
  if (!key) {
    throw new Error("PAGARME_SECRET_KEY is not defined in environment variables");
  }
  return key;
}

function getAuthHeader() {
  const key = getSecretKey();
  const encodedKey = Buffer.from(`${key}:`).toString("base64");
  return `Basic ${encodedKey}`;
}

export async function createOrder(
  payload: PagarmeOrderRequest
): Promise<PagarmeOrderResponse> {
  const url = `${PAGARME_API_URL}/orders`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Pagar.me createOrder error:", errorBody);
    throw new Error(`Pagar.me API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getOrder(orderId: string): Promise<PagarmeOrderResponse> {
  const url = `${PAGARME_API_URL}/orders/${orderId}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthHeader(),
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Pagar.me getOrder error:", errorBody);
    throw new Error(`Pagar.me API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
