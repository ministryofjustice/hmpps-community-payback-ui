import { ValidationErrors } from '../@types/user-defined'
import { ErrorViewData, generateErrorSummary } from '../utils/errorUtils'

export default abstract class PageWithValidation<TBody> {
  validationErrors(query: TBody): ErrorViewData<TBody> {
    const errors = this.getValidationErrors(query)

    const errorSummary = generateErrorSummary(errors)

    return { errors, hasErrors: Object.keys(errors).length > 0, errorSummary }
  }

  protected abstract getValidationErrors(query: TBody): ValidationErrors<TBody>
}
