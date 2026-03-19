import { GovUkSummaryListItem } from '../../../@types/user-defined'
import paths from '../../../paths'
import { CourseCompletionForm } from '../../../services/forms/courseCompletionFormService'
import BaseCourseCompletionFormPage from './baseCourseCompletionFormPage'
import { CourseCompletionPage } from './pathMap'

interface Body {
  alert: boolean
}

interface StepViewData {
  personItems: GovUkSummaryListItem[]
}

export default class ConfirmPage extends BaseCourseCompletionFormPage<Body> {
  protected page: CourseCompletionPage = 'confirm'

  protected getValidationErrors(_: Body) {
    return {}
  }

  getFormData(formData: CourseCompletionForm, _body: Body): CourseCompletionForm {
    // TODO: implement form data to save
    return formData
  }

  stepViewData(courseCompletionId: string, form: CourseCompletionForm, formId?: string): StepViewData {
    return {
      personItems: this.personItems(courseCompletionId, form, formId),
    }
  }

  private personItems(courseCompletionId: string, form: CourseCompletionForm, formId?: string): GovUkSummaryListItem[] {
    return [
      {
        key: {
          text: 'CRN',
        },
        value: {
          text: form.crn,
        },
        actions: {
          items: [
            {
              href: this.pathWithFormId(
                paths.courseCompletions.process({ page: 'crn', id: courseCompletionId }),
                formId,
              ),
              text: 'Change',
              visuallyHiddenText: 'crn',
            },
          ],
        },
      },
    ]
  }
}
