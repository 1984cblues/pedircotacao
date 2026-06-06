import { createServerSupabaseClient as createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ClientCreditosPage from "./ClientCreditosPage";

export const metadata = {
  title: "Créditos | Dashboard PedirCotação",
};

export default async function CreditosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/cadastro");
  }

  // Obter empresa do usuário
  const { data: empresa } = await supabase
    .from("empresas")
    .select("id, razao_social, status")
    .eq("user_id", user.id)
    .single();

  if (!empresa) {
    // Se não tem empresa, redireciona para setup (no MVP, assume que já tem)
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
        <p>Você precisa cadastrar sua empresa primeiro.</p>
      </div>
    );
  }

  // Buscar pacotes ativos
  const { data: pacotes } = await supabase
    .from("pacotes_credito")
    .select("*")
    .eq("ativo", true)
    .order("ordem", { ascending: true });

  // Buscar saldo e histórico (opcional para o MVP, mas bom mostrar o saldo)
  const { data: creditos } = await supabase
    .from("creditos")
    .select("saldo, total_comprado, total_consumido")
    .eq("empresa_id", empresa.id)
    .single();

  const saldo = creditos?.saldo || 0;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Comprar Créditos</h1>
          <p className="text-gray-500 mt-1">
            Cada crédito permite receber 1 lead qualificado na sua região e área de atuação.
          </p>
        </div>
        <div className="mt-4 md:mt-0 bg-blue-50 border border-blue-100 rounded-lg px-6 py-4 text-center">
          <p className="text-sm font-medium text-blue-800 uppercase tracking-wider mb-1">Saldo Atual</p>
          <p className="text-4xl font-extrabold text-blue-900">{saldo}</p>
        </div>
      </div>

      <ClientCreditosPage pacotes={pacotes || []} empresaId={empresa.id} />
    </div>
  );
}
