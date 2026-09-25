import { AdjustmentReasonDto } from '../@types/shared'
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
}

interface Items {
  form: AdjustmentForm
  formId: string
  crn: string
  deliusEventNumber: string
  adjustmentReasons: AdjustmentReasonDto[]
}

export default class AdjustHoursConfirmPage {
  viewData({
    offender,
    deliusEventNumber,
    form,
    formId,
    adjustmentReasons,
  }: {
    offender: Offender
    deliusEventNumber: string
    form: AdjustmentForm
    formId?: string
    adjustmentReasons: AdjustmentReasonDto[]
  }): PageViewData {
    const { name, crn } = offender

    const exitPath = ''

    return {
      heading: { title: name, caption: crn },
      backLink: exitPath,
      updatePath: paths.people.adjustHours.update({ crn: offender.crn, deliusEventNumber }),
      items: this.items({ form, formId, crn, deliusEventNumber, adjustmentReasons }),
    }
  }

  updatePath(crn: string, deliusEventNumber: string): string {
    return pathWithQuery(
      paths.people.adjustHours.confirm({
        crn,
        deliusEventNumber,
      }),
    )
  }

  items({ form, formId, crn, deliusEventNumber, adjustmentReasons }: Items): GovUkSummaryListItem[] {
    const changeLink = pathWithQuery(
      paths.people.adjustHours.update({ crn, deliusEventNumber }),
      { form: formId, originalPath: form.originalPath },
      { encode: true },
    )
    const reason = adjustmentReasons.find(r => r.deliusCode === form.adjustmentReasonId)

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
              href: changeLink,
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
              href: changeLink,
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
              href: changeLink,
              text: 'Change',
              visuallyHiddenText: 'adjustment reason',
            },
          ],
        },
      },
    ]
  }
}
