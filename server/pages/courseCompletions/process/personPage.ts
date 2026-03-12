import { EteCourseCompletionEventDto } from '../../../@types/shared'
import { CourseCompletionForm } from '../../../services/forms/courseCompletionFormService'
import CourseCompletionUtils, { LearnerDetails } from '../../../utils/courseCompletionUtils'
import BaseCourseCompletionFormPage from './baseCourseCompletionFormPage'
import { CourseCompletionPage } from './pathMap'

interface Body {
  isMatch: boolean
}

export interface PersonPageViewData {
  learnerDetails: LearnerDetails
}

export default class PersonPage extends BaseCourseCompletionFormPage<Body> {
  protected page: CourseCompletionPage = 'person'

  protected getValidationErrors(_: Body) {
    return {}
  }

  getFormData(formData: CourseCompletionForm, _body: Body): CourseCompletionForm {
    // TODO: implement form data to save
    return formData
  }

  stepViewData(courseCompletion: EteCourseCompletionEventDto): PersonPageViewData {
    return {
      learnerDetails: CourseCompletionUtils.formattedLearnerDetails(courseCompletion),
    }
  }
}
