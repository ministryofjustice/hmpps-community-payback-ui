import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import EnforcementPage from '../../pages/appointments/enforcementPage'
import EnforcementController from './enforcementController'
import AppointmentService from '../../services/appointmentService'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import ReferenceDataService from '../../services/referenceDataService'

jest.mock('../../pages/appointments/enforcementPage')

describe('EnforcementController', () => {
  const appointmentId = '1'
  const formId = '123'
  const request: DeepMocked<Request> = createMock<Request>({ params: { appointmentId, form: formId } })
  const response = createMock<Response>()
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const enforcementPageMock: jest.Mock = EnforcementPage as unknown as jest.Mock<EnforcementPage>
  const pageViewData = {
    someKey: 'some value',
  }

  let enforcementController: EnforcementController
  const appointmentService = createMock<AppointmentService>()
  const referenceDataService = createMock<ReferenceDataService>()
  const appointment = appointmentFactory.build()

  beforeEach(() => {
    jest.resetAllMocks()
    enforcementController = new EnforcementController(appointmentService, referenceDataService)
    appointmentService.getAppointment.mockResolvedValue(appointment)
  })

  describe('show', () => {
    it('should render the template with view data', async () => {
      enforcementPageMock.mockImplementationOnce(() => {
        return {
          viewData: () => pageViewData,
        }
      })

      const requestHandler = enforcementController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('appointments/update/enforcement', pageViewData)
    })

    describe('Submit', () => {
      describe('When no validation errors', () => {
        const nextPath = '/nextPath'

        beforeEach(() => {
          appointmentService.getAppointment.mockResolvedValue(appointment)

          enforcementPageMock.mockImplementationOnce(() => {
            return {
              formId,
              validate: () => {},
              hasError: false,
              next: () => nextPath,
            }
          })
        })

        it('should redirect to the next page', async () => {
          const requestHandler = enforcementController.submit()
          await requestHandler(request, response, next)

          expect(response.redirect).toHaveBeenCalledWith(nextPath)
        })
      })
    })
  })
})
