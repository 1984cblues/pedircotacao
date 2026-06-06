import 'server-only'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'contato@pedircotacao.com.br'

export async function sendLeadNotificationEmail({
  to,
  empresaNome,
  leadNome,
  servicoNome,
}: {
  to: string
  empresaNome: string
  leadNome: string
  servicoNome: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: `Pedir Cotação <${FROM_EMAIL}>`,
      to,
      subject: `Novo Lead de ${servicoNome}: ${leadNome}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Você recebeu um novo lead!</h2>
          <p>Olá, <strong>${empresaNome}</strong>,</p>
          <p>Um novo cliente (${leadNome}) solicitou um orçamento para <strong>${servicoNome}</strong>.</p>
          <p>Um crédito foi descontado do seu saldo.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/leads" style="display: inline-block; padding: 10px 20px; background-color: #0056b3; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">Acessar o Dashboard</a>
        </div>
      `,
    })

    if (error) {
      console.error('Error sending lead email:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}
