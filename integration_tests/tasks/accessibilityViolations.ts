import { Result } from 'axe-core'

export default {
  logAccessibilityViolationsSummary: (message: string): void => {
    // eslint-disable-next-line no-console
    console.log(message)
  },
  logAccessibilityViolationsTable: (violations: Result[]): void => {
    // eslint-disable-next-line no-console
    console.table(violations)
  },
}
