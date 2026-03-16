export type CourseCompletionPage =
  | 'crn'
  | 'person'
  | 'requirement'
  | 'history'
  | 'project'
  | 'appointments'
  | 'outcome'
  | 'confirm'

type NavigationPaths = { back?: CourseCompletionPage; next?: CourseCompletionPage }

const pathMap: Record<CourseCompletionPage, NavigationPaths> = {
  crn: { next: 'person' },
  person: { back: 'crn', next: 'history' },
  history: { back: 'person', next: 'requirement' },
  requirement: { back: 'history', next: 'project' },
  project: { back: 'history', next: 'appointments' },
  appointments: { back: 'project', next: 'outcome' },
  outcome: { back: 'appointments', next: 'confirm' },
  confirm: { back: 'outcome' },
}

export default pathMap
