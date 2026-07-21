import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import BaseAppointmentController, { AppointmentStepViewDataParams } from './baseAppointmentController'
import BaseAppointmentUpdatePage from '../../pages/appointments/baseAppointmentUpdatePage'
import AppointmentService from '../../services/appointmentService'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import SessionService from '../../services/sessionService'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'

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

  let page: DeepMocked<BaseAppointmentUpdatePage<unknown>>
  let controller: TestAppointmentController

  beforeEach(() => {
    jest.resetAllMocks()

    page = createMock<BaseAppointmentUpdatePage<unknown>>()
    controller = new TestAppointmentController(page, appointmentService, formService, sessionService)
  })

  describe('create', () => {
    it('should render the template with the paths and step view data for a new appointment', async () => {
      const form = appointmentOutcomeFormFactory.build({ date: '2026-01-01' })
      const paths = { backLink: '/back', updatePath: '/update' }

      formService.getForm.mockResolvedValue(form)
      page.paths.mockReturnValue(paths)

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

      expect(response.render).toHaveBeenCalledWith(templatePath, {
        ...paths,
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

      formService.getForm.mockResolvedValue(form)
      page.paths.mockReturnValue(paths)
      page.validationErrors.mockReturnValue({ errors, hasErrors: true, errorSummary })

      const requestHandler = controller.submitCreate()
      await requestHandler(requestWithBody, response, next)

      expect(page.validationErrors).toHaveBeenCalledWith(body, {})

      expect(response.render).toHaveBeenCalledWith(templatePath, {
        ...paths,
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
