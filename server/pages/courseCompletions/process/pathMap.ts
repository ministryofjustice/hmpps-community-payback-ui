export type CourseCompletionPage =
  | 'crn'
  | 'person'
  | 'requirement'
  | 'history'
  | 'project'
  | 'appointments'
  | 'outcome'
  | 'confirm'
  | 'unableToCreditTime'

type NavigationPaths = { back?: CourseCompletionPage; next?: CourseCompletionPage; backQuery?: string }

const pathMap: Record<CourseCompletionPage, NavigationPaths> = {
  crn: { next: 'person' },
  person: { back: 'crn', next: 'history' },
  history: { back: 'person', next: 'requirement' },
  requirement: { back: 'history', next: 'project' },
  project: { back: 'requirement', next: 'appointments', backQuery: 'fromProject' },
  appointments: { back: 'project', next: 'outcome' },
  outcome: { back: 'appointments', next: 'confirm', backQuery: 'fromOutcome' },
  confirm: { back: 'outcome' },
  unableToCreditTime: {},
}

export default pathMap
