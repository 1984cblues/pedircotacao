"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient as createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/utils/admin";
import { revalidatePath } from "next/cache";

export async function aprovarEmpresa(empresaId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user)) {
    throw new Error("Acesso negado");
  }

  const adminDb = createAdminClient();
  const { error } = await adminDb
    .from("empresas")
    .update({ status: "aprovada" })
    .eq("id", empresaId);

  if (error) {
    throw new Error("Erro ao aprovar empresa");
  }

  revalidatePath("/admin/empresas");
}

export async function suspenderEmpresa(empresaId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user)) {
    throw new Error("Acesso negado");
  }

  const adminDb = createAdminClient();
  const { error } = await adminDb
    .from("empresas")
    .update({ status: "suspensa" })
    .eq("id", empresaId);

  if (error) {
    throw new Error("Erro ao suspender empresa");
  }

  revalidatePath("/admin/empresas");
}
