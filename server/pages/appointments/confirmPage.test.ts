import { AppointmentDto } from '../../@types/shared'
import Offender from '../../models/offender'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import ConfirmPage from './confirmPage'
import * as Utils from '../../utils/utils'
import { AppointmentOutcomeForm, YesOrNo } from '../../@types/user-defined'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import { contactOutcomeFactory } from '../../testutils/factories/contactOutcomeFactory'
import DateTimeFormats from '../../utils/dateTimeUtils'
import projectFactory from '../../testutils/factories/projectFactory'
import GovUkRadioGroup from '../../forms/GovUkRadioGroup'

jest.mock('../../models/offender')

describe('ConfirmPage', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('viewData', () => {
    let page: ConfirmPage
    let appointment: AppointmentDto
    let form: AppointmentOutcomeForm
    const offenderMock: jest.Mock = Offender as unknown as jest.Mock<Offender>
    const pathWithQuery = '/path?'

    beforeEach(() => {
      page = new ConfirmPage({})
      appointment = appointmentFactory.build()
      form = appointmentOutcomeFormFactory.build()
      jest.spyOn(Utils, 'pathWithQuery').mockReturnValue(pathWithQuery)
    })

    it('should return an object containing offender', () => {
      const offender = {
        name: 'Sam Smith',
        crn: 'CRN123',
        isLimited: false,
      }

      offenderMock.mockImplementation(() => {
        return offender
      })

      const result = page.viewData(appointment, form)

      expect(result.offender).toBe(offender)
    })

    describe('back link', () => {
      it('should return an object containing a back link to the compliance page if attended', async () => {
        jest.spyOn(paths.appointments, 'logCompliance')
        const formWithoutEnforcement = appointmentOutcomeFormFactory.build({
          contactOutcome: contactOutcomeFactory.build({ attended: true }),
        })

        const result = page.viewData(appointment, formWithoutEnforcement)
        expect(paths.appointments.logCompliance).toHaveBeenCalledWith({
          projectCode: appointment.projectCode,
          appointmentId: appointment.id.toString(),
        })
        expect(result.backLink).toBe(pathWithQuery)
      })

      it('should return an object containing a back link to the log hours page if did not attend', async () => {
        jest.spyOn(paths.appointments, 'logHours')
        const formWithoutEnforcement = appointmentOutcomeFormFactory.build({
          contactOutcome: contactOutcomeFactory.build({ attended: false }),
        })

        const result = page.viewData(appointment, formWithoutEnforcement)
        expect(paths.appointments.logHours).toHaveBeenCalledWith({
          projectCode: appointment.projectCode,
          appointmentId: appointment.id.toString(),
        })
        expect(result.backLink).toBe(pathWithQuery)
      })
    })

    it('should return an object containing an update link for the form', async () => {
      jest.spyOn(paths.appointments, 'confirm')

      const result = page.viewData(appointment, form)
      expect(paths.appointments.confirm).toHaveBeenCalledWith({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
      })
      expect(result.updatePath).toBe(pathWithQuery)
    })

    describe('alertPractitionerItems', () => {
      it('should return an object containing alert practitioner question items if contact outcome will alert', () => {
        form = appointmentOutcomeFormFactory.build({
          contactOutcome: { code: 'some-code', willAlertEnforcementDiary: true },
        })

        const result = page.viewData(appointment, form)
        expect(result.alertPractitionerItems).toEqual([])
      })

      it('should return an object containing empty alert practitioner question items if contact outcome will not alert', () => {
        form = appointmentOutcomeFormFactory.build({
          contactOutcome: { code: 'some-code', willAlertEnforcementDiary: false },
        })
        const items = [{ text: 'Yes', value: 'yes' }]
        jest.spyOn(GovUkRadioGroup, 'yesNoItems').mockReturnValue(items)
        const result = page.viewData(appointment, form)
        expect(result.alertPractitionerItems).toEqual(items)
      })
    })

    describe('submittedItems', () => {
      afterEach(() => {
        jest.restoreAllMocks()
      })

      it('should return an object containing summary list items', async () => {
        const hours = '0'
        jest.spyOn(DateTimeFormats, 'timeBetween').mockReturnValue(hours)

        const notes = 'some notes'
        const contactOutcome = contactOutcomeFactory.build({ attended: false, enforceable: false })
        const submitted = appointmentOutcomeFormFactory.build({
          contactOutcome,
          notes,
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
              text: 'Attendance',
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
          },
          {
            key: {
              text: 'Notes',
            },
            value: {
              html: notes,
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
              text: 'Start and end time',
            },
            value: {
              html: `09:00 - 17:00<br>Total hours worked: ${hours}`,
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
          },
        ])
      })

      it('should record logged hours for attendance outcomes', async () => {
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
              html: `09:00 - 17:00<br>Total hours worked: ${hours}`,
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

      it('should record no logged hours for non-attendance outcomes', async () => {
        const hours = '0'
        jest.spyOn(DateTimeFormats, 'timeBetween').mockReturnValue(hours)

        const contactOutcome = contactOutcomeFactory.build({ attended: false, enforceable: false })
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
              html: `09:00 - 17:00<br>Total hours worked: ${hours}`,
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

      describe('compliance answers', () => {
        describe('when hiVisWorn is true', () => {
          it('returns `Yes`', () => {
            const formComplianceAnswers = appointmentOutcomeFormFactory.build({ attendanceData: { hiVisWorn: true } })

            const result = page.getComplianceAnswers(formComplianceAnswers)
            expect(result).toMatch('High-vis - Yes')
          })
        })

        describe('when hiVisWorn is false', () => {
          it('returns `No`', () => {
            const formComplianceAnswers = appointmentOutcomeFormFactory.build({ attendanceData: { hiVisWorn: false } })

            const result = page.getComplianceAnswers(formComplianceAnswers)
            expect(result).toMatch('High-vis - No')
          })
        })

        describe('when workedIntensively is false', () => {
          it('returns `No`', () => {
            const formComplianceAnswers = appointmentOutcomeFormFactory.build({
              attendanceData: { workedIntensively: false },
            })

            const result = page.getComplianceAnswers(formComplianceAnswers)
            expect(result).toMatch('Worked intensively - No')
          })
        })

        describe('when workedIntensively is true', () => {
          it('returns `Yes`', () => {
            const formComplianceAnswers = appointmentOutcomeFormFactory.build({
              attendanceData: { workedIntensively: true },
            })

            const result = page.getComplianceAnswers(formComplianceAnswers)
            expect(result).toMatch('Worked intensively - Yes')
          })
        })

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

      describe('when there is no penalty time applied', () => {
        it('should return string containing full hours worked', () => {
          const contactOutcome = contactOutcomeFactory.build({ attended: true })
          const formWithoutPenaltyHours = appointmentOutcomeFormFactory.build({
            contactOutcome,
            attendanceData: { penaltyMinutes: null },
          })
          const result = page.viewData(appointment, formWithoutPenaltyHours)

          expect(result.submittedItems).toContainEqual({
            key: { text: 'Penalty hours' },
            value: { html: 'No penalty time applied<br>Total hours credited: 8 hours' },
            actions: {
              items: [
                {
                  href: pathWithQuery,
                  text: 'Change',
                  visuallyHiddenText: 'penalty hours',
                },
              ],
            },
          })
        })
      })

      describe('when there is 0 minutes penalty time applied', () => {
        it('should return string containing full hours worked', () => {
          const contactOutcome = contactOutcomeFactory.build({ attended: true })
          const formWithZeroPenaltyHours = appointmentOutcomeFormFactory.build({
            contactOutcome,
            attendanceData: { penaltyMinutes: 0 },
          })
          const result = page.viewData(appointment, formWithZeroPenaltyHours)

          expect(result.submittedItems).toContainEqual({
            key: { text: 'Penalty hours' },
            value: { html: 'No penalty time applied<br>Total hours credited: 8 hours' },
            actions: {
              items: [
                {
                  href: pathWithQuery,
                  text: 'Change',
                  visuallyHiddenText: 'penalty hours',
                },
              ],
            },
          })
        })
      })

      it('should contain penalty hours item if contact outcome is attended', async () => {
        const contactOutcome = contactOutcomeFactory.build({ attended: true })
        const formWithEnforcement = appointmentOutcomeFormFactory.build({
          contactOutcome,
          attendanceData: { penaltyMinutes: 60 },
        })
        const result = page.viewData(appointment, formWithEnforcement)
        expect(result.submittedItems).toContainEqual({
          key: {
            text: 'Penalty hours',
          },
          value: {
            html: '1 hour<br>Total hours credited: 7 hours',
          },
          actions: {
            items: [
              {
                href: pathWithQuery,
                text: 'Change',
                visuallyHiddenText: 'penalty hours',
              },
            ],
          },
        })
      })

      it('should contain compliance data if contact outcome is attended', () => {
        const contactOutcome = contactOutcomeFactory.build({ attended: true })
        const submitted = appointmentOutcomeFormFactory.build({
          contactOutcome,
          attendanceData: { hiVisWorn: true, workedIntensively: true },
        })
        const result = page.viewData(appointment, submitted).submittedItems

        expect(result).toContainEqual({
          key: {
            text: 'Compliance',
          },
          value: {
            html: 'High-vis - Yes<br>Worked intensively - Yes<br>Work quality - Good<br>Behaviour - Not applicable',
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
            html: 'test',
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
    })
  })

  describe('exitForm', () => {
    it('should return session link if project type is "GROUP"', () => {
      const projectCode = '2'
      const path = '/path'
      const page = new ConfirmPage({})

      jest.spyOn(paths.sessions, 'show').mockReturnValue(path)
      const appointment = appointmentFactory.build({ projectCode })
      expect(page.exitForm(appointment, projectFactory.build())).toBe(path)
      expect(paths.sessions.show).toHaveBeenCalledWith({ projectCode, date: appointment.date })
    })

    it('should return project link if project type is "INDIVIDUAL"', () => {
      const projectCode = '2'
      const path = '/path'
      const page = new ConfirmPage({})

      jest.spyOn(paths.projects, 'show').mockReturnValue(path)
      const appointment = appointmentFactory.build({ projectCode })
      const project = projectFactory.build({ projectType: { group: 'INDIVIDUAL' } })
      expect(page.exitForm(appointment, project)).toBe(path)
      expect(paths.projects.show).toHaveBeenCalledWith({ projectCode })
    })
  })

  describe('nextPath', () => {
    it('should throw not implemented error', () => {
      const page = new ConfirmPage({})
      expect(() => page.next('', '')).toThrow(new Error('Method not implemented'))
    })
  })

  describe('isAlertSelected', () => {
    it.each(['yes', 'no', undefined])(
      'converts the alertPractitioner query value to nullable boolean',
      (queryValue?: YesOrNo) => {
        const mockReturnValue = false
        jest.spyOn(GovUkRadioGroup, 'nullableValueFromYesOrNoItem').mockReturnValue(mockReturnValue)
        const page = new ConfirmPage({ alertPractitioner: queryValue })
        const result = page.isAlertSelected
        expect(GovUkRadioGroup.nullableValueFromYesOrNoItem).toHaveBeenCalledWith(queryValue)
        expect(result).toEqual(mockReturnValue)
      },
    )
  })
})
