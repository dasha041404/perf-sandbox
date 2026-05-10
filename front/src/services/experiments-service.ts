import { apiRequest } from './api-client'
import type { CreateExperimentPayload, ExperimentItem, PaginatedExperimentsResponse } from './backend-types'

const EXPERIMENTS_PATH = '/experiments'

export function getExperiments(params: { limit?: number; offset?: number } = {}) {
  return apiRequest<PaginatedExperimentsResponse>(EXPERIMENTS_PATH, {
    query: params,
  })
}

export function createExperiment(payload: CreateExperimentPayload) {
  return apiRequest<ExperimentItem, CreateExperimentPayload>(EXPERIMENTS_PATH, {
    method: 'POST',
    body: payload,
  })
}