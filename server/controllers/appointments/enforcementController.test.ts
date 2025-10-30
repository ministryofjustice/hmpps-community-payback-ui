import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import EnforcementPage from '../../pages/appointments/enforcementPage'
import EnforcementController from './enforcementController'
import AppointmentService from '../../services/appointmentService'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import ReferenceDataService from '../../services/referenceDataService'
import generateErrorSummary from '../../utils/errorUtils'
import AppointmentFormService from '../../services/appointmentFormService'

jest.mock('../../pages/appointments/enforcementPage')
jest.mock('../../utils/errorUtils')

describe('EnforcementController', () => {
  const userName = 'user'
  const appointmentId = '1'
  const formId = '123'
  const request: DeepMocked<Request> = createMock<Request>({ params: { appointmentId, form: formId } })
  const response = createMock<Response>({ locals: { user: { name: userName } } })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const enforcementPageMock: jest.Mock = EnforcementPage as unknown as jest.Mock<EnforcementPage>
  const pageViewData = {
    someKey: 'some value',
  }

  let enforcementController: EnforcementController
  const appointmentService = createMock<AppointmentService>()
  const referenceDataService = createMock<ReferenceDataService>()
  const formService = createMock<AppointmentFormService>()
  const appointment = appointmentFactory.build()

  beforeEach(() => {
    jest.resetAllMocks()
    enforcementController = new EnforcementController(appointmentService, referenceDataService, formService)
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
      describe('When validation errors', () => {
        const generateErrorSummaryMock: jest.Mock = generateErrorSummary as jest.Mock
        it('should return view if errors', async () => {
          const errors = { someKey: { text: 'some error' } }
          enforcementPageMock.mockImplementationOnce(() => ({
            viewData: () => pageViewData,
            validate: () => {},
            hasErrors: true,
            validationErrors: errors,
          }))

          const errorSummary = {
            text: 'errors',
            href: '#link',
          }
          generateErrorSummaryMock.mockImplementation(() => errorSummary)

          const requestHandler = enforcementController.submit()
          await requestHandler(request, response, next)

          expect(response.render).toHaveBeenCalledWith(
            'appointments/update/enforcement',
            expect.objectContaining({
              errors,
              errorSummary,
              ...pageViewData,
            }),
          )
        })
      })
      describe('When no validation errors', () => {
        const nextPath = '/nextPath'
        const formToSave = { enforcement: { id: '1', name: 'some action', code: '1' } }

        beforeEach(() => {
          appointmentService.getAppointment.mockResolvedValue(appointment)

          enforcementPageMock.mockImplementationOnce(() => {
            return {
              formId,
              validate: () => {},
              hasError: false,
              next: () => nextPath,
              form: () => formToSave,
            }
          })
        })

        it('should redirect to the next page', async () => {
          const requestHandler = enforcementController.submit()
          await requestHandler(request, response, next)

          expect(response.redirect).toHaveBeenCalledWith(nextPath)
        })

        it('should handle form progress', async () => {
          const existingForm = { key: { id: formId, type: 'Some_type' }, data: { startTime: '09:00' } }

          formService.getForm.mockResolvedValue(existingForm)

          const requestHandler = enforcementController.submit()
          await requestHandler(request, response, next)

          expect(formService.getForm).toHaveBeenCalledWith(formId, userName)
          expect(formService.saveForm).toHaveBeenCalledWith(formId, userName, formToSave)
        })
      })
    })
  })
})
