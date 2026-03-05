import { SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import { HTTPError } from 'superagent'
import { ValidationErrors } from '../@types/user-defined'

type ValidationError = {
  [key: string]: { text: string }
}

export type ErrorSummaryItem = {
  text: string
  href: string
  attributes: { [attr: string]: string }
}

export interface ErrorViewData<T> {
  errors: ValidationErrors<T>
  hasErrors: boolean
  errorSummary: Array<ErrorSummaryItem>
}

export const generateErrorSummary = <T extends ValidationError>(validationErrors: T): Array<ErrorSummaryItem> => {
  return Object.keys(validationErrors).map(k => ({
    text: validationErrors[k].text,
    href: `#${k}`,
    attributes: {
      [`data-cy-error-${k}`]: validationErrors[k].text,
    },
  }))
}

export const generateErrorTextList = (errorMessages?: Array<string> | undefined) =>
  errorMessages?.length > 0 ? errorMessages.map((error: string) => ({ text: error })) : undefined

/*
  The errors we get sometimes have the status in .status but also can the status on .responseStatus.
  As a result we need to handle both in the same way as an "any" type to prevent type errors where
  there's no overlap.
*/
export const getErrorStatus = (error: HTTPError | SanitisedError): number | undefined => {
  if ('status' in error) {
    return error.status
  }

  if ('responseStatus' in error) {
    return error.responseStatus
  }

  return undefined
}

export const errorHasStatus = (error: HTTPError | SanitisedError, status: number): boolean => {
  return getErrorStatus(error) === status
}
