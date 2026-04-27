import { EteCourseCompletionEventDto, OffenderDto, OffenderFullDto } from '../../../@types/shared'
import Offender from '../../../models/offender'
import paths from '../../../paths'
import { CourseCompletionForm } from '../../../services/forms/courseCompletionFormService'
import { pathWithQuery } from '../../../utils/utils'
import { CourseCompletionPageInput } from '../../courseCompletionIndexPage'
import PageWithValidation from '../../pageWithValidation'
import pathMap, { CourseCompletionPage } from './pathMap'

interface Person {
  name: string
}

export interface CourseCompletionFormPageViewData {
  backLink: string
  communityCampusPerson: Person
  updatePath: string
  courseName: string
  unableToCreditTimePath: string
}

export default abstract class BaseCourseCompletionFormPage<TBody> extends PageWithValidation<TBody> {
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

  viewData(
    courseCompletion: EteCourseCompletionEventDto,
    formId?: string,
    originalSearch?: CourseCompletionPageInput,
  ): CourseCompletionFormPageViewData {
    return {
      communityCampusPerson: this.buildPerson(courseCompletion),
      backLink: this.backPath({ courseCompletionId: courseCompletion.id, formId, originalSearch }),
      updatePath: this.updatePath({ courseCompletionId: courseCompletion.id, formId, originalSearch }),
      courseName: courseCompletion.courseName,
      unableToCreditTimePath: this.unableToCreditTimePath(courseCompletion.id, formId, originalSearch),
    }
  }

  protected backPath({
    courseCompletionId,
    formId,
  }: {
    courseCompletionId: string
    formId?: string
    originalSearch?: CourseCompletionPageInput
  }): string {
    const backPage = pathMap[this.page].back

    if (backPage) {
      return this.pathWithFormId(paths.courseCompletions.process({ id: courseCompletionId, page: backPage }), formId)
    }

    return this.exitPath(courseCompletionId)
  }

  updatePath({
    courseCompletionId,
    formId,
  }: {
    courseCompletionId: string
    formId?: string
    originalSearch?: CourseCompletionPageInput
  }): string {
    return this.pathWithFormId(paths.courseCompletions.process({ id: courseCompletionId, page: this.page }), formId)
  }

  protected unableToCreditTimePath(
    courseCompletionId: string,
    formId?: string,
    originalSearch?: CourseCompletionPageInput,
  ): string {
    const path = pathWithQuery(paths.courseCompletions.unableToCreditTime({ id: courseCompletionId }), {
      backPage: this.page,
      ...originalSearch,
    })

    return this.pathWithFormId(path, formId)
  }

  protected buildPerson(courseCompletion: EteCourseCompletionEventDto): Person {
    const name = [courseCompletion.firstName, courseCompletion.lastName].join(' ')
    return {
      name,
    }
  }

  protected exitPath(courseCompletionId: string): string {
    return paths.courseCompletions.show({ id: courseCompletionId })
  }

  protected pathWithFormId(path: string, form?: string): string {
    if (!form) {
      return path
    }
    return pathWithQuery(path, { form })
  }

  successMessage(offenderDto: OffenderDto | OffenderFullDto): string {
    const offender = new Offender(offenderDto)
    return offender.isLimited
      ? `The course completion for CRN: ${offender.crn} has been processed.`
      : `The course completion for ${offender.name} has been processed.`
  }
}
