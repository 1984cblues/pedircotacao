import { createAdminClient } from "@/lib/supabase/admin";
import { aprovarEmpresa, suspenderEmpresa } from "@/lib/actions/admin.actions";

export const metadata = {
  title: "Moderação de Empresas | Admin",
};

export default async function AdminEmpresasPage() {
  const supabase = createAdminClient();

  const { data: empresas } = await supabase
    .from("empresas")
    .select("id, razao_social, cnpj, email, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Empresas</h2>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-900">Razão Social</th>
                <th className="px-6 py-3 font-medium text-gray-900">CNPJ</th>
                <th className="px-6 py-3 font-medium text-gray-900">E-mail</th>
                <th className="px-6 py-3 font-medium text-gray-900">Status</th>
                <th className="px-6 py-3 font-medium text-gray-900 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {empresas?.map((empresa) => (
                <tr key={empresa.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">{empresa.razao_social}</td>
                  <td className="px-6 py-4">{empresa.cnpj}</td>
                  <td className="px-6 py-4">{empresa.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        empresa.status === "aprovada"
                          ? "bg-green-100 text-green-800"
                          : empresa.status === "pendente"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {empresa.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    {empresa.status !== "aprovada" && (
                      <form action={aprovarEmpresa.bind(null, empresa.id)}>
                        <button className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700">
                          Aprovar
                        </button>
                      </form>
                    )}
                    {empresa.status !== "suspensa" && (
                      <form action={suspenderEmpresa.bind(null, empresa.id)}>
                        <button className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700">
                          Suspender
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
              {(!empresas || empresas.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Nenhuma empresa encontrada.
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
