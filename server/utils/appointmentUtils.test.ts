import appointmentSummaryFactory from '../testutils/factories/appointmentSummaryFactory'
import AppointmentUtils from './appointmentUtils'
import DateTimeFormats from './dateTimeUtils'

describe('AppointmentUtils', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })
  describe('appointmentCard', () => {
    it.each([0, 300])('returns formatted appointment properties', (minutesCredited: number) => {
      const date = '12 January 2026'
      const timeCreditedParts = { hours: 3, minutes: 54 }
      const timeCredited = '3 hours 54 minutes'
      jest.spyOn(DateTimeFormats, 'isoDateToUIDate').mockReturnValue(date)
      jest.spyOn(DateTimeFormats, 'totalMinutesToHoursAndMinutesNumberParts').mockReturnValue(timeCreditedParts)
      jest.spyOn(DateTimeFormats, 'hoursAndMinutesToHumanReadable').mockReturnValue(timeCredited)

      const appointment = appointmentSummaryFactory.build({ minutesCredited })

      const result = AppointmentUtils.appointmentCard(appointment)

      expect(result).toEqual({
        title: '12 January 2026',
        rows: [
          { key: { text: 'Project type' }, value: { text: appointment.projectTypeName } },
          { key: { text: 'Project' }, value: { text: appointment.projectName } },
          { key: { text: 'Time credited' }, value: { text: '3 hours 54 minutes' } },
          { key: { text: 'Outcome' }, value: { text: appointment.contactOutcome.name } },
          { key: { text: 'Notes' }, value: { html: appointment.notes } },
        ],
      })

      expect(DateTimeFormats.isoDateToUIDate).toHaveBeenCalledWith(appointment.date)
      expect(DateTimeFormats.totalMinutesToHoursAndMinutesNumberParts).toHaveBeenCalledWith(minutesCredited)
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

      expect(result.rows[3].value).toEqual({ text: 'Not entered' })
    })

    it.each([null, undefined])(
      'returns empty text if minutesCredited is null or undefined',
      (minutesCredited?: number) => {
        const appointment = appointmentSummaryFactory.build({ minutesCredited })
        const result = AppointmentUtils.appointmentCard(appointment)

        expect(result.rows[2].value).toEqual({ text: '' })
      },
    )

    it('returns notes with line breaks', () => {
      jest.spyOn(DateTimeFormats, 'totalMinutesToHoursAndMinutesNumberParts').mockReturnValue({ hours: 3, minutes: 2 })
      const appointment = appointmentSummaryFactory.build({ notes: 'note 1\nnote 2\nnote 3' })

      const result = AppointmentUtils.appointmentCard(appointment)

      expect(result.rows[4].value).toEqual({ html: 'note 1<br/>note 2<br/>note 3' })
    })
  })
})
