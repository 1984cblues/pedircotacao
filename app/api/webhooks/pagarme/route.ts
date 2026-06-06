import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/pagarme/webhooks";
import { createAdminClient } from "@/lib/supabase/admin";
import { PagarmeWebhookPayload } from "@/lib/pagarme/types";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("pagarme-webhook-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    const payloadText = await req.text();
    const isValid = verifyWebhookSignature(payloadText, signature);

    if (!isValid) {
      // In dev mode you might want to skip this, but strict by default
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(payloadText) as PagarmeWebhookPayload;

    if (payload.type === "order.paid") {
      const orderId = payload.data.id;
      const supabase = createAdminClient();

      // Find the pending payment with this order ID
      const { data: pagamento, error: pagamentoError } = await supabase
        .from("pagamentos")
        .select("*")
        .eq("pagarme_order_id", orderId)
        .eq("status", "pending")
        .single();

      if (pagamentoError || !pagamento) {
        console.error("Payment not found or already processed", orderId);
        return NextResponse.json({ received: true });
      }

      // Update payment status
      await supabase
        .from("pagamentos")
        .update({ status: "paid", pago_em: new Date().toISOString() })
        .eq("id", pagamento.id);

      // Fetch the credit package
      const { data: pacote } = await supabase
        .from("pacotes_credito")
        .select("quantidade")
        .eq("id", pagamento.pacote_id)
        .single();

      if (pacote) {
        // Call the RPC function to safely update balance and log transaction
        const { error: rpcError } = await supabase.rpc("creditar_por_pagamento", {
          p_empresa_id: pagamento.empresa_id,
          p_pagamento_id: pagamento.id,
          p_pacote_id: pagamento.pacote_id,
          p_quantidade: pacote.quantidade
        });

        if (rpcError) {
          console.error("Error crediting payment:", rpcError);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
