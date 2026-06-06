"use server";

import { createServerSupabaseClient as createClient } from "@/lib/supabase/server";
import { createOrder } from "@/lib/pagarme/client";
import { PagarmeOrderRequest } from "@/lib/pagarme/types";

export async function criarPedidoPix(pacoteId: string, empresaId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Não autorizado");
  }

  // Verificar se o usuário é dono da empresa
  const { data: empresa } = await supabase
    .from("empresas")
    .select("id, razao_social, cnpj, email, telefone")
    .eq("id", empresaId)
    .eq("user_id", user.id)
    .single();

  if (!empresa) {
    throw new Error("Empresa não encontrada ou você não tem permissão");
  }

  // Buscar informações do pacote de crédito
  const { data: pacote } = await supabase
    .from("pacotes_credito")
    .select("*")
    .eq("id", pacoteId)
    .single();

  if (!pacote) {
    throw new Error("Pacote não encontrado");
  }

  // Prepara o payload para o Pagar.me
  const payload: PagarmeOrderRequest = {
    customer: {
      name: empresa.razao_social,
      email: empresa.email || user.email || "contato@empresa.com",
      type: "company",
      document: empresa.cnpj.replace(/\D/g, ""), // Apenas números
    },
    items: [
      {
        amount: pacote.preco_centavos,
        description: `Pacote de Créditos: ${pacote.nome} (${pacote.quantidade} créditos)`,
        quantity: 1,
        code: pacote.id.toString(),
      },
    ],
    payments: [
      {
        payment_method: "pix",
        pix: {
          expires_in: 3600, // 1 hora
        },
      },
    ],
    metadata: {
      empresa_id: empresaId,
      pacote_id: pacoteId,
    },
  };

  try {
    const orderResponse = await createOrder(payload);
    
    // Obter dados do Pix (QR Code)
    const pixCharge = orderResponse.charges?.find(c => c.payment_method === "pix");
    if (!pixCharge) {
      throw new Error("Resposta do Pagar.me não contém cobrança Pix");
    }

    const qrCode = pixCharge.last_transaction.qr_code;
    const qrCodeUrl = pixCharge.last_transaction.qr_code_url;

    // Salvar no banco
    const { error: insertError } = await supabase.from("pagamentos").insert({
      empresa_id: empresaId,
      pacote_id: pacoteId,
      pagarme_order_id: orderResponse.id,
      pagarme_charge_id: pixCharge.id,
      metodo: "pix",
      valor_centavos: pacote.preco_centavos,
      creditos_quantidade: pacote.quantidade,
      status: "pending",
      pix_qrcode: qrCode,
      pix_qrcode_url: qrCodeUrl,
    });

    if (insertError) {
      console.error("Erro ao inserir pagamento no banco:", insertError);
      throw new Error("Erro ao salvar pedido no sistema");
    }

    return {
      success: true,
      orderId: orderResponse.id,
      qrCode,
      qrCodeUrl,
      amount: pacote.preco_centavos,
    };
  } catch (error: any) {
    console.error("Erro ao criar pedido no Pagar.me:", error);
    return {
      success: false,
      error: error.message || "Falha ao criar pedido",
    };
  }
}
