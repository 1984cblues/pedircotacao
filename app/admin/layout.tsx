import { createServerSupabaseClient as createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isAdminUser } from "@/lib/utils/admin";
import Link from "next/link";

export const metadata = {
  title: "Admin Panel | PedirCotação",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user)) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-gray-900 text-white flex-shrink-0">
        <div className="p-6">
          <Link href="/admin">
            <h1 className="text-xl font-bold tracking-tight">Admin Panel</h1>
          </Link>
          <p className="text-gray-400 text-sm mt-1">PedirCotação</p>
        </div>
        <nav className="px-4 py-2 space-y-1">
          <Link href="/admin" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-md">
            Visão Geral
          </Link>
          <Link href="/admin/empresas" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-md">
            Empresas
          </Link>
          <Link href="/admin/leads" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-md">
            Leads Globais
          </Link>
          <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-400 hover:text-white mt-8 border-t border-gray-800 pt-4">
            ← Sair do Admin
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
