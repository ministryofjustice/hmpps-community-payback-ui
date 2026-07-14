import { AppointmentDto, ProviderTeamSummariesDto, SupervisorSummaryDto } from '../../@types/shared'
import GovUkSelectInput from '../../forms/GovUkSelectInput'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import sessionFactory from '../../testutils/factories/sessionFactory'
import supervisorSummaryFactory from '../../testutils/factories/supervisorSummaryFactory'
import * as Utils from '../../utils/utils'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import { AppointmentOutcomeForm } from '../../@types/user-defined'
import ChooseSupervisorPage from './chooseSupervisorPage'
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
    let appointment: AppointmentDto
    let supervisors: SupervisorSummaryDto[]
    let form: AppointmentOutcomeForm
    let teams: ProviderTeamSummariesDto
    const updatePath = '/update'

    beforeEach(() => {
      appointment = appointmentFactory.build()
      page = new ChooseSupervisorPage()
      supervisors = supervisorSummaryFactory.buildList(2)
      form = appointmentOutcomeFormFactory.build()
      teams = { providers: providerTeamSummaryFactory.buildList(3) }
      jest.spyOn(paths.appointments, 'update').mockReturnValue(updatePath)
    })

    it('should return an object containing an update link for the form', async () => {
      const result = page.viewData(appointment, teams, supervisors, form)
      expect(paths.appointments.update).toHaveBeenCalledWith({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
        page: 'choose-supervisor',
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

      page = new ChooseSupervisorPage()

      const result = page.viewData(appointment, teams, supervisors, form, undefined, { team: '1234' })

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

      page = new ChooseSupervisorPage()

      const result = page.viewData(appointmentFactory.build(), teams, supervisors, form, undefined, { team: '1234' })

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

      page = new ChooseSupervisorPage()
      const result = page.viewData(appointment, teams, supervisors, appointmentOutcomeFormFactory.build(), '1', {
        supervisor,
        team: teams.providers[0].code,
      })

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

      const session = sessionFactory.build()
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

      page = new ChooseSupervisorPage()

      const result = page.viewData(session, teams, supervisors, form, undefined, { team: 'T1' })

      expect(paths.sessions.update).toHaveBeenCalledWith({
        projectCode: session.projectCode,
        date: session.date,
        page: 'choose-supervisor',
      })
      expect(paths.sessions.update).toHaveBeenCalledWith({
        projectCode: session.projectCode,
        date: session.date,
        page: 'select-people',
      })

      expect(result).toEqual(
        expect.objectContaining({
          backLink: pathWithQuery,
          updatePath: pathWithQuery,
          teamItems,
          supervisorItems,
        }),
      )
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

      expect(page.next({ projectCode, appointmentId })).toBe(pathWithQuery)
      expect(paths.appointments.update).toHaveBeenCalledWith({ projectCode, appointmentId, page: 'choose-project' })
    })
  })

  describe('form', () => {
    it('returns data from query given object with existing data', () => {
      const form = appointmentOutcomeFormFactory.build()
      const supervisors = supervisorSummaryFactory.buildList(2)
      const [selectedSupervisor] = supervisors

      const teams = providerTeamSummaryFactory.buildList(2)
      const [selectedTeam] = teams
      const page = new ChooseSupervisorPage()

      const result = page.updateForm(form, { providers: teams }, supervisors, {
        supervisor: selectedSupervisor.code,
        team: selectedTeam.code,
      })
      expect(result).toEqual({ ...form, supervisor: selectedSupervisor, supervisingTeam: selectedTeam })
    })
  })
})
