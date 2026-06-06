"use client";

import { useState } from "react";
import { criarPedidoPix } from "@/lib/actions/credito.actions";

type Pacote = {
  id: number;
  nome: string;
  descricao: string | null;
  quantidade: number;
  preco_centavos: number;
  economia_percentual: number;
  destaque: boolean;
};

export default function ClientCreditosPage({
  pacotes,
  empresaId,
}: {
  pacotes: Pacote[];
  empresaId: string;
}) {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [pixData, setPixData] = useState<{
    qrCode: string;
    qrCodeUrl: string;
    amount: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleComprar = async (pacoteId: number) => {
    setLoadingId(pacoteId);
    setError(null);
    setPixData(null);

    const result = await criarPedidoPix(pacoteId.toString(), empresaId);

    if (result.success && result.qrCode && result.qrCodeUrl) {
      setPixData({
        qrCode: result.qrCode,
        qrCodeUrl: result.qrCodeUrl,
        amount: result.amount || 0,
      });
    } else {
      setError(result.error || "Ocorreu um erro ao gerar o pedido.");
    }
    setLoadingId(null);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {pixData ? (
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center max-w-xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Pague via Pix</h2>
          <p className="text-gray-600">
            Escaneie o QR Code abaixo no app do seu banco ou copie o código Pix Copia e Cola.
            <br />
            <strong>Valor: {formatCurrency(pixData.amount)}</strong>
          </p>

          <div className="flex justify-center p-4 bg-white border-2 border-gray-100 rounded-lg inline-block mx-auto">
            <img src={pixData.qrCodeUrl} alt="QR Code Pix" className="w-64 h-64 object-contain" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Pix Copia e Cola:</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={pixData.qrCode}
                className="flex-1 p-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-600 outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(pixData.qrCode);
                  alert("Código copiado!");
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Copiar
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            O saldo de créditos será atualizado automaticamente em alguns minutos após o pagamento.
          </p>
          
          <button
            onClick={() => setPixData(null)}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            ← Voltar aos pacotes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pacotes.map((pacote) => (
            <div
              key={pacote.id}
              className={`relative bg-white rounded-2xl border-2 transition-all ${
                pacote.destaque ? "border-blue-500 shadow-lg" : "border-gray-200 shadow-sm"
              } p-6 flex flex-col`}
            >
              {pacote.destaque && (
                <span className="absolute -top-3 inset-x-0 mx-auto w-max px-3 py-1 bg-blue-500 text-white text-xs font-bold uppercase tracking-widest rounded-full">
                  Mais Popular
                </span>
              )}

              <h3 className="text-xl font-bold text-gray-900">{pacote.nome}</h3>
              {pacote.descricao && <p className="text-sm text-gray-500 mt-2">{pacote.descricao}</p>}

              <div className="mt-6 mb-6">
                <span className="text-4xl font-extrabold text-gray-900">
                  {formatCurrency(pacote.preco_centavos)}
                </span>
                <span className="text-gray-500 ml-1">/ pacote</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <strong>{pacote.quantidade} Leads</strong> garantidos
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Suporte prioritário
                </li>
                {pacote.economia_percentual > 0 && (
                  <li className="flex items-center text-blue-600 font-medium mt-2">
                    Economize {pacote.economia_percentual}%
                  </li>
                )}
              </ul>

              <button
                onClick={() => handleComprar(pacote.id)}
                disabled={loadingId !== null}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-center transition-colors ${
                  pacote.destaque
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                } ${loadingId === pacote.id ? "opacity-75 cursor-not-allowed" : ""}`}
              >
                {loadingId === pacote.id ? "Gerando Pix..." : "Comprar Pacote"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
