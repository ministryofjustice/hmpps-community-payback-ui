import OutcomePage, { OutcomePageBody } from '../../../pages/courseCompletions/process/outcomePage'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController, { StepViewDataParams } from './baseController'
import GovukFrontendDateInput, { GovUkFrontendDateInputItem } from '../../../forms/GovukFrontendDateInput'
import GovUkRadioGroup from '../../../forms/GovUkRadioGroup'
import { ValidationErrors, ViewDataWithNotes, ViewDataWithTimeToCredit, YesOrNo } from '../../../@types/user-defined'

type ViewData = {
  dateItems: Array<GovUkFrontendDateInputItem>
} & ViewDataWithNotes &
  ViewDataWithTimeToCredit

export default class OutcomeController extends BaseController<OutcomePage> {
  constructor(
    page: OutcomePage,
    courseCompletionService: CourseCompletionService,
    formService: CourseCompletionFormService,
  ) {
    super(page, courseCompletionService, formService)
  }

  protected override async getStepViewData({ req, formData, errors }: StepViewDataParams): Promise<ViewData> {
    const timeToCredit = {
      hours: this.getPropertyValue({ propertyName: 'hours', req, formData: formData.timeToCredit ?? {} }),
      minutes: this.getPropertyValue({ propertyName: 'minutes', req, formData: formData.timeToCredit ?? {} }),
    }
    const date = {
      day: this.getPropertyValue({ propertyName: 'date-day', req, formData }),
      month: this.getPropertyValue({ propertyName: 'date-month', req, formData }),
      year: this.getPropertyValue({ propertyName: 'date-year', req, formData }),
    }
    const hasDateError = (errors as ValidationErrors<OutcomePageBody>)['date-day'] !== undefined
    const dateItems = GovukFrontendDateInput.getDateItemsFromStructuredDate(date, hasDateError)
    const notes = this.getPropertyValue({ propertyName: 'notes', req, formData })
    const isSensitiveValue = this.getPropertyValue({ propertyName: 'isSensitive', req, formData }) as
      | YesOrNo
      | undefined
    const isSensitiveItems = GovUkRadioGroup.yesNoItems({ checkedValue: isSensitiveValue })

    return { timeToCredit, dateItems, notes, isSensitiveItems }
  }
}
