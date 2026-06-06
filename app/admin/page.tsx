import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  // Buscar totais
  const [{ count: leadsCount }, { count: empresasCount }, { data: pagamentos }] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("empresas").select("*", { count: "exact", head: true }),
    supabase.from("pagamentos").select("valor_centavos").eq("status", "paid")
  ]);

  const receitaTotalCentavos = pagamentos?.reduce((acc, curr) => acc + curr.valor_centavos, 0) || 0;
  const receitaTotal = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(receitaTotalCentavos / 100);

  // Buscar leads recentes
  const { data: ultimosLeads } = await supabase
    .from("leads")
    .select("id, nome_cliente, servico_id, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Visão Geral</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase">Total de Leads</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{leadsCount || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase">Empresas Cadastradas</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{empresasCount || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase">Receita (Pagamentos)</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{receitaTotal}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mt-8 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Últimos Leads Gerados</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-900">Cliente</th>
                <th className="px-6 py-3 font-medium text-gray-900">Serviço ID</th>
                <th className="px-6 py-3 font-medium text-gray-900">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ultimosLeads?.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-6 py-4">{lead.nome_cliente}</td>
                  <td className="px-6 py-4">{lead.servico_id}</td>
                  <td className="px-6 py-4">{new Date(lead.created_at).toLocaleString('pt-BR')}</td>
                </tr>
              ))}
              {(!ultimosLeads || ultimosLeads.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                    Nenhum lead gerado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
