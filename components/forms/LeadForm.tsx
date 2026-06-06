'use client'

import { useState, useTransition } from 'react'
import { submitLead } from '@/lib/actions/lead.actions'

interface LeadFormProps {
  servicoId: number
  estadoId: number
  cidadeId: number
  bairroId?: number
  servicoNome: string
  cidadeNome: string
  bairroNome?: string
}

export default function LeadForm({
  servicoId,
  estadoId,
  cidadeId,
  bairroId,
  servicoNome,
  cidadeNome,
  bairroNome,
}: LeadFormProps) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<{
    success: boolean
    message: string
  } | null>(null)
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  const formatTelefone = (value: string) => {
    // Remove non-digits
    const clean = value.replace(/\D/g, '')
    if (clean.length <= 2) return clean
    if (clean.length <= 6) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`
    if (clean.length <= 10) return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = formatTelefone(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus(null)
    setErrors({})

    const formData = new FormData(e.currentTarget)
    
    // Append context IDs that are not inputs for the client to change
    formData.append('servico_id', String(servicoId))
    formData.append('estado_id', String(estadoId))
    formData.append('cidade_id', String(cidadeId))
    if (bairroId) {
      formData.append('bairro_id', String(bairroId))
    }

    startTransition(async () => {
      const result = await submitLead(formData)
      
      if (result.success) {
        setStatus({
          success: true,
          message: result.message || 'Solicitação enviada com sucesso!',
        })
        // Clear form
        const form = e.target as HTMLFormElement
        form.reset()
      } else {
        setStatus({
          success: false,
          message: result.error || 'Ocorreu um erro ao enviar a solicitação.',
        })
        if (result.details) {
          // Flattened zod errors
          const fieldErrors: Record<string, string> = {}
          Object.entries(result.details).forEach(([key, val]) => {
            if (Array.isArray(val) && val.length > 0) {
              fieldErrors[key] = val[0]
            }
          })
          setErrors(fieldErrors)
        }
      }
    })
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          Pedir Orçamento Grátis
        </h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Receba até 3 propostas para <strong className="text-emerald-600 dark:text-emerald-400">{servicoNome}</strong>{' '}
          em {bairroNome ? `${bairroNome}, ` : ''}{cidadeNome}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* Nome */}
        <div>
          <label htmlFor="nome_cliente" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Seu Nome *
          </label>
          <input
            type="text"
            id="nome_cliente"
            name="nome_cliente"
            required
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-emerald-500"
            placeholder="Ex: Carlos Silva"
          />
          {errors.nome_cliente && (
            <p className="mt-1 text-xs text-red-500">{errors.nome_cliente}</p>
          )}
        </div>

        {/* Whatsapp / Telefone */}
        <div>
          <label htmlFor="telefone" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            WhatsApp / Telefone *
          </label>
          <input
            type="tel"
            id="telefone"
            name="telefone"
            required
            onChange={handlePhoneChange}
            maxLength={15}
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-emerald-500"
            placeholder="(11) 99999-9999"
          />
          {errors.telefone && (
            <p className="mt-1 text-xs text-red-500">{errors.telefone}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            E-mail (Opcional)
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-emerald-500"
            placeholder="carlos@exemplo.com.br"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Tipo Pessoa */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Tipo de Pessoa
            </label>
            <select
              name="tipo_pessoa"
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-emerald-500"
            >
              <option value="fisica">Pessoa Física</option>
              <option value="juridica">Pessoa Jurídica (Empresa)</option>
            </select>
          </div>

          {/* Urgência */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Urgência
            </label>
            <select
              name="urgencia"
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-emerald-500"
            >
              <option value="normal">Normal</option>
              <option value="urgente">Urgente</option>
              <option value="sem_pressa">Sem Pressa</option>
            </select>
          </div>
        </div>

        {/* Detalhes da Solicitação */}
        <div>
          <label htmlFor="mensagem" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Detalhes do Serviço (Opcional)
          </label>
          <textarea
            id="mensagem"
            name="mensagem"
            rows={3}
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-emerald-500"
            placeholder="Ex: Preciso de análise de solo para loteamento residencial com 5 furos de sondagem."
          />
          {errors.mensagem && (
            <p className="mt-1 text-xs text-red-500">{errors.mensagem}</p>
          )}
        </div>

        {/* Status Alerts */}
        {status && (
          <div
            className={`rounded-lg p-3 text-xs font-medium leading-relaxed ${
              status.success
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300'
            }`}
          >
            {status.message}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-emerald-500 py-3 text-sm font-bold text-white shadow-sm shadow-emerald-500/10 transition-all hover:bg-emerald-600 hover:shadow-emerald-500/20 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
        >
          {isPending ? 'Enviando...' : 'Solicitar Orçamento'}
        </button>
      </form>
    </div>
  )
}
