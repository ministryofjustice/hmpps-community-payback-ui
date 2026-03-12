import { EteCourseCompletionEventDto } from '../../../@types/shared'
import { ValidationErrors } from '../../../@types/user-defined'
import paths from '../../../paths'
import { CourseCompletionForm } from '../../../services/forms/courseCompletionFormService'
import { ErrorViewData, generateErrorSummary } from '../../../utils/errorUtils'
import { pathWithQuery } from '../../../utils/utils'
import pathMap, { CourseCompletionPage } from './pathMap'

interface Person {
  name: string
}

export interface CourseCompletionFormPageViewData {
  backLink: string
  communityCampusPerson: Person
  updatePath: string
  courseName: string
}

export default abstract class BaseCourseCompletionFormPage<TBody> {
  private readonly viewPath = 'courseCompletions/process/'

  protected abstract page: CourseCompletionPage

  abstract getFormData(formData: CourseCompletionForm, body: TBody): CourseCompletionForm

  get templatePath(): string {
    return this.viewPath + this.page
  }

  nextPath(courseCompletionId: string, formId?: string): string {
    const nextPage = pathMap[this.page].next
    if (nextPage) {
      return this.pathWithFormId(paths.courseCompletions.process({ id: courseCompletionId, page: nextPage }), formId)
    }

    return this.exitPath(courseCompletionId)
  }

  validationErrors(query: TBody): ErrorViewData<TBody> {
    const errors = this.getValidationErrors(query)

    const errorSummary = generateErrorSummary(errors)

    return { errors, hasErrors: Object.keys(errors).length > 0, errorSummary }
  }

  viewData(courseCompletion: EteCourseCompletionEventDto, formId?: string): CourseCompletionFormPageViewData {
    return {
      communityCampusPerson: this.buildPerson(courseCompletion),
      backLink: this.backPath(courseCompletion.id, formId),
      updatePath: this.updatePath(courseCompletion.id, formId),
      courseName: courseCompletion.courseName,
    }
  }

  protected backPath(courseCompletionId: string, formId?: string): string {
    const backPage = pathMap[this.page].back

    if (backPage) {
      return this.pathWithFormId(paths.courseCompletions.process({ id: courseCompletionId, page: backPage }), formId)
    }

    return this.exitPath(courseCompletionId)
  }

  protected updatePath(courseCompletionId: string, formId?: string): string {
    return this.pathWithFormId(paths.courseCompletions.process({ id: courseCompletionId, page: this.page }), formId)
  }

  protected abstract getValidationErrors(query: TBody): ValidationErrors<TBody>

  protected buildPerson(courseCompletion: EteCourseCompletionEventDto): Person {
    const name = [courseCompletion.firstName, courseCompletion.lastName].join(' ')
    return {
      name,
    }
  }

  private exitPath(courseCompletionId: string): string {
    return paths.courseCompletions.show({ id: courseCompletionId })
  }

  protected pathWithFormId(path: string, form?: string): string {
    if (!form) {
      return path
    }
    return pathWithQuery(path, { form })
  }
}
