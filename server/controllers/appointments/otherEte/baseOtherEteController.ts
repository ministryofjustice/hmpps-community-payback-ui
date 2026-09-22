import type { Request, RequestHandler, Response } from 'express'
import { NotFound } from 'http-errors'
import PageWithValidation from '../../../pages/pageWithValidation'
import { buildOtherEtePath, OtherEteFormPage } from '../../../pages/appointments/otherEte/pathMap'
import RecordActivityFormService, { RecordActivityForm } from '../../../services/forms/recordActivityFormService'
import OffenderService from '../../../services/offenderService'
import AppointmentUtils from '../../../utils/appointmentUtils'
import paths from '../../../paths'
import { IFormPageController, ValidationErrors } from '../../../@types/user-defined'

export type OtherEteStepViewDataParams<TContext> = {
  req: Request
  res: Response
  form: RecordActivityForm
  contextData: TContext
}

export default abstract class BaseOtherEteController<TContext = unknown> implements IFormPageController {
  constructor(
    protected readonly formService: RecordActivityFormService,
    protected readonly offenderService: OffenderService,
  ) {}

  protected abstract pageName: OtherEteFormPage

  protected abstract nextPage(form: RecordActivityForm): OtherEteFormPage

  protected abstract backPage(form: RecordActivityForm): OtherEteFormPage | undefined

  protected abstract getTemplatePath(): string

  protected abstract getContextData(params: {
    req: Request
    res: Response
    form: RecordActivityForm
  }): Promise<TContext>

  protected abstract getStepViewData(params: OtherEteStepViewDataParams<TContext>): Promise<object>

  protected abstract validate(query: unknown, contextData: TContext): ValidationErrors<unknown>

  protected abstract updateForm(form: RecordActivityForm, body: unknown, contextData: TContext): RecordActivityForm

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { username } = res.locals.user
      const formId = req.query.form?.toString()

      if (!formId) {
        throw new NotFound()
      }

      const form = await this.formService.getForm(formId, username)

      const contextData = await this.getContextData({ req, res, form })

      res.locals.audit = { subjectType: 'CRN', subjectId: form.crn }

      const viewData = {
        ...(await this.commonViewData({ res, form, formId })),
        ...(await this.getStepViewData({ req, res, form, contextData })),
        errors: {},
      }

      return res.render(this.getTemplatePath(), viewData)
    }
  }

  submitUpdate(): RequestHandler {
    return async (req: Request, res: Response, next) => {
      const formId = req.query.form?.toString()

      if (!formId) {
        return this.show()(req, res, next)
      }

      const { username } = res.locals.user

      const form = await this.formService.getForm(formId, username)
      const contextData = await this.getContextData({ req, res, form })
      const { errors, hasErrors, errorSummary } = PageWithValidation.validate(
        req.body,
        (query, additionalParams) => this.validate(query, additionalParams),
        contextData,
      )

      res.locals.audit = { subjectType: 'CRN', subjectId: form.crn }

      if (hasErrors) {
        const viewData = {
          ...(await this.commonViewData({ res, form, formId })),
          ...(await this.getStepViewData({ req, res, form, contextData })),
          errors,
          errorSummary,
        }

        return res.render(this.getTemplatePath(), viewData)
      }

      const updatedForm = this.updateForm(form, req.body, contextData)
      await this.formService.saveForm(formId, username, updatedForm)

      return res.redirect(buildOtherEtePath(this.nextPage(updatedForm), formId))
    }
  }

  private async commonViewData({ res, form, formId }: { res: Response; form: RecordActivityForm; formId: string }) {
    const offenderSummary = await this.offenderService.getOffenderSummary({
      username: res.locals.user.username,
      crn: form.crn,
    })

    const backPage = this.backPage(form)
    const backLink = backPage
      ? buildOtherEtePath(backPage, formId)
      : paths.people.createAppointment.chooseType({ crn: form.crn, deliusEventNumber: form.deliusEventNumber })

    return {
      heading: AppointmentUtils.appointmentHeading(offenderSummary.offender, form.projectTypeGroup),
      backLink,
      updatePath: buildOtherEtePath(this.pageName, formId),
      form: formId,
    }
  }
}
