import Offender from '../models/offender'
import paths from '../paths'
import offenderFullFactory from '../testutils/factories/offenderFullFactory'
import AdjustHoursPage from './adjustHoursPage'
import Utils from '../utils/dateTimeUtils'
import adjustmentReasonFactory from '../testutils/factories/adjustmentReasonFactory'

describe('AdjustHoursPage', () => {
  const deliusEventNumber = '1'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getValidationErrors', () => {
    it('returns an error when date is missing', () => {
      const page = new AdjustHoursPage()
      const req = { body: { minutes: '30', reasonCode: 'H' } }
      expect(page.validationErrors(req.body).errors).toEqual({ date: { text: 'Enter or select a date' } })
    })

    it('returns an error when reasonCode is missing', () => {
      const page = new AdjustHoursPage()
      const req = { body: { minutes: '30', date: '01/01/2026', reasonCode: undefined as string } }
      expect(page.validationErrors(req.body).errors).toEqual({ reasonCode: { text: 'Select a reason' } })
    })

    it('returns an error when hours and minutes are missing', () => {
      const page = new AdjustHoursPage()
      const req = { body: { date: '01/01/2026', reasonCode: 'H' } }
      expect(page.validationErrors(req.body).errors).toEqual({
        hours: { text: 'Enter hours and minutes for time taken off' },
      })
    })
  })

  describe('viewData', () => {
    describe('when values are coming from formdata', () => {
      it('renders appropriate data', () => {
        const hours = '1'
        const minutes = '30'
        const offender = new Offender(offenderFullFactory.build())
        const date = '2026-01-01'

        const page = new AdjustHoursPage()

        jest.spyOn(Utils, 'isoDateToUIDate').mockReturnValue(date)

        const view = page.viewData({
          offender,
          body: null,
          adjustmentReasons: [],
          deliusEventNumber,
          formData: {
            adjustmentDate: '2026-01-01',
            adjustmentReasonId: 'H',
            minutes: 90,
          },
        })

        expect(view).toEqual({
          heading: {
            title: offender.name,
            caption: offender.crn,
          },
          timeToCredit: {
            hours,
            minutes,
          },
          date,
          adjustmentOptions: [],
          backLink: paths.people.appointments({ crn: offender.crn, deliusEventNumber, appointmentSection: 'upcoming' }),
          updatePath: paths.people.adjustHours.update({ crn: offender.crn, deliusEventNumber }),
        })
      })
    })

    describe('when values are coming from the body', () => {
      it('renders appropriate data', () => {
        const hours = '1'
        const minutes = '30'
        const offender = new Offender(offenderFullFactory.build())

        const page = new AdjustHoursPage()

        const view = page.viewData({
          offender,
          body: { date: '2026-01-01', hours, minutes, reasonCode: 'H' },
          adjustmentReasons: [],
          deliusEventNumber,
        })

        expect(view).toEqual({
          heading: {
            title: offender.name,
            caption: offender.crn,
          },
          timeToCredit: {
            hours,
            minutes,
          },
          date: '2026-01-01',
          adjustmentOptions: [],
          backLink: paths.people.appointments({ crn: offender.crn, deliusEventNumber, appointmentSection: 'upcoming' }),
          updatePath: paths.people.adjustHours.update({ crn: offender.crn, deliusEventNumber }),
        })
      })
    })

    describe('adjustment reasons', () => {
      it('renders adjustment reasons', () => {
        const offender = new Offender(offenderFullFactory.build())
        const adjustmentReasons = [adjustmentReasonFactory.build({ deliusCode: 'H' }), adjustmentReasonFactory.build()]

        const page = new AdjustHoursPage()

        const view = page.viewData({
          offender,
          body: null,
          adjustmentReasons,
          deliusEventNumber,
        })

        expect(view.adjustmentOptions).toEqual([
          expect.objectContaining({
            text: adjustmentReasons[0].name,
            value: adjustmentReasons[0].id,
            checked: false,
          }),
        ])
      })

      it('renders adjustment reasons with a checked option from the body', () => {
        const offender = new Offender(offenderFullFactory.build())
        const adjustmentReasons = [
          adjustmentReasonFactory.build({ id: 'H', deliusCode: 'H' }),
          adjustmentReasonFactory.build(),
        ]

        const page = new AdjustHoursPage()

        const view = page.viewData({
          offender,
          body: { reasonCode: 'H' },
          adjustmentReasons,
          deliusEventNumber,
        })

        expect(view.adjustmentOptions).toEqual([
          expect.objectContaining({
            text: adjustmentReasons[0].name,
            value: adjustmentReasons[0].id,
            checked: true,
          }),
        ])
      })

      it('renders adjustment reasons with a checked option from the formdata', () => {
        const offender = new Offender(offenderFullFactory.build())
        const adjustmentReasons = [
          adjustmentReasonFactory.build({ id: 'H', deliusCode: 'H' }),
          adjustmentReasonFactory.build(),
        ]

        const page = new AdjustHoursPage()

        const view = page.viewData({
          offender,
          body: null,
          adjustmentReasons,
          deliusEventNumber,
          formData: { adjustmentReasonId: 'H' },
        })

        expect(view.adjustmentOptions).toEqual([
          expect.objectContaining({
            text: adjustmentReasons[0].name,
            value: adjustmentReasons[0].id,
            checked: true,
          }),
        ])
      })

      it('renders empty adjustment reasons when none have a matching delius code', () => {
        const offender = new Offender(offenderFullFactory.build())
        const adjustmentReasons = adjustmentReasonFactory.buildList(2)

        const page = new AdjustHoursPage()

        const view = page.viewData({
          offender,
          body: null,
          adjustmentReasons,
          deliusEventNumber,
        })

        expect(view.adjustmentOptions).toEqual([])
      })
    })
  })
})
