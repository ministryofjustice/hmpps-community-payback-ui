import Offender from '../models/offender'
import adjustmentReasonFactory from '../testutils/factories/adjustmentReasonFactory'
import offenderFullFactory from '../testutils/factories/offenderFullFactory'
import unpaidWorkDetailsFactory from '../testutils/factories/unpaidWorkDetailsFactory'
import AdjustHoursConfirmPage from './adjustHoursConfirmPage'
import * as Utils from '../utils/utils'
import DateTimeFormats from '../utils/dateTimeUtils'
import { AdjustmentForm } from '../services/forms/adjustmentFormService'

describe('AdjustHoursPage', () => {
  const deliusEventNumber = '1'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('viewData', () => {
    beforeEach(() => {
      jest.spyOn(Utils, 'pathWithQuery').mockImplementation(path => {
        if (/update/.test(path)) {
          return '/back'
        }
        return '/confirm'
      })
    })

    it('should return the correct view data', () => {
      const offender = new Offender(offenderFullFactory.build())

      const reasons = [
        adjustmentReasonFactory.build({
          id: 'H',
          deliusCode: 'H',
        }),
      ]

      jest.spyOn(AdjustHoursConfirmPage.prototype, 'calculateRemainingHoursText').mockImplementation(() => {
        return '30 minutes'
      })

      jest.spyOn(DateTimeFormats, 'isoDateToUIDate').mockImplementation(() => {
        return '01/01/2026'
      })

      const page = new AdjustHoursConfirmPage()

      const viewData = page.viewData({
        offender,
        deliusEventNumber,
        form: {
          originalPath: 'back',
          type: 'Negative',
          minutes: 30,
          adjustmentDate: '2026-01-01',
          adjustmentReasonId: 'H',
        },
        formId: 'abc123',
        adjustmentReasons: reasons,
        upwDetails: [
          unpaidWorkDetailsFactory.build({
            eventNumber: 1,
          }),
        ],
      })

      expect(viewData).toEqual({
        items: [
          {
            key: {
              text: 'Date',
            },
            value: {
              text: '01/01/2026',
            },
            actions: {
              items: [
                {
                  href: '/back',
                  text: 'Change',
                  visuallyHiddenText: 'date',
                },
              ],
            },
          },
          {
            key: {
              text: 'Reason',
            },
            value: {
              text: reasons[0].name,
            },
            actions: {
              items: [
                {
                  href: '/back',
                  text: 'Change',
                  visuallyHiddenText: 'adjustment reason',
                },
              ],
            },
          },
          {
            key: {
              text: 'Time taken off',
            },
            value: {
              text: '30 minutes',
            },
            actions: {
              items: [
                {
                  href: '/back',
                  text: 'Change',
                  visuallyHiddenText: 'time taken off',
                },
              ],
            },
          },
        ],
        calculatedRemainingHoursText: '30 minutes',
        backLink: '/back',
        updatePath: '/confirm',
        heading: {
          title: offender.name,
          caption: offender.crn,
        },
      })
    })
  })

  describe('calculateRemainingHoursText', () => {
    beforeEach(() => {
      jest.restoreAllMocks()
    })

    it('should return the correct text for remaining hours', () => {
      const page = new AdjustHoursConfirmPage()

      const unpaidWorkDetails = unpaidWorkDetailsFactory.build({
        requiredMinutes: 300,
        completedMinutes: 30,
      })
      jest.spyOn(DateTimeFormats, 'totalMinutesToHumanReadableHoursAndMinutes').mockImplementation(minutes => {
        return `${minutes}`
      })

      const result = page.calculateRemainingHoursText(unpaidWorkDetails, 30)

      expect(result).toEqual('The total amount of time remaining will be 240')
    })
  })

  describe('requestBody', () => {
    it('should return the correct request body from the form, with type always set to Negative', () => {
      const page = new AdjustHoursConfirmPage()

      const form = {
        adjustmentReasonId: 'H',
        adjustmentDate: '2026-01-01',
        minutes: 30,
        type: 'Positive',
      } as AdjustmentForm

      const result = page.requestBody(form)

      expect(result).toEqual({
        adjustmentReasonId: 'H',
        adjustmentDate: '2026-01-01',
        minutes: 30,
        type: 'Negative',
      })
    })
  })
})
