import { User } from "@supabase/supabase-js";

export function isAdminUser(user: User | null): boolean {
  if (!user || !user.email) return false;
  
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) || [];
  
  // Para MVP e ambiente local, caso ADMIN_EMAILS não esteja definido,
  // permitimos que o primeiro admin seja "felipe@autobot.com.br" ou "admin@pedircotacao.com.br"
  if (adminEmails.length === 0) {
    const fallbackAdmins = ["admin@pedircotacao.com.br", "felipe@autobot.com.br"];
    return fallbackAdmins.includes(user.email.toLowerCase());
  }

  return adminEmails.includes(user.email.toLowerCase());
}
