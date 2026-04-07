import HoursAndMinutesInput from './hoursAndMinutesInput'
import * as Utils from '../utils/utils'

describe('HoursAndMinutesInput', () => {
  describe('validate', () => {
    it('should not return error for hours or minutes if hours is present', () => {
      const result = HoursAndMinutesInput.validationErrors({ hours: '2' }, 'credited hours')
      expect(result.hours).toBeUndefined()
      expect(result.minutes).toBeUndefined()
    })

    it('should not return error for hours or minutes if minutes is present', () => {
      const result = HoursAndMinutesInput.validationErrors({ minutes: '2' }, 'credited hours')
      expect(result.minutes).toBeUndefined()
      expect(result.hours).toBeUndefined()
    })

    it.each([undefined, ''])('should return an error if no hours or minutes', (value?: string) => {
      const result = HoursAndMinutesInput.validationErrors({ hours: value }, 'credited hours')
      expect(result.hours).toEqual({ text: 'Enter hours and minutes for credited hours' })
    })

    it('should return an error for invalid hours and minutes', () => {
      jest.spyOn(Utils, 'isWholePositiveNumber').mockReturnValue(false)
      const result = HoursAndMinutesInput.validationErrors({ hours: 'hello', minutes: 'world' }, 'credited hours')

      expect(result.hours).toEqual({
        text: 'Enter valid hours for credited hours, for example 2',
      })
      expect(result.minutes).toEqual({
        text: 'Enter valid minutes for credited hours, for example 30',
      })
    })

    it('should not return an error for valid hours and minutes inputs', () => {
      jest.spyOn(Utils, 'isWholePositiveNumber').mockReturnValue(true)

      const result = HoursAndMinutesInput.validationErrors({ hours: '5', minutes: '40' }, 'credited hours')

      expect(result.hours).toBeUndefined()
      expect(result.minutes).toBeUndefined()
    })

    it('should return error if minutes is above 59', () => {
      jest.spyOn(Utils, 'isWholePositiveNumber').mockReturnValue(true)
      const result = HoursAndMinutesInput.validationErrors({ hours: '', minutes: '60' }, 'credited hours')

      expect(result.minutes).toEqual({
        text: 'Enter valid minutes for credited hours, for example 30',
      })
    })
  })
})
