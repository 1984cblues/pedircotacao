import { z } from 'zod'

// ==========================================
// LEAD — Schema de validação (Formulário de orçamento)
// ==========================================

const telefoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/

export const leadSchema = z.object({
  nome_cliente: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome muito longo')
    .transform((v) => v.trim()),

  telefone: z
    .string()
    .min(10, 'Telefone inválido')
    .max(20, 'Telefone inválido')
    .regex(telefoneRegex, 'Formato de telefone inválido. Ex: (11) 99999-9999'),

  email: z
    .string()
    .email('E-mail inválido')
    .max(255)
    .optional()
    .or(z.literal('')),

  mensagem: z
    .string()
    .max(1000, 'Mensagem muito longa')
    .optional()
    .or(z.literal('')),

  tipo_pessoa: z
    .enum(['fisica', 'juridica'])
    .default('fisica'),

  urgencia: z
    .enum(['urgente', 'normal', 'sem_pressa'])
    .default('normal'),

  // IDs de contexto (vêm da rota, não do form)
  servico_id: z.coerce.number().int().positive(),
  estado_id: z.coerce.number().int().positive(),
  cidade_id: z.coerce.number().int().positive(),
  bairro_id: z.coerce.number().int().positive().optional(),
})

export type LeadInput = z.infer<typeof leadSchema>

// ==========================================
// EMPRESA — Schema de cadastro
// ==========================================

const cnpjRegex = /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/

export const empresaSchema = z.object({
  razao_social: z
    .string()
    .min(3, 'Razão social deve ter pelo menos 3 caracteres')
    .max(200),

  nome_fantasia: z
    .string()
    .min(2, 'Nome fantasia deve ter pelo menos 2 caracteres')
    .max(200),

  cnpj: z
    .string()
    .regex(cnpjRegex, 'CNPJ inválido. Ex: 12.345.678/0001-99')
    .optional()
    .or(z.literal('')),

  telefone: z
    .string()
    .min(10, 'Telefone inválido')
    .max(20),

  whatsapp: z
    .string()
    .min(10, 'WhatsApp inválido')
    .max(20)
    .optional()
    .or(z.literal('')),

  email: z
    .string()
    .email('E-mail inválido')
    .max(255),

  descricao: z
    .string()
    .max(2000, 'Descrição muito longa')
    .optional()
    .or(z.literal('')),

  website: z
    .string()
    .url('URL inválida')
    .optional()
    .or(z.literal('')),

  endereco: z
    .string()
    .max(300)
    .optional()
    .or(z.literal('')),

  cidade_id: z.coerce.number().int().positive(),

  // Serviços que oferece (array de IDs)
  servico_ids: z
    .array(z.coerce.number().int().positive())
    .min(1, 'Selecione pelo menos 1 serviço'),

  // Cidades onde atende (array de IDs)
  cidade_ids: z
    .array(z.coerce.number().int().positive())
    .min(1, 'Selecione pelo menos 1 cidade de atendimento'),
})

export type EmpresaInput = z.infer<typeof empresaSchema>

// ==========================================
// CRÉDITO — Schema de compra
// ==========================================

export const comprarCreditoSchema = z.object({
  pacote_id: z.coerce.number().int().positive(),
  metodo: z.enum(['pix', 'boleto', 'credit_card']),
})

export type ComprarCreditoInput = z.infer<typeof comprarCreditoSchema>
