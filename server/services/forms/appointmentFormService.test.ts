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
        projectTypeGroup: project.projectType.group,
        provider: { code: project.providerCode, name: project.providerName },
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
      const date = '2026-01-01'

      const result = await appointmentFormService.createBulkForm(project, date, user, query)

      const expectedForm = {
        originalSearch: query,
        projectTeam: {
          code: project.teamCode,
          name: project.teamName,
        },
        project: { code: project.projectCode, name: project.projectName },
        date,
        projectTypeGroup: project.projectType.group,
        provider: { code: project.providerCode, name: project.providerName },
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
      const crn = 'X123456'
      const deliusEventNumber = '1'
      const project = projectFactory.build()
      const date = '2026-01-01'
      const originalParams = { projectCode: 'proj', date: '2026-01-01' }

      const result = await appointmentFormService.createNewAppointmentForm({
        username,
        query,
        crn,
        deliusEventNumber,
        project,
        date,
        originalParams,
        projectTypeGroup: 'GROUP',
      })

      const expectedForm = {
        originalSearch: query,
        crn,
        deliusEventNumber,
        projectTeam: { code: project.teamCode, name: project.teamName },
        project: { code: project.projectCode, name: project.projectName },
        date,
        projectTypeGroup: 'GROUP',
        provider: { code: project.providerCode, name: project.providerName },
        originalParams,
        options: {
          showRegionQuestion: false,
        },
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

    it('should return form with undefined date if date is not provided', async () => {
      const result = await appointmentFormService.createNewAppointmentForm({
        username: 'some-user',
        query: { provider: 'provider-code', team: 'team-code' },
        crn: 'X123456',
        deliusEventNumber: '1',
        project: projectFactory.build(),
        originalParams: { projectCode: 'Y' },
        projectTypeGroup: 'GROUP',
      })

      expect(result.data.date).toBeUndefined()
    })

    it('should return form with showRegionQuestion true if project is not provided', async () => {
      const result = await appointmentFormService.createNewAppointmentForm({
        username: 'some-user',
        query: { provider: 'provider-code', team: 'team-code' },
        crn: 'X123456',
        deliusEventNumber: '1',
        originalParams: { projectCode: 'Y' },
        projectTypeGroup: 'GROUP',
      })
      expect(result.data.options.showRegionQuestion).toBe(true)
    })

    it('should return undefined projectData if project is not provided', async () => {
      const result = await appointmentFormService.createNewAppointmentForm({
        username: 'some-user',
        query: { provider: 'provider-code', team: 'team-code' },
        crn: 'X123456',
        deliusEventNumber: '1',
        originalParams: { projectCode: 'Y' },
        projectTypeGroup: 'GROUP',
      })
      expect(result.data.project).toBeUndefined()
      expect(result.data.projectTeam).toBeUndefined()
      expect(result.data.provider).toBeUndefined()
    })

    it('should save both the default and provided option if project is not provided and one option is passed', async () => {
      const result = await appointmentFormService.createNewAppointmentForm({
        username: 'some-user',
        query: { provider: 'provider-code', team: 'team-code' },
        crn: 'X123456',
        deliusEventNumber: '1',
        originalParams: { projectCode: 'Y' },
        projectTypeGroup: 'GROUP',
        options: { showPersonQuestions: true },
      })

      expect(result.data.options).toEqual({
        showRegionQuestion: true,
        showPersonQuestions: true,
      })
    })

    it('should override the default showRegionQuestion option when project is provided and an argument is passed', async () => {
      const project = projectFactory.build()

      const result = await appointmentFormService.createNewAppointmentForm({
        username: 'some-user',
        query: { provider: 'provider-code', team: 'team-code' },
        crn: 'X123456',
        deliusEventNumber: '1',
        project,
        originalParams: { projectCode: 'Y' },
        projectTypeGroup: 'GROUP',
        options: { showRegionQuestion: true },
      })

      expect(result.data.options).toEqual({
        showRegionQuestion: true,
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
