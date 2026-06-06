import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = {
  title: "Leads Globais | Admin",
};

export default async function AdminLeadsPage() {
  const supabase = createAdminClient();

  const { data: leads } = await supabase
    .from("leads")
    .select(`
      id, 
      nome_cliente, 
      email, 
      telefone, 
      status, 
      score, 
      created_at,
      servicos (nome),
      cidades (nome),
      estados (sigla)
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Log Global de Leads</h2>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-900">Data</th>
                <th className="px-6 py-3 font-medium text-gray-900">Cliente</th>
                <th className="px-6 py-3 font-medium text-gray-900">Contato</th>
                <th className="px-6 py-3 font-medium text-gray-900">Serviço/Local</th>
                <th className="px-6 py-3 font-medium text-gray-900">Score</th>
                <th className="px-6 py-3 font-medium text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leads?.map((lead: any) => (
                <tr key={lead.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{lead.nome_cliente}</td>
                  <td className="px-6 py-4">
                    <p>{lead.email}</p>
                    <p className="text-xs text-gray-500">{lead.telefone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{lead.servicos?.nome || lead.servico_id}</p>
                    <p className="text-xs text-gray-500">{lead.cidades?.nome}/{lead.estados?.sigla}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2 max-w-[60px]">
                        <div
                          className={`h-2 rounded-full ${lead.score > 70 ? 'bg-green-500' : lead.score > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${lead.score}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold">{lead.score}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        lead.status === "distribuido" || lead.status === "convertido"
                          ? "bg-green-100 text-green-800"
                          : lead.status === "novo"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {lead.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
              {(!leads || leads.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Nenhum lead encontrado no sistema.
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
