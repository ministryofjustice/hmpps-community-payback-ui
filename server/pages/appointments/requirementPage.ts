import { ValidationErrors } from '../../@types/user-defined'
import PageWithValidation from '../pageWithValidation'

interface RequirementBody {
  deliusEventNumber?: string
}

export default class RequirementPage extends PageWithValidation<RequirementBody> {
  getValidationErrors(body: RequirementBody): ValidationErrors<RequirementBody> {
    const errors: ValidationErrors<RequirementBody> = {}

    if (!body.deliusEventNumber) {
      errors.deliusEventNumber = { text: 'Select a requirement' }
    }

    return errors
  }
}
