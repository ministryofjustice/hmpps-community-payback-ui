import { CourseCompletionResolutionDto } from '../../@types/shared'
import { YesOrNo } from '../../@types/user-defined'
import FormClient from '../../data/formClient'
import { CourseCompletionPageInput } from '../../pages/courseCompletionIndexPage'
import BaseFormService from './baseFormService'

export const COURSE_COMPLETION_PROCESS_FORM_TYPE = 'COURSE_COMPLETION_RESOLUTION'

type DoNotCreditTime = {
  unableToCreditTimeNotes?: string
}

export type CourseCompletionForm = {
  originalSearch?: CourseCompletionPageInput
  type?: CourseCompletionResolutionDto['type']
  crn?: string
  deliusEventNumber?: number
  appointmentIdToUpdate?: number
  'date-day'?: string
  'date-month'?: string
  'date-year'?: string
  timeToCredit?: { hours?: string; minutes?: string }
  contactOutcomeCode?: string
  team?: string
  project?: string
  notes?: string
  alertActive?: boolean
  isSensitive?: YesOrNo
} & DoNotCreditTime

export default class CourseCompletionFormService extends BaseFormService<CourseCompletionForm> {
  constructor(formClient: FormClient) {
    super(formClient, COURSE_COMPLETION_PROCESS_FORM_TYPE)
  }
}
