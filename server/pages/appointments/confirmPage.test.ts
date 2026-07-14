import { AppointmentDto } from '../../@types/shared'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import sessionFactory from '../../testutils/factories/sessionFactory'
import ConfirmPage from './confirmPage'
import * as Utils from '../../utils/utils'
import { AppointmentOutcomeForm, YesOrNo } from '../../@types/user-defined'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import { contactOutcomeFactory } from '../../testutils/factories/contactOutcomeFactory'
import DateTimeFormats from '../../utils/dateTimeUtils'
import projectFactory from '../../testutils/factories/projectFactory'
import GovUkRadioGroup from '../../forms/GovUkRadioGroup'
import offenderFullFactory from '../../testutils/factories/offenderFullFactory'
import appointmentSummaryFactory from '../../testutils/factories/appointmentSummaryFactory'

describe('ConfirmPage', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('viewData', () => {
    let page: ConfirmPage
    let appointment: AppointmentDto
    let form: AppointmentOutcomeForm
    const pathWithQuery = '/path?'

    beforeEach(() => {
      page = new ConfirmPage()
      appointment = appointmentFactory.build({ sensitive: false })
      form = appointmentOutcomeFormFactory.build()
      jest.spyOn(Utils, 'pathWithQuery').mockReturnValue(pathWithQuery)
    })

    describe('back link', () => {
      it('should return an object containing a back link to the compliance page if attended', async () => {
        jest.spyOn(paths.appointments, 'update')
        const formWithoutEnforcement = appointmentOutcomeFormFactory.build({
          contactOutcome: contactOutcomeFactory.build({ attended: true }),
        })

        const result = page.viewData(appointment, formWithoutEnforcement)
        expect(paths.appointments.update).toHaveBeenCalledWith({
          projectCode: appointment.projectCode,
          appointmentId: appointment.id.toString(),
          page: 'log-compliance',
        })
        expect(result.backLink).toBe(pathWithQuery)
      })

      it('should return an object containing a back link to the attendance outcome page if did not attend', async () => {
        jest.spyOn(paths.appointments, 'update')
        const formWithoutEnforcement = appointmentOutcomeFormFactory.build({
          contactOutcome: contactOutcomeFactory.build({ attended: false }),
        })

        const result = page.viewData(appointment, formWithoutEnforcement)
        expect(paths.appointments.update).toHaveBeenCalledWith({
          projectCode: appointment.projectCode,
          appointmentId: appointment.id.toString(),
          page: 'attendance-outcome',
        })
        expect(result.backLink).toBe(pathWithQuery)
      })
    })

    it('should return an object containing an update link for the form', async () => {
      jest.spyOn(paths.appointments, 'update')

      const result = page.viewData(appointment, form)
      expect(paths.appointments.update).toHaveBeenCalledWith({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
        page: 'confirm-details',
      })
      expect(result.updatePath).toBe(pathWithQuery)
    })

    it('should return expected commonViewData when appointmentOrSession is a session', () => {
      const session = sessionFactory.build({ projectCode: 'P123', date: '2026-06-10' })
      const submitted = appointmentOutcomeFormFactory.build({
        contactOutcome: contactOutcomeFactory.build({ attended: false }),
      })

      jest.spyOn(paths.sessions, 'update')
      jest.spyOn(paths.appointments, 'update')

      const result = page.viewData(session, submitted)

      expect(paths.sessions.update).toHaveBeenCalledWith({
        projectCode: session.projectCode,
        date: session.date,
        page: 'confirm-details',
      })
      expect(paths.sessions.update).toHaveBeenCalledWith({
        projectCode: session.projectCode,
        date: session.date,
        page: 'attendance-outcome',
      })
      expect(paths.appointments.update).not.toHaveBeenCalled()

      expect(result.backLink).toBe(pathWithQuery)
      expect(result.updatePath).toBe(pathWithQuery)
      expect(result.selectedPeopleCard).toBeUndefined()
    })

    describe('alertPractitionerItems', () => {
      it('should return an object containing alert practitioner question items if contact outcome will alert', () => {
        form = appointmentOutcomeFormFactory.build({
          contactOutcome: { code: 'some-code', willAlertEnforcementDiary: true },
        })
        const items = [{ text: 'Yes', value: 'yes' }]
        jest.spyOn(GovUkRadioGroup, 'yesNoItems').mockReturnValue(items)
        const result = page.viewData(appointment, form)
        expect(result.alertPractitionerItems).toEqual(items)
      })

      it('should return an object containing alert practitioner question items if contact outcome will not alert', () => {
        form = appointmentOutcomeFormFactory.build({
          contactOutcome: { code: 'some-code', willAlertEnforcementDiary: false },
        })
        const items = [{ text: 'Yes', value: 'yes' }]
        jest.spyOn(GovUkRadioGroup, 'yesNoItems').mockReturnValue(items)
        const result = page.viewData(appointment, form)
        expect(result.alertPractitionerItems).toEqual(items)
      })

      it('should pass undefined alert value when appointmentOrSession is a session', () => {
        const session = sessionFactory.build()
        const formWithSession = appointmentOutcomeFormFactory.build({
          appointments: session.appointmentSummaries.map(summary => ({ id: summary.id, deliusVersion: '' })),
        })
        const items = [{ text: 'Yes', value: 'yes' }]
        jest.spyOn(GovUkRadioGroup, 'yesNoItems').mockReturnValue(items)

        const determineCheckedValueSpy = jest.spyOn(GovUkRadioGroup, 'determineCheckedValue')

        const result = page.viewData(session, formWithSession)

        expect(determineCheckedValueSpy).toHaveBeenCalledWith(undefined)
        expect(result.alertPractitionerItems).toEqual(items)
      })
    })

    describe('alertDiaryText', () => {
      it("should return alertDiaryText with 'also' if contact outcome will alert", () => {
        form = appointmentOutcomeFormFactory.build({
          contactOutcome: { code: 'some-code', willAlertEnforcementDiary: true },
        })
        const result = page.viewData(appointment, form)
        expect(result.alertDiaryText).toContain('also')
      })

      it("should return alertDiaryText without 'also' if contact outcome will not alert", () => {
        form = appointmentOutcomeFormFactory.build({
          contactOutcome: { code: 'some-code', willAlertEnforcementDiary: false },
        })
        const result = page.viewData(appointment, form)
        expect(result.alertDiaryText).not.toContain('also')
      })
    })

    it.each([true, false])('should return an object containing alert practitioner question items', (value: boolean) => {
      form = appointmentOutcomeFormFactory.build({
        contactOutcome: { code: 'some-code', willAlertEnforcementDiary: value },
      })
      const result = page.viewData(appointment, form)
      expect(result.showWillAlertPractitionerMessage).toEqual(value)
    })

    describe('submittedItems', () => {
      afterEach(() => {
        jest.restoreAllMocks()
      })

      it('should return an object containing summary list items for non attended outcome', async () => {
        const hours = '0'
        jest.spyOn(DateTimeFormats, 'timeBetween').mockReturnValue(hours)
        jest.spyOn(Utils, 'yesNoDisplayValue').mockReturnValue('Not entered')

        const notes = 'some notes'
        const contactOutcome = contactOutcomeFactory.build({ attended: false, enforceable: false })
        const submitted = appointmentOutcomeFormFactory.build({
          contactOutcome,
          notes,
          isSensitive: undefined,
        })
        const result = page.viewData(appointment, submitted)
        expect(result.submittedItems).toEqual([
          {
            key: {
              text: 'Supervising officer',
            },
            value: {
              text: submitted.supervisor.fullName,
            },
            actions: {
              items: [
                {
                  href: pathWithQuery,
                  text: 'Change',
                  visuallyHiddenText: 'supervising officer',
                },
              ],
            },
          },
          {
            key: {
              text: 'Project team',
            },
            value: {
              text: submitted.projectTeam.name,
            },
            actions: {
              items: [
                {
                  href: pathWithQuery,
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
              text: submitted.project.name,
            },
            actions: {
              items: [
                {
                  href: pathWithQuery,
                  text: 'Change',
                  visuallyHiddenText: 'project',
                },
              ],
            },
          },
          {
            key: {
              text: 'Outcome',
            },
            value: {
              html: `<p>${submitted.contactOutcome.name}</p><p>Hours credited: 0</p>`,
            },
            actions: {
              items: [
                {
                  href: pathWithQuery,
                  text: 'Change',
                  visuallyHiddenText: 'attendance outcome',
                },
              ],
            },
          },
          {
            key: {
              text: 'Notes',
            },
            value: {
              text: notes,
            },
            actions: {
              items: [
                {
                  href: pathWithQuery,
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
                  href: pathWithQuery,
                  text: 'Change',
                  visuallyHiddenText: 'sensitivity',
                },
              ],
            },
          },
        ])
      })

      it('should display start and end time with logged hours for attendance outcomes', async () => {
        const hours = '8 hours'
        jest.spyOn(DateTimeFormats, 'timeBetween').mockReturnValue(hours)

        const contactOutcome = contactOutcomeFactory.build({ attended: true, enforceable: false })
        const submitted = appointmentOutcomeFormFactory.build({
          contactOutcome,
        })
        const result = page.viewData(appointment, submitted)
        expect(result.submittedItems).toContainEqual(
          expect.objectContaining({
            key: {
              text: 'Start and end time',
            },
            value: {
              html: `<p>09:00 - 17:00</p><p>Hours credited: ${hours}</p>`,
            },
            actions: {
              items: [
                {
                  href: pathWithQuery,
                  text: 'Change',
                  visuallyHiddenText: 'start and end time',
                },
              ],
            },
          }),
        )
      })

      it('should contain "Outcome" item with contact outcome name when outcome is attended', () => {
        const contactOutcome = contactOutcomeFactory.build({ attended: true, enforceable: false })
        const submitted = appointmentOutcomeFormFactory.build({
          contactOutcome,
        })

        const result = page.viewData(appointment, submitted)

        expect(result.submittedItems).toContainEqual(
          expect.objectContaining({
            key: {
              text: 'Outcome',
            },
            value: {
              text: submitted.contactOutcome.name,
            },
            actions: {
              items: [
                {
                  href: pathWithQuery,
                  text: 'Change',
                  visuallyHiddenText: 'attendance outcome',
                },
              ],
            },
          }),
        )
      })

      describe('compliance answers', () => {
        describe('when workQuality is NOT_APPLICABLE', () => {
          it('returns `Not applicable`', () => {
            const formComplianceAnswers = appointmentOutcomeFormFactory.build({
              attendanceData: { workQuality: 'NOT_APPLICABLE' },
            })

            const result = page.getComplianceAnswers(formComplianceAnswers)
            expect(result).toMatch('Work quality - Not applicable')
          })
        })

        describe('when workQuality is GOOD', () => {
          it('returns `Good`', () => {
            const formComplianceAnswers = appointmentOutcomeFormFactory.build({
              attendanceData: { workQuality: 'GOOD' },
            })

            const result = page.getComplianceAnswers(formComplianceAnswers)
            expect(result).toMatch('Work quality - Good')
          })
        })

        describe('when behaviour is NOT_APPLICABLE', () => {
          it('returns `Not applicable`', () => {
            const formComplianceAnswers = appointmentOutcomeFormFactory.build({
              attendanceData: { behaviour: 'NOT_APPLICABLE' },
            })

            const result = page.getComplianceAnswers(formComplianceAnswers)
            expect(result).toMatch('Behaviour - Not applicable')
          })
        })

        describe('when behaviour is GOOD', () => {
          it('returns `Good`', () => {
            const formComplianceAnswers = appointmentOutcomeFormFactory.build({ attendanceData: { behaviour: 'GOOD' } })

            const result = page.getComplianceAnswers(formComplianceAnswers)
            expect(result).toMatch('Behaviour - Good')
          })
        })
      })

      it('should contain compliance data if contact outcome is attended', () => {
        const contactOutcome = contactOutcomeFactory.build({ attended: true })
        const submitted = appointmentOutcomeFormFactory.build({
          contactOutcome,
          attendanceData: { workQuality: 'GOOD', behaviour: 'NOT_APPLICABLE' },
        })
        const result = page.viewData(appointment, submitted).submittedItems

        expect(result).toContainEqual({
          key: {
            text: 'Compliance',
          },
          value: {
            html: 'Work quality - Good<br>Behaviour - Not applicable',
          },
          actions: {
            items: [
              {
                href: pathWithQuery,
                text: 'Change',
                visuallyHiddenText: 'compliance',
              },
            ],
          },
        })
      })

      it('should contain notes if contact outcome is attended', () => {
        const contactOutcome = contactOutcomeFactory.build({ attended: true })
        const submitted = appointmentOutcomeFormFactory.build({
          contactOutcome,
          notes: 'test',
        })
        const result = page.viewData(appointment, submitted).submittedItems

        expect(result).toContainEqual({
          key: {
            text: 'Notes',
          },
          value: {
            text: 'test',
          },
          actions: {
            items: [
              {
                href: pathWithQuery,
                text: 'Change',
                visuallyHiddenText: 'notes',
              },
            ],
          },
        })
      })

      it('should return submittedItems with session change links when appointmentOrSession is a session and outcome is not attended', () => {
        const summaryOne = appointmentSummaryFactory.build({
          offender: offenderFullFactory.build({ forename: 'Alex', surname: 'Smith', crn: 'CRN001' }),
        })
        const summaryTwo = appointmentSummaryFactory.build({
          offender: offenderFullFactory.build({ forename: 'Sam', surname: 'Jones', crn: 'CRN002' }),
        })
        const session = sessionFactory.build({
          appointmentSummaries: [summaryOne, summaryTwo],
        })
        const hours = '0'
        jest.spyOn(DateTimeFormats, 'timeBetween').mockReturnValue(hours)
        jest.spyOn(paths.sessions, 'update')
        jest.spyOn(paths.appointments, 'update')

        const contactOutcome = contactOutcomeFactory.build({ attended: false, enforceable: false })
        const submitted = appointmentOutcomeFormFactory.build({
          contactOutcome,
          notes: 'some notes',
          isSensitive: undefined,
          appointments: [
            { id: summaryTwo.id, deliusVersion: 'v2' },
            { id: summaryOne.id, deliusVersion: 'v1' },
          ],
        })

        const result = page.viewData(session, submitted)
        const expectedPeople = 'Sam Jones (CRN002) <br/>Alex Smith (CRN001)'

        expect(result.submittedItems).toEqual([
          {
            key: {
              text: 'People',
            },
            value: {
              html: expectedPeople,
            },
            actions: {
              items: [
                {
                  href: pathWithQuery,
                  text: 'Change',
                  visuallyHiddenText: 'people',
                },
              ],
            },
          },
          {
            key: {
              text: 'Supervising officer',
            },
            value: {
              text: submitted.supervisor.fullName,
            },
            actions: {
              items: [
                {
                  href: pathWithQuery,
                  text: 'Change',
                  visuallyHiddenText: 'supervising officer',
                },
              ],
            },
          },
          {
            key: {
              text: 'Project team',
            },
            value: {
              text: submitted.projectTeam.name,
            },
            actions: {
              items: [
                {
                  href: pathWithQuery,
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
              text: submitted.project.name,
            },
            actions: {
              items: [
                {
                  href: pathWithQuery,
                  text: 'Change',
                  visuallyHiddenText: 'project',
                },
              ],
            },
          },
          {
            key: {
              text: 'Outcome',
            },
            value: {
              html: `<p>${submitted.contactOutcome.name}</p><p>Hours credited: 0</p>`,
            },
            actions: {
              items: [
                {
                  href: pathWithQuery,
                  text: 'Change',
                  visuallyHiddenText: 'attendance outcome',
                },
              ],
            },
          },
          {
            key: {
              text: 'Notes',
            },
            value: {
              text: 'some notes',
            },
            actions: {
              items: [
                {
                  href: pathWithQuery,
                  text: 'Change',
                  visuallyHiddenText: 'notes',
                },
              ],
            },
          },
        ])

        expect(paths.sessions.update).toHaveBeenCalledWith({
          projectCode: session.projectCode,
          date: session.date,
          page: 'choose-supervisor',
        })
        expect(paths.sessions.update).toHaveBeenCalledWith({
          projectCode: session.projectCode,
          date: session.date,
          page: 'attendance-outcome',
        })
        expect(paths.appointments.update).not.toHaveBeenCalled()
      })

      it('should return empty people html when no appointment ids match session summaries', () => {
        const session = sessionFactory.build()

        const submitted = appointmentOutcomeFormFactory.build({
          contactOutcome: contactOutcomeFactory.build({ attended: false, enforceable: false }),
          appointments: [
            { id: 999001, deliusVersion: 'v1' },
            { id: 999002, deliusVersion: 'v2' },
          ],
        })

        const result = page.viewData(session, submitted)

        expect(result.submittedItems).toContainEqual(
          expect.objectContaining({
            key: { text: 'People' },
            value: { html: '' },
          }),
        )
      })
    })
  })

  describe('exitForm', () => {
    it('should return session link if project type is "GROUP"', () => {
      const projectCode = '2'
      const path = '/path'
      const page = new ConfirmPage()
      const search = { provider: 'provider' }

      jest.spyOn(paths.sessions, 'show').mockReturnValue(path)
      const appointment = appointmentFactory.build({ projectCode })
      expect(page.exitForm(appointment, projectFactory.build(), search)).toBe(Utils.pathWithQuery(path, search))
      expect(paths.sessions.show).toHaveBeenCalledWith({ projectCode, date: appointment.date })
    })

    it('should return project link if project type is "INDIVIDUAL"', () => {
      const projectCode = '2'
      const path = '/path'
      const page = new ConfirmPage()
      const search = { provider: 'provider' }

      jest.spyOn(paths.projects, 'show').mockReturnValue(path)
      const appointment = appointmentFactory.build({ projectCode })
      const project = projectFactory.build({ projectType: { group: 'INDIVIDUAL' } })
      expect(page.exitForm(appointment, project, search)).toBe(Utils.pathWithQuery(path, search))
      expect(paths.projects.show).toHaveBeenCalledWith({ projectCode })
    })
  })

  describe('nextPath', () => {
    it('should throw not implemented error', () => {
      const page = new ConfirmPage()
      expect(() => page.next({ projectCode: '', appointmentId: '' })).toThrow(new Error('No next page configured'))
    })
  })

  describe('isAlertSelected', () => {
    it.each(['yes', 'no', undefined])(
      'converts the alertPractitioner query value to nullable boolean',
      (queryValue?: YesOrNo) => {
        const mockReturnValue = false
        jest.spyOn(GovUkRadioGroup, 'nullableValueFromYesOrNoItem').mockReturnValue(mockReturnValue)
        const page = new ConfirmPage()
        const result = page.isAlertSelected({ alertPractitioner: queryValue })
        expect(GovUkRadioGroup.nullableValueFromYesOrNoItem).toHaveBeenCalledWith(queryValue)
        expect(result).toEqual(mockReturnValue)
      },
    )
  })

  describe('deliusVersionChangedMessage', () => {
    it('should return singular form message for 1 appointment', () => {
      const page = new ConfirmPage()
      const appointment = appointmentFactory.build({
        offender: offenderFullFactory.build({
          forename: 'John',
          surname: 'Smith',
          crn: 'X123456',
        }),
      })

      const result = page.deliusVersionChangedMessage([appointment])

      expect(result).toBe(
        'The appointment for John Smith (X123456) has already been updated in the database. Try again.',
      )
    })

    it('should return plural form message for multiple appointments', () => {
      const page = new ConfirmPage()
      const appointments = [
        appointmentFactory.build({
          offender: offenderFullFactory.build({
            forename: 'John',
            surname: 'Smith',
            crn: 'X123456',
          }),
        }),
        appointmentFactory.build({
          offender: offenderFullFactory.build({
            forename: 'Jane',
            surname: 'Doe',
            crn: 'Y654321',
          }),
        }),
      ]

      const result = page.deliusVersionChangedMessage(appointments)

      expect(result).toBe(
        'The appointments for John Smith (X123456), Jane Doe (Y654321) have already been updated in the database. Try again.',
      )
    })
  })
})
