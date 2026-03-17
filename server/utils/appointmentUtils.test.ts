import appointmentSummaryFactory from '../testutils/factories/appointmentSummaryFactory'
import AppointmentUtils from './appointmentUtils'
import DateTimeFormats from './dateTimeUtils'

describe('AppointmentUtils', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })
  describe('appointmentCard', () => {
    it('returns formatted appointment properties', () => {
      const date = '12 January 2026'
      const timeCreditedParts = { hours: 3, minutes: 54 }
      const timeCredited = '3 hours 54 minutes'
      jest.spyOn(DateTimeFormats, 'isoDateToUIDate').mockReturnValue(date)
      jest.spyOn(DateTimeFormats, 'totalMinutesToHoursAndMinutesNumberParts').mockReturnValue(timeCreditedParts)
      jest.spyOn(DateTimeFormats, 'hoursAndMinutesToHumanReadable').mockReturnValue(timeCredited)

      const appointment = appointmentSummaryFactory.build()

      const result = AppointmentUtils.appointmentCard(appointment)

      expect(result).toEqual({
        title: '12 January 2026',
        rows: [
          { key: { text: 'Time credited' }, value: { text: '3 hours 54 minutes' } },
          { key: { text: 'Outcome' }, value: { text: appointment.contactOutcome.name } },
        ],
      })

      expect(DateTimeFormats.isoDateToUIDate).toHaveBeenCalledWith(appointment.date)
      expect(DateTimeFormats.totalMinutesToHoursAndMinutesNumberParts).toHaveBeenCalledWith(
        appointment.completedMinutes,
      )
      expect(DateTimeFormats.hoursAndMinutesToHumanReadable).toHaveBeenCalledWith(
        timeCreditedParts.hours,
        timeCreditedParts.minutes,
      )
    })

    it('returns fallback title date if date is undefined', () => {
      jest.spyOn(DateTimeFormats, 'totalMinutesToHoursAndMinutesNumberParts').mockReturnValue({ hours: 3, minutes: 2 })
      const appointment = appointmentSummaryFactory.build({ date: undefined })

      const result = AppointmentUtils.appointmentCard(appointment)

      expect(result.title).toBe('Appointment details')
    })

    it('returns fallback outcome value if contact outcome is undefined', () => {
      jest.spyOn(DateTimeFormats, 'totalMinutesToHoursAndMinutesNumberParts').mockReturnValue({ hours: 3, minutes: 2 })
      const appointment = appointmentSummaryFactory.build({ contactOutcome: undefined })

      const result = AppointmentUtils.appointmentCard(appointment)

      expect(result.rows[1].value).toEqual({ text: 'Not entered' })
    })
  })
})
