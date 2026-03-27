export interface CreateExperimentInput {
  name: string;
  slug: string;
  description?: string;
  startDate: string | Date;
  endDate?: string | Date | null;
  active?: boolean;
  variants: { name: string; slug: string }[];
}

export interface UpdateExperimentInput {
  name?: string;
  description?: string;
  startDate?: string | Date;
  endDate?: string | Date | null;
  active?: boolean;
}

export interface RecordMetricEventInput {
  eventType: string;
  target?: string;
  // Permite registrar evento sem token (ex.: pós-cadastro),
  // desde que o cliente informe explicitamente o usuário dono do evento.
  userId?: string;
  experimentId?: string;
  variantId?: string;
  metadata?: Record<string, unknown>;
}
