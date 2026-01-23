import { AppointmentDto } from '../../@types/shared'
import { GovUkRadioOption } from '../../@types/user-defined'
import GovUkRadioGroup from '../../forms/GovUkRadioGroup'
import Offender from '../../models/offender'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import LogCompliancePage, { LogComplianceQuery } from './logCompliancePage'
import * as Utils from '../../utils/utils'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'

jest.mock('../../models/offender')

describe('LogCompliancePage', () => {
  let page: LogCompliancePage
  let appointment: AppointmentDto
  const pathWithQuery = '/path?'

  beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(Utils, 'pathWithQuery').mockReturnValue(pathWithQuery)
  })

  describe('viewData', () => {
    const offenderMock: jest.Mock = Offender as unknown as jest.Mock<Offender>

    beforeEach(() => {
      page = new LogCompliancePage({})
      appointment = appointmentFactory.build()
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

      const result = page.viewData(appointment)

      expect(result.offender).toBe(offender)
    })

    it('should return an object containing a back link to the session page', async () => {
      const backLink = '/appointment/1'
      jest.spyOn(paths.appointments, 'logHours').mockReturnValue(backLink)

      const result = page.viewData(appointment)
      expect(result.backLink).toBe(pathWithQuery)
    })

    it('should return an object containing an update link for the form', async () => {
      const updatePath = '/update'
      jest.spyOn(paths.appointments, 'logCompliance').mockReturnValue(updatePath)

      const result = page.viewData(appointment)
      expect(paths.appointments.logCompliance).toHaveBeenCalledWith({
        appointmentId: appointment.id.toString(),
        projectCode: appointment.projectCode,
      })
      expect(result.updatePath).toBe(pathWithQuery)
    })

    describe('items', () => {
      it('should return items for hiVis', async () => {
        const items = ['items'] as unknown as GovUkRadioOption[]
        jest.spyOn(GovUkRadioGroup, 'yesNoItems').mockReturnValue(items)

        const result = page.viewData(appointment)
        expect(result.hiVisItems).toEqual(items)
      })

      it('should return items for workedIntensively', async () => {
        const items = ['items'] as unknown as GovUkRadioOption[]
        jest.spyOn(GovUkRadioGroup, 'yesNoItems').mockReturnValue(items)

        const result = page.viewData(appointment)
        expect(result.workedIntensivelyItems).toEqual(items)
      })

      describe('workQuality', () => {
        it('should return items for workQuality without checked answer', async () => {
          appointment = appointmentFactory.build({ attendanceData: { workQuality: null } })

          const result = page.viewData(appointment)
          expect(result.workQualityItems).toEqual([
            { text: 'Excellent', value: 'EXCELLENT', checked: false },
            { text: 'Good', value: 'GOOD', checked: false },
            { text: 'Satisfactory', value: 'SATISFACTORY', checked: false },
            { text: 'Unsatisfactory', value: 'UNSATISFACTORY', checked: false },
            { text: 'Poor', value: 'POOR', checked: false },
            { text: 'Not applicable', value: 'NOT_APPLICABLE', checked: false },
          ])
        })

        it('should return items for workQuality with checked answer', async () => {
          appointment = appointmentFactory.build({ attendanceData: { workQuality: 'GOOD' } })

          const result = page.viewData(appointment)
          expect(result.workQualityItems).toEqual([
            { text: 'Excellent', value: 'EXCELLENT', checked: false },
            { text: 'Good', value: 'GOOD', checked: true },
            { text: 'Satisfactory', value: 'SATISFACTORY', checked: false },
            { text: 'Unsatisfactory', value: 'UNSATISFACTORY', checked: false },
            { text: 'Poor', value: 'POOR', checked: false },
            { text: 'Not applicable', value: 'NOT_APPLICABLE', checked: false },
          ])
        })
      })

      describe('behaviour', () => {
        it('should return items for behaviour without checked answer', async () => {
          appointment = appointmentFactory.build({ attendanceData: { behaviour: null } })

          const result = page.viewData(appointment)
          expect(result.behaviourItems).toEqual([
            { text: 'Excellent', value: 'EXCELLENT', checked: false },
            { text: 'Good', value: 'GOOD', checked: false },
            { text: 'Satisfactory', value: 'SATISFACTORY', checked: false },
            { text: 'Unsatisfactory', value: 'UNSATISFACTORY', checked: false },
            { text: 'Poor', value: 'POOR', checked: false },
            { text: 'Not applicable', value: 'NOT_APPLICABLE', checked: false },
          ])
        })

        it('should return items for behaviour with checked answer', async () => {
          appointment = appointmentFactory.build({ attendanceData: { behaviour: 'UNSATISFACTORY' } })

          const result = page.viewData(appointment)
          expect(result.behaviourItems).toEqual([
            { text: 'Excellent', value: 'EXCELLENT', checked: false },
            { text: 'Good', value: 'GOOD', checked: false },
            { text: 'Satisfactory', value: 'SATISFACTORY', checked: false },
            { text: 'Unsatisfactory', value: 'UNSATISFACTORY', checked: true },
            { text: 'Poor', value: 'POOR', checked: false },
            { text: 'Not applicable', value: 'NOT_APPLICABLE', checked: false },
          ])
        })
      })
    })
  })

  describe('validate', () => {
    describe('when hiVis is not present', () => {
      it('should return the correct error', () => {
        page = new LogCompliancePage({ hiVis: null })
        page.validate()

        expect(page.validationErrors.hiVis).toEqual({
          text: 'Select whether a Hi-Vis was worn',
        })
        expect(page.hasError).toBe(true)
      })
    })

    describe('when workedIntensively is not present', () => {
      it('should return the correct error', () => {
        page = new LogCompliancePage({ workedIntensively: null })
        page.validate()

        expect(page.validationErrors.workedIntensively).toEqual({
          text: 'Select whether they worked intensively',
        })
        expect(page.hasError).toBe(true)
      })
    })

    describe('when workQuality is not present', () => {
      it('should return the correct error', () => {
        page = new LogCompliancePage({ workQuality: null })
        page.validate()

        expect(page.validationErrors.workQuality).toEqual({
          text: 'Select their work quality',
        })
        expect(page.hasError).toBe(true)
      })
    })

    describe('when behaviour is not present', () => {
      it('should return the correct error', () => {
        page = new LogCompliancePage({ behaviour: null })
        page.validate()

        expect(page.validationErrors.behaviour).toEqual({
          text: 'Select their behaviour',
        })
        expect(page.hasError).toBe(true)
      })
    })
  })

  describe('next', () => {
    it('should return confirm page link with given appointmentId', () => {
      const appointmentId = '1'
      const projectCode = '2'
      const nextPath = '/path'
      page = new LogCompliancePage({})

      jest.spyOn(paths.appointments, 'confirm').mockReturnValue(nextPath)

      expect(page.next(projectCode, appointmentId)).toBe(pathWithQuery)
      expect(paths.appointments.confirm).toHaveBeenCalledWith({ projectCode, appointmentId })
    })

    it('should return confirm page link with given appointmentId', () => {
      const appointmentId = '1'
      const projectCode = '2'
      const nextPath = '/path'
      const existingForm = appointmentOutcomeFormFactory.build()

      page = new LogCompliancePage({})
      page.updateForm(existingForm)

      jest.spyOn(paths.appointments, 'confirm').mockReturnValue(nextPath)

      expect(page.next(projectCode, appointmentId)).toBe(pathWithQuery)
      expect(paths.appointments.confirm).toHaveBeenCalledWith({ projectCode, appointmentId })
    })
  })

  describe('form', () => {
    beforeEach(() => {
      jest.spyOn(GovUkRadioGroup, 'valueFromYesOrNoItem').mockReturnValue(false)
    })

    it('updates and returns data from query given object with existing data', () => {
      const form = appointmentOutcomeFormFactory.build({ startTime: '10:00', attendanceData: { penaltyMinutes: 60 } })
      const query: LogComplianceQuery = {
        hiVis: 'no',
        workedIntensively: 'no',
        workQuality: 'EXCELLENT',
        behaviour: 'GOOD',
        notes: 'good',
      }

      page = new LogCompliancePage(query)

      const result = page.updateForm(form)

      const expected = {
        ...form,
        startTime: '10:00',
        attendanceData: {
          penaltyMinutes: 60,
          hiVisWorn: false,
          workedIntensively: false,
          workQuality: 'EXCELLENT',
          behaviour: 'GOOD',
        },
        notes: 'good',
      }

      expect(result).toEqual(expected)
      expect(page.form).toEqual(expected)
    })
  })
})
