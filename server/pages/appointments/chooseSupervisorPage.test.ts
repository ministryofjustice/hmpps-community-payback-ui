import { ProviderTeamSummaryDto, SupervisorSummaryDto } from '../../@types/shared'
import GovUkSelectInput from '../../forms/GovUkSelectInput'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import supervisorSummaryFactory from '../../testutils/factories/supervisorSummaryFactory'
import CheckAppointmentDetailsPage from './checkAppointmentDetailsPage'
import * as Utils from '../../utils/utils'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import { AppointmentOutcomeForm } from '../../services/forms/appointmentFormService'
import ChooseSupervisorPage, { AppointmentDetailsQuery } from './chooseSupervisorPage'
import providerTeamSummaryFactory from '../../testutils/factories/providerTeamSummaryFactory'
import Offender from '../../models/offender'

jest.mock('../../models/offender')

describe('ChooseSupervisorPage', () => {
  const pathWithQuery = '/path?'
  beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(Utils, 'pathWithQuery').mockReturnValue(pathWithQuery)
  })

  describe('viewData', () => {
    let page: ChooseSupervisorPage
    let supervisors: SupervisorSummaryDto[]
    let form: AppointmentOutcomeForm
    let teams: Array<ProviderTeamSummaryDto>
    const updatePath = '/update'

    beforeEach(() => {
      page = new ChooseSupervisorPage()
      supervisors = supervisorSummaryFactory.buildList(2)
      form = appointmentOutcomeFormFactory.build()
      teams = providerTeamSummaryFactory.buildList(3)
      jest.spyOn(paths.appointments, 'update').mockReturnValue(updatePath)
    })

    it('should return an object containing supervisorItems', async () => {
      form = appointmentOutcomeFormFactory.build({ supervisor: supervisorSummaryFactory.build({ code: undefined }) })
      const supervisorItems = [
        { text: 'Gwen', value: '1 ' },
        { text: 'Harry', value: '2' },
      ]
      jest.spyOn(GovUkSelectInput, 'getOptions').mockReturnValue(supervisorItems)

      const query = { team: '1234' } as AppointmentDetailsQuery
      page = new ChooseSupervisorPage()

      const result = page.viewData(teams, supervisors, form, query)

      expect(GovUkSelectInput.getOptions).toHaveBeenLastCalledWith(
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

      const query = { team: '1234' } as AppointmentDetailsQuery
      page = new ChooseSupervisorPage()

      const result = page.viewData(teams, supervisors, form, query)

      expect(GovUkSelectInput.getOptions).toHaveBeenLastCalledWith(
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

      const query = { team: '1234', supervisor } as AppointmentDetailsQuery
      page = new ChooseSupervisorPage()
      const result = page.viewData(teams, supervisors, appointmentOutcomeFormFactory.build(), query)

      expect(GovUkSelectInput.getOptions).toHaveBeenCalledWith(
        supervisors,
        'fullName',
        'code',
        'Choose supervisor',
        supervisor,
      )

      expect(result.supervisorItems).toBe(supervisorItems)
    })

    it('should return expected viewData when appointmentOrSession is a session', () => {
      const offenderMock: jest.Mock = Offender as unknown as jest.Mock<Offender>
      offenderMock.mockImplementation(() => ({
        name: 'Sam Smith',
        crn: 'CRN123',
        isLimited: false,
        details: {
          description: 'description',
        },
      }))

      const teamItems = [
        { text: 'Choose team', value: '' },
        { text: 'Team 1', value: 'T1' },
      ]
      const supervisorItems = [
        { text: 'Choose supervisor', value: '' },
        { text: 'Supervisor 1', value: 'S1' },
      ]

      jest.spyOn(paths.sessions, 'update')
      jest.spyOn(GovUkSelectInput, 'getOptions').mockReturnValueOnce(teamItems).mockReturnValueOnce(supervisorItems)

      const query = { team: 'T1' } as AppointmentDetailsQuery
      page = new ChooseSupervisorPage()

      const result = page.viewData(teams, supervisors, form, query)

      expect(result).toEqual(
        expect.objectContaining({
          teamItems,
          supervisorItems,
        }),
      )
    })
  })

  describe('paths', () => {
    it('returns backLink and updatePath for an appointment', () => {
      const page = new ChooseSupervisorPage()
      const appointment = appointmentFactory.build()
      const formId = 'form-123'

      const result = page.paths({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
        date: appointment.date,
        formId,
        form: appointmentOutcomeFormFactory.build(),
      })

      expect(result).toHaveProperty('backLink')
      expect(result).toHaveProperty('updatePath')
    })
  })

  describe('validate', () => {
    it('has no errors if team has value and supervisor has value', () => {
      const query = { team: 'X123', supervisor: 'Jane' }
      const page = new ChooseSupervisorPage()
      const { hasErrors, errors } = page.validationErrors(query)

      expect(hasErrors).toBe(false)
      expect(errors).toStrictEqual({})
    })

    it.each(['', undefined])('has errors if team is empty', (team: string | undefined) => {
      const query = { team, supervisor: 'Jane' }
      const page = new ChooseSupervisorPage()
      const { hasErrors, errors } = page.validationErrors(query)

      expect(hasErrors).toBe(true)
      expect(errors).toStrictEqual({ team: { text: 'Select a supervising team' } })
    })

    it.each(['', undefined])('has errors if supervisor is empty', (supervisor: string | undefined) => {
      const query = { team: 'X123', supervisor }
      const page = new ChooseSupervisorPage()
      const { hasErrors, errors } = page.validationErrors(query)

      expect(hasErrors).toBe(true)
      expect(errors).toStrictEqual({ supervisor: { text: 'Select a supervisor' } })
    })
  })

  describe('next', () => {
    it('should return attendance outcome link with given appointmentId', () => {
      const appointmentId = '1'
      const projectCode = '2'
      const path = '/path'
      const page = new ChooseSupervisorPage()

      jest.spyOn(paths.appointments, 'update').mockReturnValue(path)

      expect(page.next({ projectCode, appointmentId, form: appointmentOutcomeFormFactory.build() })).toBe(pathWithQuery)
      expect(paths.appointments.update).toHaveBeenCalledWith({ projectCode, appointmentId, page: 'choose-project' })
    })
  })

  describe('form', () => {
    it('returns form without supervisor when no supervisor is selected', () => {
      const form = appointmentOutcomeFormFactory.build()
      const supervisors = supervisorSummaryFactory.buildList(2)
      const page = new CheckAppointmentDetailsPage()

      const result = page.updateForm(form, {}, { supervisors })
      expect(result).toEqual(form)
    })
  })
})
