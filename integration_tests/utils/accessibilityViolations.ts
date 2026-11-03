import { Result } from 'axe-core'

export default class AccessibilityViolationsLogger {
  static log(violations: Result[]): void {
    AccessibilityViolationsLogger.logSummary(violations)
    AccessibilityViolationsLogger.logViolationsAsTable(violations)
  }

  static logSummary(violations: Result[]): void {
    // eslint-disable-next-line no-console
    console.log(`Accessibility violations detected: ${violations.length}`)
  }

  static logViolationsAsTable(violations: Result[]): void {
    const violationData = violations.map(({ id, impact, description, nodes }) => ({
      id,
      impact,
      description,
      nodes: nodes.length,
      nodeTargets: nodes.map(node => node.target).join(' - '),
    }))

    // eslint-disable-next-line no-console
    console.table(violationData)
  }
}
