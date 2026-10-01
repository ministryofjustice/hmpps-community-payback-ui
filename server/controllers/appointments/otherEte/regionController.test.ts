import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import RegionController from './regionController'
import AppointmentFormService from '../../../services/forms/appointmentFormService'
import OffenderService from '../../../services/offenderService'
import ProviderService from '../../../services/providerService'
import createAppointmentFormFactory from '../../../testutils/factories/createAppointmentFormFactory'
import caseDetailsSummaryFactory from '../../../testutils/factories/caseDetailsSummaryFactory'
import providerSummaryFactory from '../../../testutils/factories/providerSummaryFactory'
import RegionQuestion from '../../../utils/components/regionQuestion'
import AppointmentUtils from '../../../utils/appointmentUtils'
import { buildOtherEtePath } from '../../../pages/appointments/otherEte/pathMap'

describe('RegionController', () => {
  const crn = 'X123456'
  const deliusEventNumber = '2'
  const formId = 'form-1'
  const username = 'user'

  const formService = createMock<AppointmentFormService>()
  const offenderService = createMock<OffenderService>()
  const providerService = createMock<ProviderService>()

  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const providers = providerSummaryFactory.buildList(2)
  const providerItems = [{ text: providers[0].name, value: providers[0].code, selected: true }]
  const caseDetailsSummary = caseDetailsSummaryFactory.build()
  const heading = { title: 'title', caption: 'caption' }

  let controller: RegionController

  beforeEach(() => {
    jest.resetAllMocks()

    controller = new RegionController(formService, offenderService, providerService)

    providerService.getProviders.mockResolvedValue(providers)
    offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)
    jest.spyOn(RegionQuestion, 'viewData').mockReturnValue({ providerItems })
    jest.spyOn(AppointmentUtils, 'appointmentHeading').mockReturnValue(heading)
  })

  describe('show', () => {
    it('renders the choose-region template with provider items selected from the form', async () => {
      const form = createAppointmentFormFactory.build({ provider: providers[0] })
      formService.getForm.mockResolvedValue(form)

      const request = createMock<Request>({ params: { crn, deliusEventNumber }, query: { form: formId }, body: {} })
      const response = createMock<Response>({ locals: { user: { username } } })

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(providerService.getProviders).toHaveBeenCalledWith(username)
      expect(RegionQuestion.viewData).toHaveBeenCalledWith(form, { providers }, {})

      expect(response.render).toHaveBeenCalledWith('appointments/update/chooseRegion', {
        heading,
        backLink: expect.any(String),
        updatePath: buildOtherEtePath('region', formId),
        form: formId,
        providerItems,
        errors: {},
      })
    })
  })

  describe('submitUpdate', () => {
    it('saves the selected provider and redirects to the project page', async () => {
      const form = createAppointmentFormFactory.build({ provider: undefined })
      formService.getForm.mockResolvedValue(form)

      const request = createMock<Request>({
        params: { crn, deliusEventNumber },
        query: { form: formId },
        body: { provider: providers[0].code },
      })
      const response = createMock<Response>({ locals: { user: { username } } })

      const requestHandler = controller.submitUpdate()
      await requestHandler(request, response, next)

      expect(formService.saveForm).toHaveBeenCalledWith(
        formId,
        username,
        expect.objectContaining({ provider: providers[0] }),
      )
      expect(response.redirect).toHaveBeenCalledWith(buildOtherEtePath('project', formId))
    })

    it('re-renders the template with errors when no provider is selected', async () => {
      const form = createAppointmentFormFactory.build({ provider: undefined })
      formService.getForm.mockResolvedValue(form)

      const request = createMock<Request>({
        params: { crn, deliusEventNumber },
        query: { form: formId },
        body: {},
      })
      const response = createMock<Response>({ locals: { user: { username } } })

      const requestHandler = controller.submitUpdate()
      await requestHandler(request, response, next)

      expect(formService.saveForm).not.toHaveBeenCalled()
      expect(response.render).toHaveBeenCalledWith(
        'appointments/update/chooseRegion',
        expect.objectContaining({
          errors: { provider: { text: 'Choose a region' } },
        }),
      )
    })
  })
})
