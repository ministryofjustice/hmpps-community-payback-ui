import OutcomePage, { OutcomePageBody } from '../../../pages/courseCompletions/process/outcomePage'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController, { StepViewDataParams } from './baseController'
import GovukFrontendDateInput, { GovUkFrontendDateInputItem } from '../../../forms/GovukFrontendDateInput'
import GovUkRadioGroup from '../../../forms/GovUkRadioGroup'
import { ValidationErrors, ViewDataWithNotes, ViewDataWithTimeToCredit } from '../../../@types/user-defined'
import CourseCompletionUtils, { CourseDetails } from '../../../utils/courseCompletionUtils'

type ViewData = {
  dateItems: Array<GovUkFrontendDateInputItem>
  courseDetailsItems: CourseDetails
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

  protected override async getStepViewData({
    req,
    formData,
    errors,
    courseCompletion,
  }: StepViewDataParams): Promise<ViewData> {
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
    const isSensitive = this.getPropertyValue({ propertyName: 'isSensitive', req, formData })
    const isSensitiveItems = GovUkRadioGroup.yesNoItems({ checkedValue: isSensitive })

    const courseDetailsItems = CourseCompletionUtils.formattedCourseDetails(courseCompletion)

    return { timeToCredit, dateItems, notes, isSensitiveItems, courseDetailsItems }
  }
}
