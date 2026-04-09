import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import UpdateTravelTimePage from '../../pages/appointments/updateTravelTimePage'
import AdjustTravelTimeController from './adjustTravelTimeController'
import paths from '../../paths'
import AppointmentService from '../../services/appointmentService'
import Offender from '../../models/offender'
import ProviderService from '../../services/providerService'

describe('AdjustTravelTimeController', () => {
  const templatePath = 'appointments/update/travelTime/update'
  const page = createMock<UpdateTravelTimePage>()
  const appointmentService = createMock<AppointmentService>()
  const providerService = createMock<ProviderService>()
  const response = createMock<Response>()
  const next = createMock<NextFunction>({})
  let controller: AdjustTravelTimeController
  const viewData = {
    offender: { crn: '1234', name: 'Sam Smith', isLimited: false } as Offender,
    backLink: '/back',
    updatePath: '/update',
  }

  beforeEach(() => {
    jest.resetAllMocks()
    controller = new AdjustTravelTimeController(page, providerService, appointmentService)
    page.viewData.mockReturnValue(viewData)
  })

  describe('update', () => {
    it('should render the page', async () => {
      const appointmentId = '1'
      const projectCode = '2'
      const request = createMock<Request>({ params: { appointmentId, projectCode } })

      const requestHandler = controller.update()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, viewData)
    })
  })

  describe('submitUpdate', () => {
    describe('no errors', () => {
      it('redirects to the next page', async () => {
        page.validationErrors.mockReturnValue({ hasErrors: false, errors: {}, errorSummary: [] })

        const request = createMock<Request>({ params: { id: '1' }, query: {} })

        const requestHandler = controller.submitUpdate()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(paths.appointments.travelTime.index({}))
      })
    })
    describe('has errors', () => {
      it('rerenders page if validation errors', async () => {
        const errorSummary = [{ text: 'Error 1', href: '#1', attributes: { 'some-attr': 'value' } }]
        const errors = { hours: { text: 'Error' } }
        page.validationErrors.mockReturnValue({ hasErrors: true, errors, errorSummary })

        const appointmentId = '1'
        const projectCode = '2'
        const body = { hours: 't', minutes: 'r' }
        const request = createMock<Request>({ params: { appointmentId, projectCode }, body })

        const requestHandler = controller.submitUpdate()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(templatePath, {
          ...viewData,
          errors,
          errorSummary,
          time: body,
        })

        expect(page.validationErrors).toHaveBeenCalledWith(body)
      })
    })
  })
})
