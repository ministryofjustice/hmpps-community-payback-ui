/* eslint max-classes-per-file: "off" -- need multiple classes to test different implementations of this abstract class */

import { ProjectDto } from '../../@types/shared'
import { AppointmentOrSession, AppointmentOutcomeForm, AppointmentUpdatePageViewData } from '../../@types/user-defined'
import Offender from '../../models/offender'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import sessionFactory from '../../testutils/factories/sessionFactory'
import DateTimeFormats from '../../utils/dateTimeUtils'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'
import { AppointmentFormPage } from './pathMap'

jest.mock('../../models/offender')

describe('BaseAppointmentUpdatePage', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('next()', () => {
    it('throws an error when nextPage returns undefined', () => {
      const page = new PageWithoutNextPage({})

      expect(() => page.next({ projectCode: 'P123', appointmentId: '1' })).toThrow('No next page configured')
    })

    it('throws an error when only projectCode is provided', () => {
      const page = new PageWithNextPage({})

      expect(() => page.next({ projectCode: 'P123' })).toThrow('Path must have an appointment ID or session date')
    })
  })

  describe('viewData: heading', () => {
    it('returns heading containing offender details when appointment is provided', () => {
      const page = new PageWithNextPage({})
      const offenderMock: jest.Mock = Offender as unknown as jest.Mock<Offender>
      const offender = {
        name: 'Sam Smith',
        crn: 'CRN123',
        isLimited: false,
      }

      offenderMock.mockImplementation(() => offender)

      const result = page.getCommonViewDataForTest({
        appointmentOrSession: appointmentFactory.build(),
      })

      expect(result.heading).toEqual({
        title: offender.name,
        caption: offender.crn,
      })
    })

    it('returns heading containing project name and formatted date when session is provided', () => {
      const page = new PageWithNextPage({})
      const session = sessionFactory.build({ projectName: 'Project Name', date: '2026-06-10' })
      const formattedDate = '10 June 2026'

      jest.spyOn(DateTimeFormats, 'isoDateToUIDate').mockReturnValue(formattedDate)

      const result = page.getCommonViewDataForTest({ appointmentOrSession: session })

      expect(result.heading).toEqual({
        title: `${session.projectName} (${formattedDate})`,
        caption: 'Bulk update',
      })
      expect(DateTimeFormats.isoDateToUIDate).toHaveBeenCalledWith(session.date)
    })
  })
})

class PageWithNextPage extends BaseAppointmentUpdatePage {
  protected page: AppointmentFormPage = 'attendance-outcome'

  public getCommonViewDataForTest(args: {
    appointmentOrSession: AppointmentOrSession
    originalSearch?: Record<string, string>
    project?: ProjectDto
  }): AppointmentUpdatePageViewData {
    return this.commonViewData(args)
  }

  protected nextPage(): AppointmentFormPage {
    return 'confirm-details'
  }

  protected backPage(): AppointmentFormPage {
    return 'choose-supervisor'
  }

  protected getForm(form: AppointmentOutcomeForm): AppointmentOutcomeForm {
    return form
  }
}

class PageWithoutNextPage extends BaseAppointmentUpdatePage {
  protected page: AppointmentFormPage = 'attendance-outcome'

  protected nextPage(): undefined {
    return undefined
  }

  protected backPage(): AppointmentFormPage {
    return 'choose-supervisor'
  }

  protected getForm(form: AppointmentOutcomeForm): AppointmentOutcomeForm {
    return form
  }
}
