import { randomUUID } from 'crypto'
import { FormKeyDto } from '../@types/shared'
import { AppointmentOutcomeForm } from '../@types/user-defined'
import FormClient from '../data/formClient'

export const APPOINTMENT_UPDATE_FORM_TYPE = 'APPOINTMENT_UPDATE_ADMIN'

interface Form {
  key: FormKeyDto
  data: AppointmentOutcomeForm
}

export default class AppointmentFormService {
  constructor(private readonly formClient: FormClient) {}

  async getForm(formId: string | undefined, username: string): Promise<Form> {
    if (!formId) {
      return this.createForm()
    }

    const formKey = this.getFormKey(formId)
    const form = await this.formClient.find<AppointmentOutcomeForm>(formKey, username)

    return {
      key: formKey,
      data: form,
    }
  }

  async saveForm(formId: string, username: string, data: AppointmentOutcomeForm) {
    const formKey = this.getFormKey(formId)

    return this.formClient.save(formKey, username, data)
  }

  private createForm(): Form {
    return {
      key: this.getFormKey(randomUUID()),
      data: {},
    }
  }

  private getFormKey(id: string): FormKeyDto {
    return {
      id,
      type: APPOINTMENT_UPDATE_FORM_TYPE,
    }
  }
}
