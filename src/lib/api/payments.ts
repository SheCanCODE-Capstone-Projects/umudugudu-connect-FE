const API_URL =
  "https://umudugudu-connect-be-production.up.railway.app/api/v1/payments/v1";

export async function getPayments() {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch payments");
  }

  return response.json();
}