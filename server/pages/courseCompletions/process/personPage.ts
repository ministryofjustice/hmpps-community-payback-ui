import { EteCourseCompletionEventDto, OffenderDto } from '../../../@types/shared'
import { CourseCompletionForm } from '../../../services/forms/courseCompletionFormService'
import CourseCompletionUtils, {
  CourseCompletionOffenderDetails,
  LearnerDetails,
} from '../../../utils/courseCompletionUtils'
import BaseCourseCompletionFormPage from './baseCourseCompletionFormPage'
import { CourseCompletionPage } from './pathMap'

interface Body {
  isMatch: boolean
}

export interface PersonPageViewData {
  learnerDetails: LearnerDetails
  offenderDetails: CourseCompletionOffenderDetails
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

  stepViewData(courseCompletion: EteCourseCompletionEventDto, offender: OffenderDto): PersonPageViewData {
    return {
      learnerDetails: CourseCompletionUtils.formattedLearnerDetails(courseCompletion),
      offenderDetails: CourseCompletionUtils.formattedOffenderDetails(offender),
    }
  }
}
