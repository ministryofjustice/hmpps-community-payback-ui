import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import BaseAppointmentController, { AppointmentStepViewDataParams } from './baseAppointmentController'
import BaseAppointmentUpdatePage from '../../pages/appointments/baseAppointmentUpdatePage'
import AppointmentService from '../../services/appointmentService'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import SessionService from '../../services/sessionService'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import OffenderService from '../../services/offenderService'
import caseDetailsSummaryFactory from '../../testutils/factories/caseDetailsSummaryFactory'

const templatePath = 'appointments/update/test'
const stepViewData = { stepKey: 'step value' }

class TestAppointmentController extends BaseAppointmentController<BaseAppointmentUpdatePage<unknown>> {
  protected async getStepViewData(_args: AppointmentStepViewDataParams): Promise<object> {
    return stepViewData
  }

  protected getTemplatePath(): string {
    return templatePath
  }
}

describe('BaseAppointmentController', () => {
  const userName = 'user'
  const projectCode = '2'
  const formId = '123'

  const request = createMock<Request>({ params: { projectCode }, query: { form: formId } })
  const response = createMock<Response>({ locals: { user: { username: userName } } })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const appointmentService = createMock<AppointmentService>()
  const formService = createMock<AppointmentFormService>()
  const sessionService = createMock<SessionService>()
  const offenderService = createMock<OffenderService>()

  let page: DeepMocked<BaseAppointmentUpdatePage<unknown>>
  let controller: TestAppointmentController

  beforeEach(() => {
    jest.resetAllMocks()

    page = createMock<BaseAppointmentUpdatePage<unknown>>()
    controller = new TestAppointmentController(page, appointmentService, formService, sessionService, offenderService)
  })

  describe('create', () => {
    it('should render the template with the paths and step view data for a new appointment', async () => {
      const form = appointmentOutcomeFormFactory.build({ date: '2026-01-01' })
      const paths = { backLink: '/back', updatePath: '/update' }
      const caseDetailsSummary = caseDetailsSummaryFactory.build()
      const heading = { title: 'Some Name', caption: 'X123456' }

      formService.getForm.mockResolvedValue(form)
      page.paths.mockReturnValue(paths)
      offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)
      page.offenderHeading.mockReturnValue(heading)

      const requestHandler = controller.create()
      await requestHandler(request, response, next)

      expect(formService.getForm).toHaveBeenCalledWith(formId, userName)

      expect(page.paths).toHaveBeenCalledWith({
        pathData: {
          projectCode,
          appointmentId: 'create',
          date: form.date,
        },
        form,
        formId,
      })

      expect(page.offenderHeading).toHaveBeenCalledWith(caseDetailsSummary.offender)

      expect(response.render).toHaveBeenCalledWith(templatePath, {
        ...paths,
        heading,
        ...stepViewData,
      })
    })
  })

  describe('submitCreate', () => {
    const body = { form: formId, some: 'value' }
    const requestWithBody = createMock<Request>({
      params: { projectCode },
      query: { form: formId },
      body,
    })

    it('should re-render the template with errors when validation fails', async () => {
      const form = appointmentOutcomeFormFactory.build({ date: '2026-01-01' })
      const paths = { backLink: '/back', updatePath: '/update' }
      const errors = { some: 'error' }
      const errorSummary = [{ text: 'some error', href: '#some', attributes: {} }]
      const caseDetailsSummary = caseDetailsSummaryFactory.build()
      const heading = { title: 'Some Name', caption: 'X123456' }

      formService.getForm.mockResolvedValue(form)
      page.paths.mockReturnValue(paths)
      page.validationErrors.mockReturnValue({ errors, hasErrors: true, errorSummary })
      offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)
      page.offenderHeading.mockReturnValue(heading)

      const requestHandler = controller.submitCreate()
      await requestHandler(requestWithBody, response, next)

      expect(page.validationErrors).toHaveBeenCalledWith(body, {})

      expect(response.render).toHaveBeenCalledWith(templatePath, {
        ...paths,
        heading,
        ...stepViewData,
        errorSummary,
        errors,
      })
      expect(formService.saveForm).not.toHaveBeenCalled()
      expect(response.redirect).not.toHaveBeenCalled()
    })

    it('should save the updated form and redirect to the next page when validation passes', async () => {
      const form = appointmentOutcomeFormFactory.build({ date: '2026-01-01' })
      const updatedForm = appointmentOutcomeFormFactory.build({ date: '2026-01-01' })
      const paths = { backLink: '/back', updatePath: '/update' }
      const nextPath = '/next-page'

      formService.getForm.mockResolvedValue(form)
      page.paths.mockReturnValue(paths)
      page.validationErrors.mockReturnValue({ errors: {}, hasErrors: false, errorSummary: [] })
      page.updateForm.mockReturnValue(updatedForm)
      page.next.mockReturnValue(nextPath)

      const requestHandler = controller.submitCreate()
      await requestHandler(requestWithBody, response, next)

      expect(page.updateForm).toHaveBeenCalledWith(form, body, {})
      expect(formService.saveForm).toHaveBeenCalledWith(formId, userName, updatedForm)

      expect(page.next).toHaveBeenCalledWith({
        projectCode,
        appointmentId: 'create',
        date: form.date,
        form: updatedForm,
        formId,
      })

      expect(response.redirect).toHaveBeenCalledWith(nextPath)
      expect(response.render).not.toHaveBeenCalled()
    })
  })
})
