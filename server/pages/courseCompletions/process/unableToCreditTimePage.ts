import { Request } from 'express'
import { CourseCompletionResolutionDto, EteCourseCompletionEventDto } from '../../../@types/shared'
import { ValidationErrors } from '../../../@types/user-defined'
import paths from '../../../paths'
import { CourseCompletionForm } from '../../../services/forms/courseCompletionFormService'
import BaseCourseCompletionFormPage, { CourseCompletionFormPageViewData } from './baseCourseCompletionFormPage'
import { CourseCompletionPage } from './pathMap'
import { pathWithQuery } from '../../../utils/utils'
import { CourseCompletionPageInput } from '../../courseCompletionIndexPage'

interface Body {
  unableToCreditTimeNotes?: string
}

export default class UnableToCreditTimePage extends BaseCourseCompletionFormPage<Body> {
  protected page: CourseCompletionPage = 'unableToCreditTime'

  getFormData(formData: CourseCompletionForm, body: Body): CourseCompletionForm {
    return {
      ...formData,
      unableToCreditTimeNotes: body.unableToCreditTimeNotes,
    }
  }

  requestBody(formData: CourseCompletionForm): CourseCompletionResolutionDto {
    return {
      type: 'DONT_CREDIT_TIME',
      crn: formData.crn,
      dontCreditTimeDetails: {
        notes: formData.unableToCreditTimeNotes,
      },
    }
  }

  override viewData(
    courseCompletion: EteCourseCompletionEventDto,
    formId?: string,
    originalSearch?: CourseCompletionPageInput,
    req?: Request,
  ): CourseCompletionFormPageViewData {
    return {
      communityCampusPerson: this.buildPerson(courseCompletion),
      backLink: this.backPath({ courseCompletionId: courseCompletion.id, formId, req, originalSearch }),
      updatePath: this.updatePath({ courseCompletionId: courseCompletion.id, formId, req, originalSearch }),
      courseName: courseCompletion.courseName,
      unableToCreditTimePath: this.unableToCreditTimePath(courseCompletion.id, formId),
    }
  }

  protected getValidationErrors(query: Body): ValidationErrors<Body> {
    const errors: ValidationErrors<Body> = {}

    if (query.unableToCreditTimeNotes && query.unableToCreditTimeNotes.length > 250) {
      errors.unableToCreditTimeNotes = { text: 'Notes must be 250 characters or less' }
    }

    return errors
  }

  override updatePath({
    courseCompletionId,
    formId,
    req,
    originalSearch = {},
  }: {
    courseCompletionId: string
    formId?: string
    req?: Request
    originalSearch?: CourseCompletionPageInput
  }): string {
    const backPage = req?.query?.backPage as CourseCompletionPage

    const query = {
      ...(formId ? { form: formId } : {}),
      ...(backPage ? { backPage } : {}),
      ...originalSearch,
    }

    return pathWithQuery(paths.courseCompletions.unableToCreditTime({ id: courseCompletionId }), query)
  }

  protected override backPath({
    courseCompletionId,
    formId,
    req,
    originalSearch,
  }: {
    courseCompletionId: string
    formId?: string
    req?: Request
    originalSearch?: CourseCompletionPageInput
  }): string {
    const backPage = req?.query?.backPage as CourseCompletionPage

    if (backPage) {
      return pathWithQuery(paths.courseCompletions.process({ id: courseCompletionId, page: backPage }), {
        form: formId,
        ...originalSearch,
      })
    }

    return pathWithQuery(this.exitPath(courseCompletionId), originalSearch)
  }
}
