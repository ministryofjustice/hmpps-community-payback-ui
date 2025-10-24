import { AppointmentOutcomeForm } from '../@types/user-defined'
import FormClient from '../data/formClient'
import AppointmentFormService from './appointmentFormService'

const newId = 'a-random-string-uuid-'

jest.mock('../data/formClient')
jest.mock('crypto', () => {
  return {
    randomUUID: () => newId,
  }
})

describe('AppointmentFormService', () => {
  const type = 'APPOINTMENT_UPDATE_ADMIN'
  const formClient = new FormClient(null) as jest.Mocked<FormClient>
  let appointmentFormService: AppointmentFormService

  beforeEach(() => {
    jest.resetAllMocks()
    appointmentFormService = new AppointmentFormService(formClient)
  })

  describe('getForm', () => {
    it('should return empty form with blank id if id is undefined', async () => {
      const result = await appointmentFormService.getForm(undefined, 'some-name')

      expect(formClient.find).not.toHaveBeenCalled()
      expect(result).toEqual({
        key: {
          id: newId,
          type,
        },
        data: {},
      })
    })

    it('should throw error if form with id is not found', async () => {
      const formResult: AppointmentOutcomeForm = {
        supervisorOfficerCode: 'supervisor',
      }

      formClient.find.mockResolvedValue(formResult)

      const result = await appointmentFormService.getForm('1', 'some-name')

      expect(formClient.find).toHaveBeenCalledTimes(1)
      expect(result).toEqual({
        key: {
          id: '1',
          type,
        },
        data: formResult,
      })
    })

    it('should fetch form if id supplied', async () => {
      const formResult: AppointmentOutcomeForm = {
        supervisorOfficerCode: 'supervisor',
      }

      formClient.find.mockResolvedValue(formResult)

      const result = await appointmentFormService.getForm('1', 'some-name')

      expect(formClient.find).toHaveBeenCalledTimes(1)
      expect(result).toEqual({
        key: {
          id: '1',
          type,
        },
        data: formResult,
      })
    })
  })

  describe('saveForm', () => {
    it('should save form with provided id and body', async () => {
      const form: AppointmentOutcomeForm = {
        supervisorOfficerCode: 'supervisor',
      }

      await appointmentFormService.saveForm('1', 'some-name', form)
      expect(formClient.save).toHaveBeenCalledTimes(1)
    })
  })
})
