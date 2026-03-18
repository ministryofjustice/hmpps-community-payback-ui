import { CourseCompletionResolutionDto } from '../../@types/shared'
import FormClient from '../../data/formClient'
import BaseFormService from './baseFormService'

export const COURSE_COMPLETION_PROCESS_FORM_TYPE = 'COURSE_COMPLETION_RESOLUTION'

export type CourseCompletionForm = {
  type?: CourseCompletionResolutionDto['type']
  crn?: string
  deliusEventNumber?: number
  appointmentIdToUpdate?: number
  date?: string
  minutesToCredit?: number
  contactOutcomeCode?: string
  team?: string
  project?: string
  notes?: string
  alertActive?: boolean
  sensitive?: boolean
}

export default class CourseCompletionFormService extends BaseFormService<CourseCompletionForm> {
  constructor(formClient: FormClient) {
    super(formClient, COURSE_COMPLETION_PROCESS_FORM_TYPE)
  }
}
