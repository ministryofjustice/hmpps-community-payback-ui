export type CourseCompletionPage =
  | 'crn'
  | 'confirmCrn'
  | 'requirement'
  | 'history'
  | 'project'
  | 'appointments'
  | 'outcome'
  | 'confirm'
  | 'exit'

type NavigationPaths = { back: CourseCompletionPage; next: CourseCompletionPage }

const pathMap: Record<CourseCompletionPage, NavigationPaths> = {
  crn: { back: 'exit', next: 'confirmCrn' },
  confirmCrn: { back: 'crn', next: 'requirement' },
  requirement: { back: 'confirmCrn', next: 'history' },
  history: { back: 'requirement', next: 'project' },
  project: { back: 'history', next: 'appointments' },
  appointments: { back: 'project', next: 'outcome' },
  outcome: { back: 'appointments', next: 'confirm' },
  confirm: { back: 'outcome', next: 'exit' },
  exit: { back: 'confirm', next: 'crn' },
}

export default pathMap
