import { AppointmentDto, SupervisorSummaryDto } from '../../@types/shared'
import GovUkSelectInput from '../../forms/GovUkSelectInput'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import supervisorSummaryFactory from '../../testutils/factories/supervisorSummaryFactory'
import CheckAppointmentDetailsPage from './checkAppointmentDetailsPage'
import * as Utils from '../../utils/utils'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import { AppointmentOutcomeForm } from '../../@types/user-defined'
import projectFactory from '../../testutils/factories/projectFactory'
import ChooseSupervisorPage from './chooseSupervisorPage'

jest.mock('../../models/offender')

describe('ChooseSupervisorPage', () => {
  const pathWithQuery = '/path?'
  beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(Utils, 'pathWithQuery').mockReturnValue(pathWithQuery)
  })

  describe('viewData', () => {
    let page: ChooseSupervisorPage
    let appointment: AppointmentDto
    let supervisors: SupervisorSummaryDto[]
    let form: AppointmentOutcomeForm
    const updatePath = '/update'

    beforeEach(() => {
      appointment = appointmentFactory.build()
      page = new ChooseSupervisorPage({}, appointment)
      supervisors = supervisorSummaryFactory.buildList(2)
      form = appointmentOutcomeFormFactory.build()
      jest.spyOn(paths.appointments, 'chooseSupervisor').mockReturnValue(updatePath)
    })

    it('should return an object containing an update link for the form', async () => {
      const result = page.viewData(appointment, supervisors, form)
      expect(paths.appointments.chooseSupervisor).toHaveBeenCalledWith({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
      })
      expect(result.updatePath).toBe(pathWithQuery)
    })

    it('should return an object containing supervisorItems', async () => {
      form = appointmentOutcomeFormFactory.build({ supervisor: supervisorSummaryFactory.build({ code: undefined }) })
      const supervisorItems = [
        { text: 'Gwen', value: '1 ' },
        { text: 'Harry', value: '2' },
      ]
      jest.spyOn(GovUkSelectInput, 'getOptions').mockReturnValue(supervisorItems)

      const result = page.viewData(appointment, supervisors, form)

      expect(GovUkSelectInput.getOptions).toHaveBeenCalledWith(
        supervisors,
        'fullName',
        'code',
        'Choose supervisor',
        undefined,
      )

      expect(result.supervisorItems).toBe(supervisorItems)
    })

    it('should pass the supervisor to the select input options formatter if any value', async () => {
      const code = 'supervisor'
      form = appointmentOutcomeFormFactory.build({ supervisor: { code } })
      const supervisorItems = [
        { text: 'Gwen', value: '1 ' },
        { text: 'Harry', value: '2' },
      ]
      jest.spyOn(GovUkSelectInput, 'getOptions').mockReturnValue(supervisorItems)

      const result = page.viewData(appointmentFactory.build(), supervisors, form)

      expect(GovUkSelectInput.getOptions).toHaveBeenCalledWith(
        supervisors,
        'fullName',
        'code',
        'Choose supervisor',
        code,
      )

      expect(result.supervisorItems).toBe(supervisorItems)
    })

    it('should pass the query value to the select input options if the page has errors', () => {
      const supervisor = ''
      const supervisorItems = [
        { text: 'Gwen', value: '' },
        { text: 'Harry', value: '2' },
      ]
      jest.spyOn(GovUkSelectInput, 'getOptions').mockReturnValue(supervisorItems)

      page = new ChooseSupervisorPage({ supervisor }, appointmentFactory.build())
      page.validate()

      const result = page.viewData(appointment, supervisors, appointmentOutcomeFormFactory.build())

      expect(GovUkSelectInput.getOptions).toHaveBeenCalledWith(
        supervisors,
        'fullName',
        'code',
        'Choose supervisor',
        supervisor,
      )

      expect(result.supervisorItems).toBe(supervisorItems)
    })
  })

  describe('validate', () => {
    it('has no errors if supervisor has value', () => {
      const query = { supervisor: 'Jane' }
      const page = new ChooseSupervisorPage(query, appointmentFactory.build())
      page.validate()

      expect(page.hasErrors).toBe(false)
      expect(page.validationErrors).toStrictEqual({})
    })

    it.each(['', undefined])('has errors if supervisor is empty', (supervisor: string | undefined) => {
      const query = { supervisor }
      const page = new ChooseSupervisorPage(query, appointmentFactory.build())
      page.validate()

      expect(page.hasErrors).toBe(true)
      expect(page.validationErrors).toStrictEqual({ supervisor: { text: 'Select a supervisor' } })
    })
  })

  describe('next', () => {
    it('should return attendance outcome link with given appointmentId', () => {
      const appointmentId = '1'
      const projectCode = '2'
      const path = '/path'
      const query = { supervisor: 'Jane' }
      const page = new ChooseSupervisorPage(query, appointmentFactory.build())

      jest.spyOn(paths.appointments, 'attendanceOutcome').mockReturnValue(path)

      expect(page.next(projectCode, appointmentId)).toBe(pathWithQuery)
      expect(paths.appointments.attendanceOutcome).toHaveBeenCalledWith({ projectCode, appointmentId })
    })
  })

  describe('form', () => {
    it('returns data from query given object with existing data', () => {
      const form = appointmentOutcomeFormFactory.build()
      const supervisors = supervisorSummaryFactory.buildList(2)
      const [selectedSupervisor] = supervisors
      const page = new CheckAppointmentDetailsPage({ supervisor: selectedSupervisor.code }, projectFactory.build())

      const result = page.updateForm(form, supervisors)
      expect(result).toEqual({ ...form, supervisor: selectedSupervisor })
    })
  })
})
