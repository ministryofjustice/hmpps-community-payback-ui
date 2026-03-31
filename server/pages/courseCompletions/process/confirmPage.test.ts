import paths from '../../../paths'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'
import courseCompletionFormFactory from '../../../testutils/factories/courseCompletionFormFactory'
import projectOutcomeSummaryFactory from '../../../testutils/factories/projectOutcomeSummaryFactory'
import providerTeamSummaryFactory from '../../../testutils/factories/providerTeamSummaryFactory'
import unpaidWorkDetailsFactory from '../../../testutils/factories/unpaidWorkDetailsFactory'
import offenderLimitedFactory from '../../../testutils/factories/offenderLimitedFactory'
import offenderFullFactory from '../../../testutils/factories/offenderFullFactory'
import { pathWithQuery } from '../../../utils/utils'
import ConfirmPage from './confirmPage'
import pathMap from './pathMap'
import DateTimeFormats from '../../../utils/dateTimeUtils'
import GovUkRadioGroup from '../../../forms/GovUkRadioGroup'
import { YesOrNo } from '../../../@types/user-defined'

describe('ConfirmPage', () => {
  const pageName = 'confirm'
  const backPath = pathMap[pageName].back
  let page: ConfirmPage
  beforeEach(() => {
    page = new ConfirmPage()
    jest.resetAllMocks()
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
      const unpaidWorkDetails = unpaidWorkDetailsFactory.build({ sentenceDate: '2026-03-25' })

      const result = page.personItems({ courseCompletionId, form, formId, unpaidWorkDetails })
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
        {
          key: {
            text: 'Requirement',
          },
          value: {
            html: `Offence: ${unpaidWorkDetails.mainOffence.description}<br>Event number: ${unpaidWorkDetails.eventNumber}<br>Sentence date: 25 March 2026<br>Status: ${unpaidWorkDetails.upwStatus}`,
          },
          actions: {
            items: [
              {
                href: pathWithQuery(paths.courseCompletions.process({ page: 'requirement', id: courseCompletionId }), {
                  form: formId,
                }),
                text: 'Change',
                visuallyHiddenText: 'requirement',
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
        const unpaidWorkDetails = unpaidWorkDetailsFactory.build({ sentenceDate: '2026-03-25' })

        const result = page.personItems({ courseCompletionId, form, unpaidWorkDetails })
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
          {
            key: {
              text: 'Requirement',
            },
            value: {
              html: `Offence: ${unpaidWorkDetails.mainOffence.description}<br>Event number: ${unpaidWorkDetails.eventNumber}<br>Sentence date: 25 March 2026<br>Status: ${unpaidWorkDetails.upwStatus}`,
            },
            actions: {
              items: [
                {
                  href: paths.courseCompletions.process({ page: 'requirement', id: courseCompletionId }),
                  text: 'Change',
                  visuallyHiddenText: 'requirement',
                },
              ],
            },
          },
        ]
        expect(result).toEqual(personItems)
      })
    })

    describe('when form is empty', () => {
      it('returns form items as GovUKsummary items with no value for CRN', () => {
        const form = {}
        const formId = '12'
        const courseCompletionId = '23'
        const unpaidWorkDetails = unpaidWorkDetailsFactory.build({ sentenceDate: '2026-03-25' })

        const result = page.personItems({ courseCompletionId, form, formId, unpaidWorkDetails })
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
          {
            key: {
              text: 'Requirement',
            },
            value: {
              html: `Offence: ${unpaidWorkDetails.mainOffence.description}<br>Event number: ${unpaidWorkDetails.eventNumber}<br>Sentence date: 25 March 2026<br>Status: ${unpaidWorkDetails.upwStatus}`,
            },
            actions: {
              items: [
                {
                  href: pathWithQuery(
                    paths.courseCompletions.process({ page: 'requirement', id: courseCompletionId }),
                    {
                      form: formId,
                    },
                  ),
                  text: 'Change',
                  visuallyHiddenText: 'requirement',
                },
              ],
            },
          },
        ]
        expect(result).toEqual(personItems)
      })
    })

    describe('when unpaidWorkDetails is not present', () => {
      it('returns form items as GovUKsummary items with no value for Requirement', () => {
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
          {
            key: {
              text: 'Requirement',
            },
            value: {
              html: undefined as string,
            },
            actions: {
              items: [
                {
                  href: pathWithQuery(
                    paths.courseCompletions.process({ page: 'requirement', id: courseCompletionId }),
                    {
                      form: formId,
                    },
                  ),
                  text: 'Change',
                  visuallyHiddenText: 'requirement',
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
    describe('Project and team', () => {
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

          const teamItem = {
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
          }
          const projectItem = {
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
          }

          expect(result).toContainEqual(teamItem)
          expect(result).toContainEqual(projectItem)
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

          const teamItem = {
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
          }
          const projectItem = {
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
          }
          expect(result).toContainEqual(teamItem)
          expect(result).toContainEqual(projectItem)
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

          const teamItem = {
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
          }
          const projectItem = {
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
          }
          expect(result).toContainEqual(teamItem)
          expect(result).toContainEqual(projectItem)
        })
      })
    })

    describe('Credited time', () => {
      it('returns form item with formatted credited time when hours and minutes are present', () => {
        const form = courseCompletionFormFactory.build({
          timeToCredit: { hours: '3', minutes: '20' },
        })
        const formId = '12'
        const courseCompletionId = '23'

        const result = page.appointmentItems({ courseCompletionId, form, formId })

        const creditedTimeItem = {
          key: {
            text: 'Credited time',
          },
          value: {
            text: '3 hours 20 minutes',
          },
          actions: {
            items: [
              {
                href: pathWithQuery(paths.courseCompletions.process({ page: 'outcome', id: courseCompletionId }), {
                  form: formId,
                }),
                text: 'Change',
                visuallyHiddenText: 'credited time',
              },
            ],
          },
        }

        expect(result).toContainEqual(creditedTimeItem)
      })

      it('returns form item with formatted credited time when only hours are present', () => {
        const form = courseCompletionFormFactory.build({
          timeToCredit: { hours: '2', minutes: undefined },
        })
        const formId = '12'
        const courseCompletionId = '23'

        const result = page.appointmentItems({ courseCompletionId, form, formId })

        const creditedTimeItem = {
          key: {
            text: 'Credited time',
          },
          value: {
            text: '2 hours',
          },
          actions: {
            items: [
              {
                href: pathWithQuery(paths.courseCompletions.process({ page: 'outcome', id: courseCompletionId }), {
                  form: formId,
                }),
                text: 'Change',
                visuallyHiddenText: 'credited time',
              },
            ],
          },
        }

        expect(result).toContainEqual(creditedTimeItem)
      })

      it('returns form item with formatted credited time when only minutes are present', () => {
        const form = courseCompletionFormFactory.build({
          timeToCredit: { hours: undefined, minutes: '45' },
        })
        const formId = '12'
        const courseCompletionId = '23'

        const result = page.appointmentItems({ courseCompletionId, form, formId })

        const creditedTimeItem = {
          key: {
            text: 'Credited time',
          },
          value: {
            text: '45 minutes',
          },
          actions: {
            items: [
              {
                href: pathWithQuery(paths.courseCompletions.process({ page: 'outcome', id: courseCompletionId }), {
                  form: formId,
                }),
                text: 'Change',
                visuallyHiddenText: 'credited time',
              },
            ],
          },
        }

        expect(result).toContainEqual(creditedTimeItem)
      })

      it('returns form item with undefined value when timeToCredit is not present', () => {
        const form = courseCompletionFormFactory.build({
          timeToCredit: undefined,
        })
        const formId = '12'
        const courseCompletionId = '23'

        const result = page.appointmentItems({ courseCompletionId, form, formId })

        const creditedTimeItem = {
          key: {
            text: 'Credited time',
          },
          value: {
            text: undefined as string,
          },
          actions: {
            items: [
              {
                href: pathWithQuery(paths.courseCompletions.process({ page: 'outcome', id: courseCompletionId }), {
                  form: formId,
                }),
                text: 'Change',
                visuallyHiddenText: 'credited time',
              },
            ],
          },
        }

        expect(result).toContainEqual(creditedTimeItem)
      })
    })

    describe('Appointment date', () => {
      it('returns form item with formatted date when date is complete', () => {
        const form = courseCompletionFormFactory.build({
          'date-day': '15',
          'date-month': '03',
          'date-year': '2026',
        })
        const formId = '12'
        const courseCompletionId = '23'

        const result = page.appointmentItems({ courseCompletionId, form, formId })

        const appointmentDateItem = {
          key: {
            text: 'Appointment date',
          },
          value: {
            text: '15 March 2026',
          },
          actions: {
            items: [
              {
                href: pathWithQuery(paths.courseCompletions.process({ page: 'outcome', id: courseCompletionId }), {
                  form: formId,
                }),
                text: 'Change',
                visuallyHiddenText: 'appointment date',
              },
            ],
          },
        }

        expect(result).toContainEqual(appointmentDateItem)
      })

      it('returns form item with undefined value when date is not complete', () => {
        const form = courseCompletionFormFactory.build({
          'date-day': '15',
          'date-month': undefined,
          'date-year': '2026',
        })
        const formId = '12'
        const courseCompletionId = '23'

        const result = page.appointmentItems({ courseCompletionId, form, formId })

        const appointmentDateItem = {
          key: {
            text: 'Appointment date',
          },
          value: {
            text: undefined as string,
          },
          actions: {
            items: [
              {
                href: pathWithQuery(paths.courseCompletions.process({ page: 'outcome', id: courseCompletionId }), {
                  form: formId,
                }),
                text: 'Change',
                visuallyHiddenText: 'appointment date',
              },
            ],
          },
        }

        expect(result).toContainEqual(appointmentDateItem)
      })
    })

    describe('when formId is not present', () => {
      it('returns form items as GovUKsummary items with no formId param in the path', () => {
        const team = '1'
        const project = '2'
        const form = courseCompletionFormFactory.build({
          team,
          project,
          timeToCredit: { hours: '3', minutes: '20' },
          'date-day': '15',
          'date-month': '7',
          'date-year': '2026',
        })
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
          {
            key: {
              text: 'Credited time',
            },
            value: {
              text: '3 hours 20 minutes',
            },
            actions: {
              items: [
                {
                  href: paths.courseCompletions.process({ page: 'outcome', id: courseCompletionId }),
                  text: 'Change',
                  visuallyHiddenText: 'credited time',
                },
              ],
            },
          },
          {
            key: {
              text: 'Appointment date',
            },
            value: {
              text: '15 July 2026',
            },
            actions: {
              items: [
                {
                  href: paths.courseCompletions.process({ page: 'outcome', id: courseCompletionId }),
                  text: 'Change',
                  visuallyHiddenText: 'appointment date',
                },
              ],
            },
          },
          {
            key: {
              text: 'Notes',
            },
            value: {
              text: form.notes,
            },
            actions: {
              items: [
                {
                  href: paths.courseCompletions.process({ page: 'outcome', id: courseCompletionId }),
                  text: 'Change',
                  visuallyHiddenText: 'notes',
                },
              ],
            },
          },
          {
            key: {
              text: 'Sensitive',
            },
            value: {
              text: form.isSensitive.charAt(0).toUpperCase() + form.isSensitive.slice(1),
            },
            actions: {
              items: [
                {
                  href: paths.courseCompletions.process({ page: 'outcome', id: courseCompletionId }),
                  text: 'Change',
                  visuallyHiddenText: 'sensitivity',
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
          {
            key: {
              text: 'Credited time',
            },
            value: {
              text: undefined as string,
            },
            actions: {
              items: [
                {
                  href: pathWithQuery(paths.courseCompletions.process({ page: 'outcome', id: courseCompletionId }), {
                    form: formId,
                  }),
                  text: 'Change',
                  visuallyHiddenText: 'credited time',
                },
              ],
            },
          },
          {
            key: {
              text: 'Appointment date',
            },
            value: {
              text: undefined as string,
            },
            actions: {
              items: [
                {
                  href: pathWithQuery(paths.courseCompletions.process({ page: 'outcome', id: courseCompletionId }), {
                    form: formId,
                  }),
                  text: 'Change',
                  visuallyHiddenText: 'appointment date',
                },
              ],
            },
          },
          {
            key: {
              text: 'Notes',
            },
            value: {
              html: undefined as string,
            },
            actions: {
              items: [
                {
                  href: pathWithQuery(paths.courseCompletions.process({ page: 'outcome', id: courseCompletionId }), {
                    form: formId,
                  }),
                  text: 'Change',
                  visuallyHiddenText: 'notes',
                },
              ],
            },
          },
          {
            key: {
              text: 'Sensitive',
            },
            value: {
              text: 'Not entered',
            },
            actions: {
              items: [
                {
                  href: pathWithQuery(paths.courseCompletions.process({ page: 'outcome', id: courseCompletionId }), {
                    form: formId,
                  }),
                  text: 'Change',
                  visuallyHiddenText: 'sensitivity',
                },
              ],
            },
          },
        ]
        expect(result).toEqual(appointmentItems)
      })
    })

    describe('Notes rows', () => {
      it('returns notes and sensitivity items with values when both are present', () => {
        const form = courseCompletionFormFactory.build({
          notes: 'Some notes',
          isSensitive: 'yes',
        })
        const formId = '12'
        const courseCompletionId = '23'

        const result = page.appointmentItems({ courseCompletionId, form, formId })

        const notesItem = {
          key: {
            text: 'Notes',
          },
          value: {
            text: 'Some notes',
          },
          actions: {
            items: [
              {
                href: pathWithQuery(paths.courseCompletions.process({ page: 'outcome', id: courseCompletionId }), {
                  form: formId,
                }),
                text: 'Change',
                visuallyHiddenText: 'notes',
              },
            ],
          },
        }

        const sensitivityItem = {
          key: {
            text: 'Sensitive',
          },
          value: {
            text: 'Yes',
          },
          actions: {
            items: [
              {
                href: pathWithQuery(paths.courseCompletions.process({ page: 'outcome', id: courseCompletionId }), {
                  form: formId,
                }),
                text: 'Change',
                visuallyHiddenText: 'sensitivity',
              },
            ],
          },
        }

        expect(result).toContainEqual(notesItem)
        expect(result).toContainEqual(sensitivityItem)
      })

      it('returns sensitivity item with "No" value', () => {
        const form = courseCompletionFormFactory.build({
          isSensitive: 'no',
        })
        const formId = '12'
        const courseCompletionId = '23'

        const result = page.appointmentItems({ courseCompletionId, form, formId })

        const sensitivityItem = {
          key: {
            text: 'Sensitive',
          },
          value: {
            text: 'No',
          },
          actions: {
            items: [
              {
                href: pathWithQuery(paths.courseCompletions.process({ page: 'outcome', id: courseCompletionId }), {
                  form: formId,
                }),
                text: 'Change',
                visuallyHiddenText: 'sensitivity',
              },
            ],
          },
        }

        expect(result).toContainEqual(sensitivityItem)
      })

      it('returns notes item with undefined value when notes is undefined', () => {
        const form = courseCompletionFormFactory.build({
          notes: undefined,
        })
        const formId = '12'
        const courseCompletionId = '23'

        const result = page.appointmentItems({ courseCompletionId, form, formId })

        const notesItem = {
          key: {
            text: 'Notes',
          },
          value: {
            html: undefined as string,
          },
          actions: {
            items: [
              {
                href: pathWithQuery(paths.courseCompletions.process({ page: 'outcome', id: courseCompletionId }), {
                  form: formId,
                }),
                text: 'Change',
                visuallyHiddenText: 'notes',
              },
            ],
          },
        }

        expect(result).toContainEqual(notesItem)
      })

      it('returns sensitivity item as "Not entered" when isSensitive is undefined', () => {
        const form = courseCompletionFormFactory.build({
          isSensitive: undefined,
        })
        const formId = '12'
        const courseCompletionId = '23'

        const result = page.appointmentItems({ courseCompletionId, form, formId })

        const sensitivityItem = {
          key: {
            text: 'Sensitive',
          },
          value: {
            text: 'Not entered',
          },
          actions: {
            items: [
              {
                href: pathWithQuery(paths.courseCompletions.process({ page: 'outcome', id: courseCompletionId }), {
                  form: formId,
                }),
                text: 'Change',
                visuallyHiddenText: 'sensitivity',
              },
            ],
          },
        }

        expect(result).toContainEqual(sensitivityItem)
      })
    })
  })

  describe('requestBody', () => {
    it('should build a CourseCompletionResolutionDto with CREDIT_TIME type', () => {
      const form = courseCompletionFormFactory.build({
        crn: 'X123456',
        deliusEventNumber: 123,
        project: 'PRJ001',
        notes: 'Some notes',
        isSensitive: 'yes',
        timeToCredit: {
          hours: '2',
          minutes: '30',
        },
      })
      const body = {
        alertPractitioner: 'yes' as YesOrNo,
      }

      const date = '2026-03-30'
      jest.spyOn(DateTimeFormats, 'dateAndTimeInputsToIsoString').mockReturnValue({ date })
      jest.spyOn(DateTimeFormats, 'hoursAndMinutesToMinutes').mockReturnValue(150)
      jest.spyOn(GovUkRadioGroup, 'nullableValueFromYesOrNoItem').mockImplementation(value => value === 'yes')
      const result = page.requestBody(form, body)

      expect(result).toEqual({
        type: 'CREDIT_TIME',
        crn: 'X123456',
        creditTimeDetails: {
          deliusEventNumber: 123,
          date,
          minutesToCredit: 150,
          contactOutcomeCode: 'ATTC',
          projectCode: 'PRJ001',
          notes: 'Some notes',
          sensitive: true,
          alertActive: true,
        },
      })

      expect(DateTimeFormats.dateAndTimeInputsToIsoString).toHaveBeenCalledWith(form, 'date')
      expect(DateTimeFormats.hoursAndMinutesToMinutes).toHaveBeenCalledWith('2', '30')
      expect(GovUkRadioGroup.nullableValueFromYesOrNoItem).toHaveBeenCalledTimes(2)
    })
  })

  describe('successMessage', () => {
    it('returns success message for a limited offender', () => {
      const limitedOffender = offenderLimitedFactory.build({ crn: 'X123456' })

      const result = page.successMessage(limitedOffender)

      expect(result).toBe('The course completion for CRN: X123456 has been processed.')
    })

    it('returns success message for a full offender', () => {
      const fullOffender = offenderFullFactory.build({ forename: 'John', surname: 'Doe' })

      const result = page.successMessage(fullOffender)

      expect(result).toBe('The course completion for John Doe has been processed.')
    })
  })
})
