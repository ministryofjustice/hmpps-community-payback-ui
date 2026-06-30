import { AppointmentDto } from '../@types/shared'
import { BodyWithNotes, GovUkSummaryListItem, ViewDataWithNotes, YesOrNo } from '../@types/user-defined'
import GovUkRadioGroup from '../forms/GovUkRadioGroup'

export default class NotesUtils {
  static sensitiveInfoContentMarkedAsSensitive =
    'This note will be automatically marked sensitive as an earlier note was already flagged.'

  static sensitiveInfoContentDontInclude = `Don't include sensitive or individual information.`

  static formData(query: BodyWithNotes): BodyWithNotes {
    return { notes: query.notes, isSensitive: query.isSensitive }
  }

  static requestBody(
    form: BodyWithNotes,
    appointmentIsSensitive?: boolean | null,
    allowSensitiveUpdate: boolean = true,
  ) {
    return {
      notes: form.notes,
      sensitive: NotesUtils.sensitiveRequestBody(form, appointmentIsSensitive, allowSensitiveUpdate),
    }
  }

  private static sensitiveRequestBody(
    form: BodyWithNotes,
    appointmentIsSensitive?: boolean | null,
    allowSensitiveUpdate: boolean = true,
  ) {
    if (!allowSensitiveUpdate) {
      return appointmentIsSensitive
    }

    return appointmentIsSensitive === true ? true : GovUkRadioGroup.nullableValueFromYesOrNoItem(form.isSensitive)
  }

  static checkYourAnswersRows(
    form: BodyWithNotes,
    changePath: string,
    appointment?: AppointmentDto,
    includeIsSensitiveQuestion = true,
  ): Array<GovUkSummaryListItem> {
    const isSensitiveActions =
      appointment?.sensitive === true
        ? []
        : [
            {
              href: changePath,
              text: 'Change',
              visuallyHiddenText: 'sensitivity',
            },
          ]
    const rows = [
      {
        key: {
          text: 'Notes',
        },
        value: {
          text: form.notes,
        },
        actions: {
          items: [
            {
              href: changePath,
              text: 'Change',
              visuallyHiddenText: 'notes',
            },
          ],
        },
      },
    ]
    if (includeIsSensitiveQuestion) {
      rows.push({
        key: {
          text: 'Sensitive',
        },
        value: {
          text: NotesUtils.getIsSensitiveAnswer(form, appointment),
        },
        actions: {
          items: isSensitiveActions,
        },
      })
    }
    return rows
  }

  private static getIsSensitiveAnswer(form: BodyWithNotes, appointment?: AppointmentDto): string {
    if (appointment?.sensitive === true || form.isSensitive === 'yes') {
      return 'Yes'
    }

    return 'Not entered'
  }

  static questionItems(
    query: BodyWithNotes,
    form: BodyWithNotes,
    appointment?: AppointmentDto,
    includeIsSensitiveQuestion: boolean = true,
  ): ViewDataWithNotes {
    const notes = query.notes ?? form.notes

    if (!includeIsSensitiveQuestion) {
      return {
        notes,
        sensitiveInfoContent: NotesUtils.sensitiveInfoContentDontInclude,
      }
    }
    const showIsSensitiveQuestion = appointment?.sensitive !== true

    if (showIsSensitiveQuestion) {
      const sensitive =
        query.isSensitive ?? form.isSensitive ?? GovUkRadioGroup.determineCheckedValue(appointment?.sensitive)

      return {
        notes,
        isSensitiveItem: this.isSensitiveItem(sensitive),
      }
    }

    return {
      notes,
      sensitiveInfoContent: NotesUtils.sensitiveInfoContentMarkedAsSensitive,
    }
  }

  private static isSensitiveItem(
    isSensitive?: YesOrNo,
  ): { text: string; value: 'yes'; checked: boolean; label?: Record<string, unknown> }[] {
    return [
      {
        text: 'This is information that you believe must be recorded but not shared with a person on probation. If they make a request for their record, the Data Protection Team will decide whether the information can be shared.',
        value: 'yes',
        checked: isSensitive === 'yes',
        label: { classes: 'govuk-!-padding-top-0' },
      },
    ]
  }
}
