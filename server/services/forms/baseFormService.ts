import FormClient, { FormKey } from '../../data/formClient'

export default class BaseFormService<TForm extends Record<string, unknown>> {
  constructor(
    private readonly formClient: FormClient,
    private readonly formType: string,
  ) {}

  getForm(formId: string, username: string): Promise<TForm> {
    const key = this.getFormKey(formId)

    return this.formClient.find<TForm>(key, username)
  }

  async saveForm(formId: string, username: string, data: TForm) {
    const formKey = this.getFormKey(formId)

    return this.formClient.save(formKey, username, data)
  }

  getFormKey(id: string): FormKey {
    return {
      id,
      type: this.formType,
    }
  }
}
