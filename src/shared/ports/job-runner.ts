export interface Job<TPayload = unknown, TResult = unknown> {
  id: string
  type: string
  payload: TPayload
}

export interface JobResult<TResult = unknown> {
  ok: boolean
  result?: TResult
  error?: string
}

export interface JobRunner {
  run<TPayload, TResult>(
    job: Job<TPayload, TResult>,
    handler: (payload: TPayload) => Promise<TResult>,
  ): Promise<JobResult<TResult>>
}
