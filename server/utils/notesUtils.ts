import { AppointmentDto } from '../@types/shared'
import { BodyWithNotes, GovUkSummaryListItem, ViewDataWithNotes, YesOrNo } from '../@types/user-defined'
import GovUkRadioGroup from '../forms/GovUkRadioGroup'
import { properCase } from './utils'

export default class NotesUtils {
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
    return [
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
      {
        key: {
          text: 'Sensitive',
        },
        value: {
          text: NotesUtils.getIsSensitiveAnswer(form, appointment),
        },
        actions: {
          items: isSensitiveActions,
        },
      },
    ]
  }

  private static getIsSensitiveAnswer(form: BodyWithNotes, appointment?: AppointmentDto): string {
    if (appointment?.sensitive === true) {
      return 'Yes'
    }

    return form.isSensitive ? properCase(form.isSensitive) : 'Not entered'
  }

  static questionItems(
    query: BodyWithNotes,
    form: BodyWithNotes,
    appointment?: AppointmentDto,
    includeIsSensitiveQuestion: boolean = true,
  ): ViewDataWithNotes {
    const notes = query.notes ?? form.notes
    const showIsSensitiveQuestion = includeIsSensitiveQuestion ? appointment?.sensitive !== true : false

    if (showIsSensitiveQuestion) {
      const sensitive =
        query.isSensitive ?? form.isSensitive ?? GovUkRadioGroup.determineCheckedValue(appointment?.sensitive)

      return {
        notes,
        showIsSensitiveQuestion,
        isSensitiveItems: this.isSensitiveItems(sensitive),
      }
    }

    return {
      notes,
      showIsSensitiveQuestion,
    }
  }

  private static isSensitiveItems(isSensitive?: YesOrNo): { text: string; value: YesOrNo; checked: boolean }[] {
    return [
      {
        text: 'Yes, they include sensitive information',
        value: 'yes',
        checked: isSensitive === 'yes',
      },
      {
        text: 'No, they are not sensitive',
        value: 'no',
        checked: isSensitive === 'no',
      },
    ]
  }
}
