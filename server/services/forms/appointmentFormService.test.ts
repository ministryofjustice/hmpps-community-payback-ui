import FormClient from '../../data/formClient'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import projectFactory from '../../testutils/factories/projectFactory'
import AppointmentFormService, { APPOINTMENT_UPDATE_FORM_TYPE } from './appointmentFormService'

const newId = 'a-random-string-uuid-'

jest.mock('../../data/formClient')
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
    it('should fetch form', async () => {
      const formResult = appointmentOutcomeFormFactory.build()

      formClient.find.mockResolvedValue(formResult)

      const result = await appointmentFormService.getForm('1', 'some-name')

      expect(formClient.find).toHaveBeenCalledTimes(1)
      expect(result).toEqual(formResult)
    })
  })

  describe('saveForm', () => {
    it('should save form with provided id and body', async () => {
      const form = appointmentOutcomeFormFactory.build()

      await appointmentFormService.saveForm('1', 'some-name', form)
      expect(formClient.save).toHaveBeenCalledTimes(1)
    })
  })

  describe('createForm', () => {
    it('should return form with new id and appointment data', async () => {
      const user = 'some-user'
      const search = { provider: 'provider' }
      const appointment = appointmentFactory.build()
      const project = projectFactory.build()
      const result = await appointmentFormService.createUpdateAppointmentForm(appointment, project, user, search)

      const expectedForm = {
        deliusVersion: appointment.version,
        attendanceData: appointment.attendanceData,
        contactOutcome: {
          code: appointment.contactOutcomeCode,
        },
        endTime: appointment.endTime,
        startTime: appointment.startTime,
        supervisor: {
          code: appointment.supervisorOfficerCode,
        },
        sensitive: appointment.sensitive,
        originalSearch: search,
        supervisingTeam: {
          code: appointment.supervisingTeamCode,
        },
        project: { code: project.projectCode, name: project.projectName },
        projectTeam: {
          code: project.teamCode,
          name: project.teamName,
        },
        date: appointment.date,
        alertActive: appointment.alertActive,
      }

      expect(formClient.save).toHaveBeenCalledWith(
        { id: newId, type: APPOINTMENT_UPDATE_FORM_TYPE },
        user,
        expectedForm,
      )
      expect(result).toEqual({
        key: { id: newId, type: APPOINTMENT_UPDATE_FORM_TYPE },
        data: expectedForm,
      })
    })
  })

  describe('createBulkForm', () => {
    it('should return form with new id and originalSearch data', async () => {
      const user = 'some-user'
      const query = { provider: 'provider-code', team: 'team-code' }
      const project = projectFactory.build()

      const result = await appointmentFormService.createBulkForm(project, user, query)

      const expectedForm = {
        originalSearch: query,
        projectTeam: {
          code: project.teamCode,
          name: project.teamName,
        },
        project: { code: project.projectCode, name: project.projectName },
      }

      expect(formClient.save).toHaveBeenCalledWith(
        { id: newId, type: APPOINTMENT_UPDATE_FORM_TYPE },
        user,
        expectedForm,
      )
      expect(result).toEqual({
        key: { id: newId, type: APPOINTMENT_UPDATE_FORM_TYPE },
        data: expectedForm,
      })
    })
  })

  describe('createNewAppointmentForm', () => {
    it('should return form with new id, originalSearch data and crn', async () => {
      const username = 'some-user'
      const query = { provider: 'provider-code', team: 'team-code' }
      const project = projectFactory.build()
      const data = {
        crn: 'X123456',
        date: '2026-9-01',
        deliusEventNumber: '1',
      }

      const result = await appointmentFormService.createNewAppointmentForm({ username, query, project, ...data })

      const expectedForm = {
        originalSearch: query,
        project: { name: project.projectName, code: project.projectCode },
        projectTeam: { name: project.teamName, code: project.teamCode },
        ...data,
      }

      expect(formClient.save).toHaveBeenCalledWith(
        { id: newId, type: APPOINTMENT_UPDATE_FORM_TYPE },
        username,
        expectedForm,
      )
      expect(result).toEqual({
        key: { id: newId, type: APPOINTMENT_UPDATE_FORM_TYPE },
        data: expectedForm,
      })
    })
  })

  describe('getFormKey', () => {
    it('should return a form key object given an ID', () => {
      const result = appointmentFormService.getFormKey('some-id')
      expect(result).toEqual({
        id: 'some-id',
        type,
      })
    })
  })
})
