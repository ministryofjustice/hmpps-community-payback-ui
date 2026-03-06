import { EteCourseCompletionEventDto } from '../../../@types/shared'
import { ValidationErrors } from '../../../@types/user-defined'
import paths from '../../../paths'
import { ErrorViewData, generateErrorSummary } from '../../../utils/errorUtils'
import pathMap, { CourseCompletionPage } from './pathMap'

interface Person {
  name: string
  crn?: string
}

export interface CourseCompletionFormPageViewData {
  backLink: string
  offender: Person
  updatePath: string
}

export default abstract class BaseCourseCompletionFormPage<TBody> {
  private readonly viewPath = 'courseCompletions/process/'

  protected abstract page: CourseCompletionPage

  get templatePath(): string {
    return this.viewPath + this.page
  }

  nextPath(courseCompletionId: string): string {
    const nextPage = pathMap[this.page].next
    if (nextPage) {
      return paths.courseCompletions.process({ id: courseCompletionId, page: nextPage })
    }

    return this.exitPath(courseCompletionId)
  }

  validationErrors(query: TBody): ErrorViewData<TBody> {
    const errors = this.getValidationErrors(query)

    const errorSummary = generateErrorSummary(errors)

    return { errors, hasErrors: Object.keys(errors).length > 0, errorSummary }
  }

  commonViewData(courseCompletion: EteCourseCompletionEventDto): CourseCompletionFormPageViewData {
    return {
      offender: this.buildPerson(courseCompletion),
      backLink: this.backPath(courseCompletion.id),
      updatePath: this.updatePath(courseCompletion.id),
    }
  }

  protected backPath(courseCompletionId: string): string {
    const backPage = pathMap[this.page].back

    if (backPage) {
      return paths.courseCompletions.process({ id: courseCompletionId, page: backPage })
    }

    return this.exitPath(courseCompletionId)
  }

  protected updatePath(courseCompletionId: string): string {
    return paths.courseCompletions.process({ id: courseCompletionId, page: this.page })
  }

  protected abstract getValidationErrors(query: TBody): ValidationErrors<TBody> | undefined

  private buildPerson(courseCompletion: EteCourseCompletionEventDto): Person {
    const name = [courseCompletion.firstName, courseCompletion.lastName].join(' ')
    return {
      name,
    }
  }

  private exitPath(courseCompletionId: string): string {
    return paths.courseCompletions.show({ id: courseCompletionId })
  }
}
