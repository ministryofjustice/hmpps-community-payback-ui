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

  describe('personItems', () => {
    it('returns form items as GovUKsummary items', () => {
      const form = courseCompletionFormFactory.build()
      const formId = '12'
      const courseCompletionId = '23'

      const result = page.personItems({ courseCompletionId, form, formId })
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
      expect(result).toEqual(personItems)
    })

    describe('when formId is not present', () => {
      it('returns form items as GovUKsummary items with no formId param in the path', () => {
        const form = courseCompletionFormFactory.build()
        const courseCompletionId = '23'

        const result = page.personItems({ courseCompletionId, form })
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
                  href: paths.courseCompletions.process({ page: 'crn', id: courseCompletionId }),
                  text: 'Change',
                  visuallyHiddenText: 'crn',
                },
              ],
            },
          },
        ]
        expect(result).toEqual(personItems)
      })
    })

    describe('when form is empty', () => {
      it('returns form items as GovUKsummary items with no values', () => {
        const form = {}
        const formId = '12'
        const courseCompletionId = '23'

        const result = page.personItems({ courseCompletionId, form, formId })
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
        expect(result).toEqual(personItems)
      })
    })
  })

  describe('appointmentItems', () => {
    describe('when projects and teams are present', () => {
      it('returns form items as GovUKsummary items with correct values', () => {
        const team = '1'
        const project = '2'
        const form = courseCompletionFormFactory.build({ team, project })
        const formId = '12'
        const courseCompletionId = '23'

        const matchingTeam = providerTeamSummaryFactory.build({ code: team })
        const teams = [matchingTeam, providerTeamSummaryFactory.build()]

        const matchingProject = projectOutcomeSummaryFactory.build({ projectCode: project })
        const projects = [matchingProject, projectOutcomeSummaryFactory.build()]

        const result = page.appointmentItems({ courseCompletionId, form, formId, teams, projects })

        const appointmentItems = [
          {
            key: {
              text: 'Project team',
            },
            value: {
              text: matchingTeam.name,
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
              text: matchingProject.projectName,
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
        expect(result).toEqual(appointmentItems)
      })
    })

    describe('when projects and teams are not present', () => {
      it('returns form items as GovUKsummary items with no value', () => {
        const team = '1'
        const project = '2'
        const form = courseCompletionFormFactory.build({ team, project })
        const formId = '12'
        const courseCompletionId = '23'

        const result = page.appointmentItems({ courseCompletionId, form, formId })

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
        expect(result).toEqual(appointmentItems)
      })
    })

    describe('when projects and teams are present but no matches are found', () => {
      it('returns form items as GovUKsummary items with no value', () => {
        const team = '1'
        const project = '2'
        const form = courseCompletionFormFactory.build({ team, project })
        const formId = '12'
        const courseCompletionId = '23'

        const projects = projectOutcomeSummaryFactory.buildList(2)
        const teams = providerTeamSummaryFactory.buildList(2)

        const result = page.appointmentItems({ courseCompletionId, form, formId, projects, teams })

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
        expect(result).toEqual(appointmentItems)
      })
    })

    describe('when formId is not present', () => {
      it('returns form items as GovUKsummary items with no formId param in the path', () => {
        const team = '1'
        const project = '2'
        const form = courseCompletionFormFactory.build({ team, project })
        const courseCompletionId = '23'

        const matchingTeam = providerTeamSummaryFactory.build({ code: team })
        const teams = [matchingTeam, providerTeamSummaryFactory.build()]

        const matchingProject = projectOutcomeSummaryFactory.build({ projectCode: project })
        const projects = [matchingProject, projectOutcomeSummaryFactory.build()]

        const result = page.appointmentItems({ courseCompletionId, form, projects, teams })

        const appointmentItems = [
          {
            key: {
              text: 'Project team',
            },
            value: {
              text: matchingTeam.name,
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
              text: matchingProject.projectName,
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
        expect(result).toEqual(appointmentItems)
      })
    })

    describe('when form is empty', () => {
      it('returns form items as GovUKsummary items with no values', () => {
        const team = '1'
        const project = '2'
        const form = {}
        const formId = '12'
        const courseCompletionId = '23'

        const matchingTeam = providerTeamSummaryFactory.build({ code: team })
        const teams = [matchingTeam, providerTeamSummaryFactory.build()]

        const matchingProject = projectOutcomeSummaryFactory.build({ projectCode: project })
        const projects = [matchingProject, projectOutcomeSummaryFactory.build()]

        const result = page.appointmentItems({ courseCompletionId, form, formId, projects, teams })

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
        expect(result).toEqual(appointmentItems)
      })
    })
  })
})
