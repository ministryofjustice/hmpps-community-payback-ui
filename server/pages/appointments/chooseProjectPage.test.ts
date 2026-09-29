import appointmentFactory from '../../testutils/factories/appointmentFactory'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import paths from '../../paths'
import { pathWithQuery } from '../../utils/utils'
import SelectProjectComponent from '../../utils/components/projectQuestions'
import * as ErrorUtils from '../../utils/errorUtils'
import ChooseProjectPage from './chooseProjectPage'

describe('ChooseProjectPage', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('commonViewData', () => {
    it('returns backLink and updatePath for the expected pages', () => {
      const appointment = appointmentFactory.build({ projectCode: 'P1', id: 123 })
      const form = appointmentOutcomeFormFactory.build()
      const page = new ChooseProjectPage()

      const result = page.commonViewData({
        pathData: {
          appointmentId: appointment.id.toString(),
          projectCode: appointment.projectCode,
          date: '2026-01-20',
        },
        appointmentOrSession: { appointment },
        form,
        formId: 'F1',
      })

      expect(result.backLink).toBe(
        pathWithQuery(
          paths.appointments.update({
            projectCode: appointment.projectCode,
            appointmentId: appointment.id.toString(),
            page: 'choose-supervisor',
          }),
          { form: 'F1' },
        ),
      )
      expect(result.updatePath).toBe(
        pathWithQuery(
          paths.appointments.update({
            projectCode: appointment.projectCode,
            appointmentId: appointment.id.toString(),
            page: 'choose-project',
          }),
          { form: 'F1' },
        ),
      )
    })
  })

  describe('next', () => {
    it('returns attendance outcome path for an appointment', () => {
      const page = new ChooseProjectPage()
      const projectCode = 'P1'
      const appointmentId = '123'

      const result = page.next({ pathData: { projectCode, appointmentId }, formId: 'F1' })

      expect(result).toBe(
        pathWithQuery(
          paths.appointments.update({
            projectCode,
            appointmentId,
            page: 'attendance-outcome',
          }),
          { form: 'F1' },
        ),
      )
    })
  })

  describe('getValidationErrors', () => {
    it('returns hasErrors true when validation errors exist', () => {
      const errors = {
        project: { text: 'Select a project' },
      }
      const errorSummary = [{ text: 'Select a project', href: '#project', attributes: { prop: '' } }]

      jest.spyOn(SelectProjectComponent, 'getValidationErrors').mockReturnValue(errors)
      jest.spyOn(ErrorUtils, 'generateErrorSummary').mockReturnValue(errorSummary)

      const page = new ChooseProjectPage()
      const result = page.validationErrors({})

      expect(result).toEqual({
        errors,
        hasErrors: true,
        errorSummary,
      })
      expect(ErrorUtils.generateErrorSummary).toHaveBeenCalledWith(errors)
    })

    it('returns hasErrors false when validation errors are empty', () => {
      const errors = {}
      const errorSummary: ReturnType<typeof ErrorUtils.generateErrorSummary> = []

      jest.spyOn(SelectProjectComponent, 'getValidationErrors').mockReturnValue(errors)
      jest.spyOn(ErrorUtils, 'generateErrorSummary').mockReturnValue(errorSummary)

      const page = new ChooseProjectPage()
      const result = page.validationErrors({})

      expect(result).toEqual({
        errors,
        hasErrors: false,
        errorSummary,
      })
      expect(ErrorUtils.generateErrorSummary).toHaveBeenCalledWith(errors)
    })
  })

  describe('updateForm', () => {
    it('delegates to SelectProjectComponent.updateFormData', () => {
      const form = appointmentOutcomeFormFactory.build()
      const page = new ChooseProjectPage()
      const teams = [{ value: 'TEAM-1', text: 'Team 1' }]
      const projects = [{ value: 'PROJECT-1', text: 'Project 1' }]
      const query = { form: 'F1', team: 'TEAM-1', project: 'PROJECT-1' }
      const updatedForm = {
        ...form,
        projectTeam: { code: 'TEAM-1', name: 'Team 1' },
        project: { code: 'PROJECT-1', name: 'Project 1' },
      }

      jest.spyOn(SelectProjectComponent, 'updateFormData').mockReturnValue(updatedForm)

      const result = page.updateForm(form, query, { teamItems: teams, projectItems: projects })

      expect(SelectProjectComponent.updateFormData).toHaveBeenCalledWith(form, query, {
        teamItems: teams,
        projectItems: projects,
      })
      expect(result).toEqual(updatedForm)
    })
  })
})
