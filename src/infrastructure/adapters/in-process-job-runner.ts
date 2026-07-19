import type { Job, JobResult, JobRunner } from '@shared/ports/job-runner'

export class InProcessJobRunner implements JobRunner {
  async run<TPayload, TResult>(
    job: Job<TPayload, TResult>,
    handler: (payload: TPayload) => Promise<TResult>,
  ): Promise<JobResult<TResult>> {
    try {
      const result = await handler(job.payload)
      return {
        ok: true,
        result,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        ok: false,
        error: message,
      }
    }
  }
}
