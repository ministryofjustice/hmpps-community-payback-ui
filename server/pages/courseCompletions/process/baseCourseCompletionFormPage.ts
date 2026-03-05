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
  protected abstract page: CourseCompletionPage

  nextPath(courseCompletionId: string): string {
    const nextPage = pathMap[this.page].next
    return paths.courseCompletions.process[nextPage]({ id: courseCompletionId })
  }

  validationErrors(query: TBody): ErrorViewData<TBody> {
    const errors = this.getValidationErrors(query)

    const errorSummary = generateErrorSummary(errors)

    return { errors, hasErrors: Object.keys(errors).length > 0, errorSummary }
  }

  protected backPath(courseCompletionId: string): string {
    const backPage = pathMap[this.page].back
    return paths.courseCompletions.process[backPage]({ id: courseCompletionId })
  }

  protected updatePath(courseCompletionId: string): string {
    return paths.courseCompletions.process[this.page]({ id: courseCompletionId })
  }

  protected abstract getValidationErrors(query: TBody): ValidationErrors<TBody> | undefined

  protected commonViewData(courseCompletion: EteCourseCompletionEventDto): CourseCompletionFormPageViewData {
    return {
      offender: this.buildPerson(courseCompletion),
      backLink: this.backPath(courseCompletion.id),
      updatePath: this.updatePath(courseCompletion.id),
    }
  }

  private buildPerson(courseCompletion: EteCourseCompletionEventDto): Person {
    const name = [courseCompletion.firstName, courseCompletion.lastName].join(' ')
    return {
      name,
    }
  }
}
