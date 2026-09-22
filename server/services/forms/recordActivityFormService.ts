import { randomUUID } from 'crypto'
import { AttendanceDataDto, ContactOutcomeDto, ProjectTypeDto, ProviderTeamSummaryDto } from '../../@types/shared'
import { BodyWithNotes } from '../../@types/user-defined'
import FormClient from '../../data/formClient'
import BaseFormService from './baseFormService'

export const RECORD_ACTIVITY_FORM_TYPE = 'RECORD_ACTIVITY'

export type RecordActivityForm = {
  crn: string
  deliusEventNumber: string
  projectTypeGroup: ProjectTypeDto['group']
  provider?: {
    code: string
    name: string
  }
  projectTeam?: ProviderTeamSummaryDto
  project?: {
    code: string
    name: string
  }
  date?: string
  startTime?: string
  endTime?: string
  contactOutcome?: ContactOutcomeDto
  attendanceData?: AttendanceDataDto
  originalSearch?: Record<string, string>
  originalPath?: string
} & BodyWithNotes

export default class RecordActivityFormService extends BaseFormService<RecordActivityForm> {
  constructor(formClient: FormClient) {
    super(formClient, RECORD_ACTIVITY_FORM_TYPE)
  }

  async createForm(
    username: string,
    { crn, deliusEventNumber }: { crn: string; deliusEventNumber: string },
  ): Promise<{ formId: string; formData: RecordActivityForm }> {
    const formId = randomUUID()
    const formData: RecordActivityForm = { crn, deliusEventNumber, projectTypeGroup: 'OTHER_ETE' }

    await this.saveForm(formId, username, formData)

    return { formId, formData }
  }
}
