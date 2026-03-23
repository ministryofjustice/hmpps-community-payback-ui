import paths from '../../../paths'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'
import courseCompletionFormFactory from '../../../testutils/factories/courseCompletionFormFactory'
import projectOutcomeSummaryFactory from '../../../testutils/factories/projectOutcomeSummaryFactory'
import providerTeamSummaryFactory from '../../../testutils/factories/providerTeamSummaryFactory'
import { pathWithQuery } from '../../../utils/utils'
import ConfirmPage from './confirmPage'
import pathMap from './pathMap'

describe('ConfirmPage', () => {
  const pageName = 'confirm'
  const backPath = pathMap[pageName].back
  let page: ConfirmPage
  beforeEach(() => {
    page = new ConfirmPage()
  })

  describe('nextPath', () => {
    it('returns the next page path', () => {
      const id = '1'
      const result = page.nextPath(id, undefined)
      expect(result).toBe(paths.courseCompletions.show({ id }))
    })
  })

  describe('viewData', () => {
    it('returns view data for appointments', () => {
      const courseCompletion = courseCompletionFactory.build({ firstName: 'Mary', lastName: 'Smith' })
      const expectedPerson = 'Mary Smith'

      const result = page.viewData(courseCompletion)

      expect(result).toEqual({
        communityCampusPerson: { name: expectedPerson },
        backLink: paths.courseCompletions.process({ page: backPath, id: courseCompletion.id }),
        updatePath: paths.courseCompletions.process({ page: pageName, id: courseCompletion.id }),
        courseName: courseCompletion.courseName,
      })
    })

    it('includes paths with form id if provided', () => {
      const courseCompletion = courseCompletionFactory.build({ firstName: 'Mary', lastName: 'Smith' })
      const form = '23'

      const result = page.viewData(courseCompletion, form)

      expect(result.backLink).toEqual(
        pathWithQuery(paths.courseCompletions.process({ page: backPath, id: courseCompletion.id }), { form }),
      )

      expect(result.updatePath).toEqual(
        pathWithQuery(paths.courseCompletions.process({ page: pageName, id: courseCompletion.id }), { form }),
      )
    })
  })

  describe('stepViewData', () => {
    it('returns form items as GovUKsummary items', () => {
      const team = '1'
      const project = '2'
      const form = courseCompletionFormFactory.build({ team, project })
      const formId = '12'
      const courseCompletionId = '23'

      const result = page.stepViewData(courseCompletionId, form, formId)
      const personItems = [
        {
          key: {
            text: 'CRN',
          },
          value: {
            text: form.crn,
          },
          actions: {
            items: [
              {
                href: pathWithQuery(paths.courseCompletions.process({ page: 'crn', id: courseCompletionId }), {
                  form: formId,
                }),
                text: 'Change',
                visuallyHiddenText: 'crn',
              },
            ],
          },
        },
      ]

      const appointmentItems = [
        {
          key: {
            text: 'Project team',
          },
          value: {
            text: undefined as string,
          },
          actions: {
            items: [
              {
                href: pathWithQuery(paths.courseCompletions.process({ page: 'project', id: courseCompletionId }), {
                  form: formId,
                }),
                text: 'Change',
                visuallyHiddenText: 'project team',
              },
            ],
          },
        },
        {
          key: {
            text: 'Project',
          },
          value: {
            text: undefined as string,
          },
          actions: {
            items: [
              {
                href: pathWithQuery(paths.courseCompletions.process({ page: 'project', id: courseCompletionId }), {
                  form: formId,
                }),
                text: 'Change',
                visuallyHiddenText: 'project',
              },
            ],
          },
        },
      ]
      expect(result).toEqual({ personItems, appointmentItems })
    })

    it('returns form items as GovUKsummary empty items if form is empty or formId is undefined', () => {
      const courseCompletionId = '23'

      const result = page.stepViewData(courseCompletionId, {}, undefined)
      const personItems = [
        {
          key: {
            text: 'CRN',
          },
          value: {
            text: undefined as string,
          },
          actions: {
            items: [
              {
                href: paths.courseCompletions.process({ page: 'crn', id: courseCompletionId }),
                text: 'Change',
                visuallyHiddenText: 'crn',
              },
            ],
          },
        },
      ]

      const appointmentItems = [
        {
          key: {
            text: 'Project team',
          },
          value: {
            text: undefined as string,
          },
          actions: {
            items: [
              {
                href: paths.courseCompletions.process({ page: 'project', id: courseCompletionId }),
                text: 'Change',
                visuallyHiddenText: 'project team',
              },
            ],
          },
        },
        {
          key: {
            text: 'Project',
          },
          value: {
            text: undefined as string,
          },
          actions: {
            items: [
              {
                href: paths.courseCompletions.process({ page: 'project', id: courseCompletionId }),
                text: 'Change',
                visuallyHiddenText: 'project',
              },
            ],
          },
        },
      ]
      expect(result).toEqual({ personItems, appointmentItems })
    })

    describe('appointmentItems', () => {
      it('returns the team name given teams and team code', () => {
        const team = '1'
        const form = courseCompletionFormFactory.build({ team })
        const formId = '12'
        const courseCompletionId = '23'

        const matchingTeam = providerTeamSummaryFactory.build({ code: team })
        const teams = [matchingTeam, providerTeamSummaryFactory.build()]

        const result = page.stepViewData(courseCompletionId, form, formId, teams)

        expect(result.appointmentItems[0].value).toEqual({ text: matchingTeam.name })
      })

      it('returns undefined team text if no matching team', () => {
        const form = courseCompletionFormFactory.build()
        const formId = '12'
        const courseCompletionId = '23'

        const teams = providerTeamSummaryFactory.buildList(2)

        const result = page.stepViewData(courseCompletionId, form, formId, teams)

        expect(result.appointmentItems[0].value).toEqual({ text: undefined as string })
      })

      it('returns the project name given projects and project code', () => {
        const project = '1'
        const form = courseCompletionFormFactory.build({ project })
        const formId = '12'
        const courseCompletionId = '23'

        const matchingProject = projectOutcomeSummaryFactory.build({ projectCode: project })
        const projects = [matchingProject, projectOutcomeSummaryFactory.build()]

        const result = page.stepViewData(courseCompletionId, form, formId, [], projects)

        expect(result.appointmentItems[1].value).toEqual({ text: matchingProject.projectName })
      })

      it('returns undefined project text if no matching team', () => {
        const form = courseCompletionFormFactory.build()
        const formId = '12'
        const courseCompletionId = '23'

        const projects = projectOutcomeSummaryFactory.buildList(2)

        const result = page.stepViewData(courseCompletionId, form, formId, [], projects)

        expect(result.appointmentItems[1].value).toEqual({ text: undefined as string })
      })
    })
  })
})
