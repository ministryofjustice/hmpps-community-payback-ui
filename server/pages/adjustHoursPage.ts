import { AdjustmentReasonDto, AdjustmentReasonsDto } from '../@types/shared'
import { ValidationErrors } from '../@types/user-defined'
import MojDateInput from '../forms/mojDateInput'
import Offender from '../models/offender'
import paths from '../paths'
import { pathWithQuery } from '../utils/utils'
import PageWithValidation from './pageWithValidation'

interface AdjustHoursBody {
  date?: string
}

interface PageViewData {
  date: string
  backLink: string
  heading: { title: string; caption: string }
  updatePath: string
}

export default class AdjustHoursPage extends PageWithValidation<AdjustHoursBody> {
  protected getValidationErrors(body: AdjustHoursBody): ValidationErrors<AdjustHoursBody> {
    const errors: ValidationErrors<AdjustHoursBody> = {}

    const dateError = MojDateInput.validate(body.date)

    if (dateError) {
      errors.date = dateError
    }

    return errors
  }

  viewData({
    offender,
    body,
  }: {
    offender: Offender
    body: AdjustHoursBody,
    adjustmentReasons: AdjustmentReasonDto[],
  }): PageViewData {
    const { name, crn } = offender

    const exitPath = ''
    let date = ''

    if (body?.date !== undefined) {
      date = body.date
    }

    return {
      date,
      heading: { title: name, caption: crn },
      backLink: exitPath,
      updatePath: '',
    }
  }

  exitPath(originalSearch: Record<string, string>): string {
    return ''
  }

  requestBody() {
    return {}
  }

  updatePath(
    crn: string,
    deliusEventNumber: string,
    originalSearch: Record<string, string>,
  ): string {
    return pathWithQuery(
      paths.people.adjustHours.update({
        crn,
        deliusEventNumber
      }),
      originalSearch,
    )
  }
}
