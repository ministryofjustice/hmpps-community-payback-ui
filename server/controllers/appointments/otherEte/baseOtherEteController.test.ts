import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { NotFound } from 'http-errors'
import BaseOtherEteController, { OtherEteStepViewDataParams } from './baseOtherEteController'
import { buildOtherEtePath, OtherEteFormPage } from '../../../pages/appointments/otherEte/pathMap'
import RecordActivityFormService, { RecordActivityForm } from '../../../services/forms/recordActivityFormService'
import OffenderService from '../../../services/offenderService'
import recordActivityFormFactory from '../../../testutils/factories/recordActivityFormFactory'
import caseDetailsSummaryFactory from '../../../testutils/factories/caseDetailsSummaryFactory'
import AppointmentUtils from '../../../utils/appointmentUtils'
import paths from '../../../paths'

const templatePath = 'appointments/test'
const stepViewData = { stepKey: 'step value' }

class TestOtherEteController extends BaseOtherEteController<unknown> {
  protected pageName: OtherEteFormPage = 'project'

  readonly validateMock = jest.fn().mockReturnValue({})

  protected nextPage(): OtherEteFormPage {
    return 'outcome'
  }

  protected backPage(form: RecordActivityForm): OtherEteFormPage | undefined {
    return form.provider ? 'region' : undefined
  }

  protected getTemplatePath(): string {
    return templatePath
  }

  protected async getContextData(): Promise<unknown> {
    return {}
  }

  protected async getStepViewData(_params: OtherEteStepViewDataParams<unknown>): Promise<object> {
    return stepViewData
  }

  protected validate(query: unknown, contextData: unknown) {
    return this.validateMock(query, contextData)
  }

  protected updateForm(form: RecordActivityForm): RecordActivityForm {
    return form
  }
}

describe('BaseOtherEteController', () => {
  const crn = 'X123456'
  const deliusEventNumber = '2'
  const formId = 'form-1'
  const username = 'user'

  const formService = createMock<RecordActivityFormService>()
  const offenderService = createMock<OffenderService>()

  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let controller: TestOtherEteController

  beforeEach(() => {
    jest.resetAllMocks()

    controller = new TestOtherEteController(formService, offenderService)
  })

  describe('show', () => {
    it('throws a NotFound error when no form id is present', async () => {
      const request = createMock<Request>({ query: {} })
      const response = createMock<Response>({ locals: { user: { username } } })

      const requestHandler = controller.show()

      await expect(requestHandler(request, response, next)).rejects.toThrow(NotFound)
    })

    it('renders the template with the common view data and step view data', async () => {
      const request = createMock<Request>({ query: { form: formId } })
      const response = createMock<Response>({ locals: { user: { username } } })
      const form = recordActivityFormFactory.build({ crn, deliusEventNumber, provider: undefined })
      const caseDetailsSummary = caseDetailsSummaryFactory.build()

      formService.getForm.mockResolvedValue(form)
      offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(formService.getForm).toHaveBeenCalledWith(formId, username)
      expect(offenderService.getOffenderSummary).toHaveBeenCalledWith({ username, crn })
      expect(response.locals.audit).toEqual({ subjectType: 'CRN', subjectId: crn })

      expect(response.render).toHaveBeenCalledWith(templatePath, {
        heading: AppointmentUtils.appointmentHeading(caseDetailsSummary.offender, form.projectTypeGroup),
        backLink: paths.people.createAppointment.chooseType({ crn, deliusEventNumber }),
        updatePath: buildOtherEtePath('project', formId),
        form: formId,
        ...stepViewData,
        errors: {},
      })
    })

    it('builds the back link from backPage when one is returned', async () => {
      const request = createMock<Request>({ query: { form: formId } })
      const response = createMock<Response>({ locals: { user: { username } } })
      const form = recordActivityFormFactory.build()
      const caseDetailsSummary = caseDetailsSummaryFactory.build()

      formService.getForm.mockResolvedValue(form)
      offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        templatePath,
        expect.objectContaining({
          backLink: buildOtherEtePath('region', formId),
        }),
      )
    })
  })

  describe('submitUpdate', () => {
    it('throws a NotFound error when no form id is present', async () => {
      const request = createMock<Request>({ query: {}, body: {} })
      const response = createMock<Response>({ locals: { user: { username } } })

      const requestHandler = controller.submitUpdate()

      await expect(requestHandler(request, response, next)).rejects.toThrow(NotFound)
    })

    it('re-renders the template with errors when validation fails', async () => {
      const request = createMock<Request>({ query: { form: formId }, body: {} })
      const response = createMock<Response>({ locals: { user: { username } } })
      const form = recordActivityFormFactory.build({ crn, deliusEventNumber, provider: undefined })
      const caseDetailsSummary = caseDetailsSummaryFactory.build()

      formService.getForm.mockResolvedValue(form)
      offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)
      controller.validateMock.mockReturnValue({ project: { text: 'Choose a project' } })

      const requestHandler = controller.submitUpdate()
      await requestHandler(request, response, next)

      expect(formService.saveForm).not.toHaveBeenCalled()
      expect(response.locals.audit).toEqual({ subjectType: 'CRN', subjectId: crn })
      expect(response.render).toHaveBeenCalledWith(templatePath, {
        heading: AppointmentUtils.appointmentHeading(caseDetailsSummary.offender, form.projectTypeGroup),
        backLink: paths.people.createAppointment.chooseType({ crn, deliusEventNumber }),
        updatePath: buildOtherEtePath('project', formId),
        form: formId,
        ...stepViewData,
        errors: { project: { text: 'Choose a project' } },
        errorSummary: [
          { text: 'Choose a project', href: '#project', attributes: { 'data-cy-error-project': 'Choose a project' } },
        ],
      })
    })

    it('saves the updated form and redirects to the next page when validation succeeds', async () => {
      const request = createMock<Request>({ query: { form: formId }, body: {} })
      const response = createMock<Response>({ locals: { user: { username } } })
      const form = recordActivityFormFactory.build()

      formService.getForm.mockResolvedValue(form)

      const requestHandler = controller.submitUpdate()
      await requestHandler(request, response, next)

      expect(formService.saveForm).toHaveBeenCalledWith(formId, username, form)
      expect(response.redirect).toHaveBeenCalledWith(buildOtherEtePath('outcome', formId))
    })
  })
})
