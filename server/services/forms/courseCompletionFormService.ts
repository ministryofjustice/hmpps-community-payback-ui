import { randomUUID } from 'crypto'
import { CourseCompletionResolutionDto } from '../../@types/shared'
import { BodyWithNotes } from '../../@types/user-defined'
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
  alertActive?: boolean
} & BodyWithNotes &
  DoNotCreditTime

export default class CourseCompletionFormService extends BaseFormService<CourseCompletionForm> {
  constructor(formClient: FormClient) {
    super(formClient, COURSE_COMPLETION_PROCESS_FORM_TYPE)
  }

  async createForm(
    username: string,
    formData: CourseCompletionForm = {},
  ): Promise<{ formId: string; formData: CourseCompletionForm }> {
    const formId = randomUUID()

    await this.saveForm(formId, username, formData)

    return { formId, formData }
  }
}
