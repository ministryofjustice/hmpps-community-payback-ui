import { ValidationErrors } from '../@types/user-defined'
import { ErrorViewData, generateErrorSummary } from '../utils/errorUtils'

export default abstract class PageWithValidation<TBody, TContext = unknown> {
  validationErrors(query: TBody, additionalParams?: TContext): ErrorViewData<TBody> {
    const errors = this.getValidationErrors(query, additionalParams)

    const errorSummary = generateErrorSummary(errors)

    return { errors, hasErrors: Object.keys(errors).length > 0, errorSummary }
  }

  protected abstract getValidationErrors(query: TBody, additionalParams?: TContext): ValidationErrors<TBody>
}
