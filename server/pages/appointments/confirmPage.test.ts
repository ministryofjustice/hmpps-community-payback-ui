import { AppointmentDto } from '../../@types/shared'
import Offender from '../../models/offender'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import ConfirmPage from './confirmPage'
import * as Utils from '../../utils/utils'
import { AppointmentOutcomeForm } from '../../@types/user-defined'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import { contactOutcomeFactory } from '../../testutils/factories/contactOutcomeFactory'

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
      it('should return an object containing a back link to the compliance page if attended and no enforcement required', async () => {
        jest.spyOn(paths.appointments, 'logCompliance')
        const formWithoutEnforcement = appointmentOutcomeFormFactory.build({
          contactOutcome: contactOutcomeFactory.build({ attended: true, enforceable: false }),
        })

        const result = page.viewData(appointment, formWithoutEnforcement)
        expect(paths.appointments.logCompliance).toHaveBeenCalledWith({ appointmentId: appointment.id.toString() })
        expect(result.backLink).toBe(pathWithQuery)
      })

      it('should return an object containing a back link to the enforcement page if enforcement required', async () => {
        jest.spyOn(paths.appointments, 'enforcement')
        const formWithEnforcement = appointmentOutcomeFormFactory.build({
          contactOutcome: contactOutcomeFactory.build({ enforceable: true }),
        })

        const result = page.viewData(appointment, formWithEnforcement)
        expect(paths.appointments.enforcement).toHaveBeenCalledWith({ appointmentId: appointment.id.toString() })
        expect(result.backLink).toBe(pathWithQuery)
      })

      it('should return an object containing a back link to the log hours page if no enforcement required ad did not attend', async () => {
        jest.spyOn(paths.appointments, 'logHours')
        const formWithoutEnforcement = appointmentOutcomeFormFactory.build({
          contactOutcome: contactOutcomeFactory.build({ enforceable: false, attended: false }),
        })

        const result = page.viewData(appointment, formWithoutEnforcement)
        expect(paths.appointments.logHours).toHaveBeenCalledWith({ appointmentId: appointment.id.toString() })
        expect(result.backLink).toBe(pathWithQuery)
      })
    })

    it('should return an object containing an update link for the form', async () => {
      jest.spyOn(paths.appointments, 'confirm')

      const result = page.viewData(appointment, form)
      expect(paths.appointments.confirm).toHaveBeenCalledWith({ appointmentId: appointment.id.toString() })
      expect(result.updatePath).toBe(pathWithQuery)
    })

    describe('submittedItems', () => {
      it('should return an object containing summary list items', async () => {
        const contactOutcome = contactOutcomeFactory.build({ attended: false, enforceable: false })
        const submitted = appointmentOutcomeFormFactory.build({
          contactOutcome,
          enforcement: undefined,
        })
        const result = page.viewData(appointment, submitted)
        expect(result.submittedItems).toEqual([
          {
            key: {
              text: 'Supervising officer',
            },
            value: {
              text: submitted.supervisorOfficerCode,
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
              text: 'Start and end time',
            },
            value: {
              html: '09:00 - 17:00<br>Total hours worked: 8 hours',
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
          {
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
          },
        ])
      })

      describe('compliance answers', () => {
        describe('when hiVisWorn is not present', () => {
          it('returns `Not applicable`', () => {
            const formComplianceAnswers = appointmentOutcomeFormFactory.build({ attendanceData: { hiVisWorn: null } })

            const result = page.getComplianceAnswers(formComplianceAnswers)
            expect(result).toMatch('High-vis - Not applicable')
          })
        })

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
          const formWithoutPenaltyHours = appointmentOutcomeFormFactory.build({ attendanceData: { penaltyTime: null } })
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

      describe('when there is 00:00 penalty time applied', () => {
        it('should return string containing full hours worked', () => {
          const formWithZeroPenaltyHours = appointmentOutcomeFormFactory.build({
            attendanceData: { penaltyTime: '00:00' },
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

      it('should contain enforcement item if contact outcome is enforceable and enforcement has value', async () => {
        const contactOutcome = contactOutcomeFactory.build({ enforceable: true })
        const formWithEnforcement = appointmentOutcomeFormFactory.build({
          contactOutcome,
          enforcement: { action: { name: 'Some enforcement' } },
        })
        const result = page.viewData(appointment, formWithEnforcement)
        expect(result.submittedItems).toContainEqual({
          key: {
            text: 'Enforcement',
          },
          value: {
            text: 'Some enforcement',
          },
          actions: {
            items: [
              {
                href: pathWithQuery,
                text: 'Change',
                visuallyHiddenText: 'enforcement action',
              },
            ],
          },
        })
      })

      it('should contain compliance data if contact outcome is attended', () => {
        const contactOutcome = contactOutcomeFactory.build({ attended: true, enforceable: false })
        const submitted = appointmentOutcomeFormFactory.build({
          enforcement: undefined,
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
    })
  })
})
