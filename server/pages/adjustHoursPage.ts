import { AdjustmentReasonDto } from '../@types/shared'
import { GovUkRadioOrCheckboxOption, ValidationErrors, ViewDataWithTimeToCredit } from '../@types/user-defined'
import HoursAndMinutesInput, { ObjectWithHoursAndMinutes } from '../forms/hoursAndMinutesInput'
import MojDateInput from '../forms/mojDateInput'
import Offender from '../models/offender'
import paths from '../paths'
import { AdjustmentForm } from '../services/forms/adjustmentFormService'
import DateTimeFormats from '../utils/dateTimeUtils'
import { pathWithQuery } from '../utils/utils'
import PageWithValidation from './pageWithValidation'

type AdjustHoursBody = {
  date?: string
  reasonCode: string
} & ObjectWithHoursAndMinutes

type PageViewData = {
  date: string
  backLink: string
  heading: { title: string; caption: string }
  updatePath: string
  adjustmentOptions: AdjustmentOption[]
} & ViewDataWithTimeToCredit

type AdjustmentOption = GovUkRadioOrCheckboxOption & {
  hint: {
    html: string
  }
}

export default class AdjustHoursPage extends PageWithValidation<AdjustHoursBody> {
  protected getValidationErrors(body: AdjustHoursBody): ValidationErrors<AdjustHoursBody> {
    const errors: ValidationErrors<AdjustHoursBody> = {}

    const dateError = MojDateInput.validate(body.date)

    if (dateError) {
      errors.date = dateError
    }

    if (!body.reasonCode) {
      errors.reasonCode = { text: 'Select a reason' }
    }

    const timeErrors = HoursAndMinutesInput.validationErrors(body, 'time taken off')

    return {
      ...errors,
      ...timeErrors,
    }
  }

  viewData({
    offender,
    body,
    adjustmentReasons,
    deliusEventNumber,
    formData,
  }: {
    offender: Offender
    body: AdjustHoursBody
    adjustmentReasons: AdjustmentReasonDto[]
    deliusEventNumber: string
    formData?: AdjustmentForm
  }): PageViewData {
    const { name, crn } = offender

    const exitPath = ''
    const date =
      body?.date ||
      (formData.adjustmentDate ? DateTimeFormats.isoDateToUIDate(formData.adjustmentDate, { format: 'short' }) : null)
    const selectedOption = body?.reasonCode || formData.adjustmentReasonId
    const hours =
      body?.hours ||
      (formData.minutes ? DateTimeFormats.totalMinutesToHoursAndMinutesParts(formData.minutes).hours : null)
    const minutes =
      body?.minutes ||
      (formData.minutes ? DateTimeFormats.totalMinutesToHoursAndMinutesParts(formData.minutes).minutes : null)

    return {
      date,
      heading: { title: name, caption: crn },
      backLink: exitPath,
      updatePath: paths.people.adjustHours.update({ crn: offender.crn, deliusEventNumber }),
      adjustmentOptions: this.getAdjustmentOptions(adjustmentReasons, selectedOption),
      timeToCredit: { hours, minutes },
    }
  }

  private getAdjustmentOptions(
    adjustmentReasons: AdjustmentReasonDto[],
    selectedOption?: AdjustHoursBody['reasonCode'],
  ): AdjustmentOption[] {
    const adjustmentReasonCodes: Record<string, string> = {
      H: 'When the person on probation has less than an hour left',
      D: 'For example Scotland, the Channel Islands, Gibraltar or internationally',
      E: 'Add details',
    } as const

    return adjustmentReasons
      .filter(({ deliusCode }) => deliusCode in adjustmentReasonCodes)
      .map(({ name, deliusCode }) => ({
        text: name,
        value: deliusCode,
        hint: {
          html: adjustmentReasonCodes[deliusCode],
        },
        checked: selectedOption === deliusCode,
      }))
  }

  updatePath(crn: string, deliusEventNumber: string, originalSearch: Record<string, string>): string {
    return pathWithQuery(
      paths.people.adjustHours.update({
        crn,
        deliusEventNumber,
      }),
      originalSearch,
    )
  }
}
