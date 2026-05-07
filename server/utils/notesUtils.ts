import { BodyWithNotes, GovUkSummaryListItem, YesOrNo } from '../@types/user-defined'
import GovUkRadioGroup from '../forms/GovUkRadioGroup'
import { properCase } from './utils'

export default class NotesUtils {
  static formData(query: BodyWithNotes): BodyWithNotes {
    return { notes: query.notes, isSensitive: query.isSensitive }
  }

  static requestBody(form: BodyWithNotes) {
    return {
      notes: form.notes,
      sensitive: GovUkRadioGroup.nullableValueFromYesOrNoItem(form.isSensitive),
    }
  }

  static checkYourAnswersRows(form: BodyWithNotes, changePath: string): Array<GovUkSummaryListItem> {
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
          text: form.isSensitive ? properCase(form.isSensitive) : 'Not entered',
        },
        actions: {
          items: [
            {
              href: changePath,
              text: 'Change',
              visuallyHiddenText: 'sensitivity',
            },
          ],
        },
      },
    ]
  }

  static questionItems(query: BodyWithNotes, form: BodyWithNotes) {
    const sensitive = query.isSensitive ?? form.isSensitive

    return {
      notes: query.notes ?? form.notes,
      isSensitiveItems: this.isSensitiveItems(sensitive),
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
