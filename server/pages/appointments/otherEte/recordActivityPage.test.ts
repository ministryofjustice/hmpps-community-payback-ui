import RecordActivityPage, { RecordActivityContext } from './recordActivityPage'
import recordActivityFormFactory from '../../../testutils/factories/recordActivityFormFactory'
import unpaidWorkDetailsFactory from '../../../testutils/factories/unpaidWorkDetailsFactory'
import { contactOutcomeFactory } from '../../../testutils/factories/contactOutcomeFactory'
import UnpaidWorkUtils from '../../../utils/unpaidWorkUtils'
import StartAndEndTimeQuestion from '../../../utils/components/startAndEndTimeQuestion'

describe('RecordActivityPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('validate', () => {
    const validBody = {
      date: '15/1/2026',
      startTime: '09:00',
      endTime: '17:00',
      attendanceOutcome: 'ATTENDED',
    }

    beforeEach(() => {
      jest.spyOn(StartAndEndTimeQuestion, 'validate').mockReturnValue({})
    })

    it('returns no errors for a valid body', () => {
      expect(RecordActivityPage.validate(validBody)).toEqual({})
    })

    it('returns an error when the date is missing', () => {
      const result = RecordActivityPage.validate({ ...validBody, date: undefined })

      expect(result).toEqual({ date: { text: 'Enter or select a date' } })
    })

    it('returns an error when the date is in the future', () => {
      const result = RecordActivityPage.validate({ ...validBody, date: '15/1/2099' })

      expect(result).toEqual({ date: { text: 'Date must not be in the future' } })
    })

    it('returns no start or end time errors when StartAndEndTimeQuestion returns no errors', () => {
      jest.spyOn(StartAndEndTimeQuestion, 'validate').mockReturnValue({})
      const result = RecordActivityPage.validate(validBody)

      expect(result).toEqual({})
      expect(StartAndEndTimeQuestion.validate).toHaveBeenCalledWith(validBody)
    })

    it('returns only a start time error when StartAndEndTimeQuestion returns only a start time error', () => {
      const errors = { startTime: { text: 'Enter a start time' } }
      jest.spyOn(StartAndEndTimeQuestion, 'validate').mockReturnValue(errors)

      const result = RecordActivityPage.validate(validBody)

      expect(result.startTime).toEqual(errors.startTime)
      expect(result.endTime).toBeUndefined()
    })

    it('returns both start and end time errors when StartAndEndTimeQuestion returns both errors', () => {
      const errors = { startTime: { text: 'Enter a start time' }, endTime: { text: 'Enter an end time' } }
      jest.spyOn(StartAndEndTimeQuestion, 'validate').mockReturnValue(errors)

      const result = RecordActivityPage.validate(validBody)

      expect(result.startTime).toEqual(errors.startTime)
      expect(result.endTime).toEqual(errors.endTime)
    })

    it('returns an error when no attendance outcome is selected', () => {
      const result = RecordActivityPage.validate({ ...validBody, attendanceOutcome: undefined })

      expect(result).toEqual({ attendanceOutcome: { text: 'Select an attendance outcome' } })
    })

    it('returns an error when the notes are invalid', () => {
      const result = RecordActivityPage.validate({ ...validBody, notes: 'a'.repeat(4001) })

      expect(result).toEqual({ notes: { text: 'Notes must be 4000 characters or less' } })
    })
  })

  describe('viewData', () => {
    const attendedOutcome = contactOutcomeFactory.build({ code: 'ATTENDED' })
    const requirement = unpaidWorkDetailsFactory.build({ eventNumber: 2 })
    const contextData = { contactOutcomes: [attendedOutcome], unpaidWorkDetails: [requirement] }

    beforeEach(() => {
      jest.spyOn(StartAndEndTimeQuestion, 'viewData').mockReturnValue({ startTime: '09:00', endTime: '17:00' })
    })

    it('echoes the query values when present', () => {
      const form = recordActivityFormFactory.build({ deliusEventNumber: '2' })
      const query = {
        date: '15/1/2026',
        startTime: '09:00',
        endTime: '17:00',
        attendanceOutcome: attendedOutcome.code,
      }

      const result = RecordActivityPage.viewData(form, contextData, query)

      expect(result).toEqual(
        expect.objectContaining({
          date: '15/1/2026',
          startTime: '09:00',
          endTime: '17:00',
          items: [{ text: attendedOutcome.name, value: attendedOutcome.code, checked: true }],
          requirementDetailsItems: UnpaidWorkUtils.unpaidWorkHoursDetails(requirement, true),
        }),
      )
      expect(StartAndEndTimeQuestion.viewData).toHaveBeenCalledWith(form, query)
    })

    it('falls back to values already saved on the form when there is no query', () => {
      const form = recordActivityFormFactory.build({
        deliusEventNumber: '2',
        date: '2026-01-15',
        startTime: '09:00',
        endTime: '17:00',
        contactOutcome: attendedOutcome,
      })

      const result = RecordActivityPage.viewData(form, contextData)

      expect(result).toEqual(
        expect.objectContaining({
          date: '15/01/2026',
          startTime: '09:00',
          endTime: '17:00',
          items: [{ text: attendedOutcome.name, value: attendedOutcome.code, checked: true }],
        }),
      )
      expect(StartAndEndTimeQuestion.viewData).toHaveBeenCalledWith(form, {})
    })

    it('returns no requirement details when the requirement cannot be found', () => {
      const form = recordActivityFormFactory.build({ deliusEventNumber: '999' })

      const result = RecordActivityPage.viewData(form, contextData)

      expect(result).toEqual(expect.objectContaining({ requirementDetailsItems: undefined }))
    })
  })

  describe('updateFormData', () => {
    it('merges the parsed date, padded times, notes and matched contact outcome into the form', () => {
      const attendedOutcome = contactOutcomeFactory.build({ code: 'ATTENDED' })
      const form = recordActivityFormFactory.build()
      const contextData: RecordActivityContext = { contactOutcomes: [attendedOutcome], unpaidWorkDetails: [] }

      const result = RecordActivityPage.updateFormData(
        form,
        {
          date: '15/1/2026',
          startTime: '9:00',
          endTime: '17:00',
          attendanceOutcome: attendedOutcome.code,
          notes: 'Some notes',
        },
        contextData,
      )

      expect(result).toEqual({
        ...form,
        date: '2026-01-15',
        startTime: '09:00',
        endTime: '17:00',
        notes: 'Some notes',
        isSensitive: undefined,
        contactOutcome: attendedOutcome,
      })
    })
  })
})
