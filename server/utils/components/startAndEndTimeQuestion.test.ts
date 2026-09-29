import StartAndEndTimeQuestion from './startAndEndTimeQuestion'

describe('StartAndEndTimeQuestion', () => {
  describe('viewData', () => {
    it('echoes the query values when present', () => {
      const form = { startTime: '09:00:00', endTime: '17:00:00' }

      const result = StartAndEndTimeQuestion.viewData(form, { startTime: '10:00', endTime: '18:00' })

      expect(result).toEqual({ startTime: '10:00', endTime: '18:00' })
    })

    it('falls back to the stripped form values when there is no query', () => {
      const form = { startTime: '09:00:00', endTime: '17:00:00' }

      const result = StartAndEndTimeQuestion.viewData(form)

      expect(result).toEqual({ startTime: '09:00', endTime: '17:00' })
    })

    it('returns empty strings when the form values are undefined', () => {
      const form: { startTime?: string; endTime?: string } = { startTime: undefined, endTime: undefined }

      const result = StartAndEndTimeQuestion.viewData(form)

      expect(result).toEqual({ startTime: '', endTime: '' })
    })
  })

  describe('getAnswerSummary', () => {
    it('returns the time period and hours credited as html paragraphs', () => {
      const result = StartAndEndTimeQuestion.getAnswerSummary({ startTime: '09:00', endTime: '17:00' })

      expect(result).toEqual('<p>09:00 - 17:00</p><p>Hours credited: 8 hours</p>')
    })
  })

  describe('validate', () => {
    const validBody = {
      startTime: '09:00',
      endTime: '17:00',
    }

    it('returns no errors for a valid body', () => {
      expect(StartAndEndTimeQuestion.validate(validBody)).toEqual({})
    })

    it('returns an error when the start time is missing', () => {
      const result = StartAndEndTimeQuestion.validate({ ...validBody, startTime: undefined })

      expect(result).toEqual({ startTime: { text: 'Enter a start time' } })
    })

    it('returns an error when the start time is invalid', () => {
      const result = StartAndEndTimeQuestion.validate({ ...validBody, startTime: '25:00' })

      expect(result).toEqual({ startTime: { text: 'Enter a valid start time, for example 09:00' } })
    })

    it('returns an error when the end time is missing', () => {
      const result = StartAndEndTimeQuestion.validate({ ...validBody, endTime: undefined })

      expect(result).toEqual({ endTime: { text: 'Enter an end time' } })
    })

    it('returns an error when the end time is invalid', () => {
      const result = StartAndEndTimeQuestion.validate({ ...validBody, endTime: '25:00' })

      expect(result).toEqual({ endTime: { text: 'Enter a valid end time, for example 17:00' } })
    })

    it('returns an error when the end time is before the start time', () => {
      const result = StartAndEndTimeQuestion.validate({ startTime: '17:00', endTime: '09:00' })

      expect(result).toEqual({ startTime: { text: 'Start time should be before 09:00' } })
    })
  })
})
