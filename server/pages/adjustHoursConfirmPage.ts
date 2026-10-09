import { AdjustmentReasonDto, CreateAdjustmentDto, UnpaidWorkDetailsDto } from '../@types/shared'
import { GovUkSummaryListItem } from '../@types/user-defined'
import Offender from '../models/offender'
import paths from '../paths'
import { AdjustmentForm } from '../services/forms/adjustmentFormService'
import DateTimeFormats from '../utils/dateTimeUtils'
import { pathWithQuery } from '../utils/utils'

type PageViewData = {
  backLink: string
  heading: { title: string; caption: string }
  updatePath: string
  items: GovUkSummaryListItem[]
  calculatedRemainingHoursText: string
}

export default class AdjustHoursConfirmPage {
  viewData({
    offender,
    deliusEventNumber,
    form,
    formId,
    adjustmentReasons,
    upwDetails,
  }: {
    offender: Offender
    deliusEventNumber: string
    form: AdjustmentForm
    formId?: string
    adjustmentReasons: AdjustmentReasonDto[]
    upwDetails: UnpaidWorkDetailsDto[]
  }): PageViewData {
    const { name, crn } = offender

    const unpaidWorkDetails = upwDetails.find(upwDetail => upwDetail.eventNumber.toString() === deliusEventNumber)

    const backLink = pathWithQuery(
      paths.people.adjustHours.update({ crn, deliusEventNumber }),
      {
        form: formId,
        originalPath: form.originalPath,
      },
      { encode: true },
    )

    return {
      heading: { title: name, caption: crn },
      backLink,
      updatePath: pathWithQuery(paths.people.adjustHours.confirm({ crn: offender.crn, deliusEventNumber }), {
        form: formId,
      }),
      items: this.items({ form, changeUrl: backLink, adjustmentReasons }),
      calculatedRemainingHoursText: this.calculateRemainingHoursText(unpaidWorkDetails, form.minutes),
    }
  }

  updatePath(crn: string, deliusEventNumber: string, formId: string): string {
    return pathWithQuery(
      paths.people.adjustHours.confirm({
        crn,
        deliusEventNumber,
      }),
      { form: formId },
    )
  }

  items({
    form,
    changeUrl,
    adjustmentReasons,
  }: {
    form: AdjustmentForm
    changeUrl: string
    adjustmentReasons: AdjustmentReasonDto[]
  }): GovUkSummaryListItem[] {
    const reason = adjustmentReasons.find(r => r.id === form.adjustmentReasonId)

    return [
      {
        key: {
          text: 'Date',
        },
        value: {
          text: DateTimeFormats.isoDateToUIDate(form.adjustmentDate),
        },
        actions: {
          items: [
            {
              href: changeUrl,
              text: 'Change',
              visuallyHiddenText: 'date',
            },
          ],
        },
      },
      {
        key: {
          text: 'Reason',
        },
        value: {
          text: reason.name,
        },
        actions: {
          items: [
            {
              href: changeUrl,
              text: 'Change',
              visuallyHiddenText: 'adjustment reason',
            },
          ],
        },
      },
      {
        key: {
          text: 'Time taken off',
        },
        value: {
          text: DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(form.minutes),
        },
        actions: {
          items: [
            {
              href: changeUrl,
              text: 'Change',
              visuallyHiddenText: 'time taken off',
            },
          ],
        },
      },
    ]
  }

  calculateRemainingHoursText(upwDetails: UnpaidWorkDetailsDto, minutesToBeTakenOff: number): string {
    const remainingMinutesBeforeAdjustment = upwDetails.requiredMinutes - upwDetails.completedMinutes
    const remainingMinutesAfterAdjustment = remainingMinutesBeforeAdjustment - minutesToBeTakenOff

    return `The total amount of time remaining will be ${DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(remainingMinutesAfterAdjustment)}`
  }

  requestBody(form: AdjustmentForm): CreateAdjustmentDto {
    return {
      adjustmentReasonId: form.adjustmentReasonId,
      adjustmentDate: form.adjustmentDate,
      minutes: form.minutes,
      type: 'Negative',
    }
  }
}
