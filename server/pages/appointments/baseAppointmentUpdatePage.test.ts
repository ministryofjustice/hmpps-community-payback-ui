/* eslint max-classes-per-file: "off" -- need multiple classes to test different implementations of this abstract class */

import { ProjectDto } from '../../@types/shared'
import { AppointmentOrSession, AppointmentOutcomeForm, AppointmentUpdatePageViewData } from '../../@types/user-defined'
import Offender from '../../models/offender'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import sessionFactory from '../../testutils/factories/sessionFactory'
import DateTimeFormats from '../../utils/dateTimeUtils'
import SessionUtils from '../../utils/sessionUtils'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'
import { AppointmentFormPage } from './pathMap'

jest.mock('../../models/offender')

describe('BaseAppointmentUpdatePage', () => {
  const form = appointmentOutcomeFormFactory.build()

  const offender = {
    name: 'Sam Smith',
    crn: 'CRN123',
    isLimited: false,
    details: {
      description: 'Some description',
    },
  }

  beforeEach(() => {
    jest.resetAllMocks()
    const offenderMock: jest.Mock = Offender as unknown as jest.Mock<Offender>
    offenderMock.mockImplementation(() => offender)
  })

  describe('next()', () => {
    it('throws an error when nextPage returns undefined', () => {
      const page = new PageWithoutNextPage()

      expect(() => page.next({ projectCode: 'P123', appointmentId: '1' })).toThrow('No next page configured')
    })

    it('throws an error when only projectCode is provided', () => {
      const page = new PageWithNextPage()

      expect(() => page.next({ projectCode: 'P123' })).toThrow('Path must have an appointment ID or session date')
    })
  })

  describe('viewData', () => {
    describe('heading', () => {
      it('returns heading containing offender details when appointment is provided', () => {
        const page = new PageWithNextPage()

        const result = page.getCommonViewDataForTest({
          appointmentOrSession: appointmentFactory.build(),
          form,
          formId: '1',
        })

        expect(result.heading).toEqual({
          title: offender.name,
          caption: offender.crn,
        })
      })

      it('returns heading containing project name and formatted date when session is provided', () => {
        const page = new PageWithNextPage()
        const session = sessionFactory.build({ projectName: 'Project Name', date: '2026-06-10' })
        const formattedDate = '10 June 2026'

        jest.spyOn(DateTimeFormats, 'isoDateToUIDate').mockReturnValue(formattedDate)

        const result = page.getCommonViewDataForTest({
          appointmentOrSession: session,
          form,
          formId: '2',
        })

        expect(result.heading).toEqual({
          title: session.projectName,
          caption: 'Bulk update',
          description: `Date: ${formattedDate}`,
        })
        expect(DateTimeFormats.isoDateToUIDate).toHaveBeenCalledWith(session.date)
      })
    })
    describe('selectedPeopleCard', () => {
      it('should be undefined given appointment', () => {
        const page = new PageWithNextPage()

        const result = page.getCommonViewDataForTest({
          appointmentOrSession: appointmentFactory.build(),
          form,
          formId: '1',
        })

        expect(result.selectedPeopleCard).toBeUndefined()
      })

      it('should return card given session', () => {
        const formId = '1'
        const page = new PageWithNextPage()
        const session = sessionFactory.build({ projectName: 'Project Name', date: '2026-06-10' })

        const selectedPeopleCard = {
          rows: [{ key: { text: 'person 1' }, value: { text: '09:00 - 13:00' } }],
        }

        jest.spyOn(SessionUtils, 'selectedPeopleCard').mockReturnValue(selectedPeopleCard)

        const result = page.getCommonViewDataForTest({ appointmentOrSession: session, form, formId })

        expect(result.selectedPeopleCard).toEqual(selectedPeopleCard)
        expect(SessionUtils.selectedPeopleCard).toHaveBeenCalledWith(session, form.appointments, formId)
      })
    })
  })
})

class PageWithNextPage extends BaseAppointmentUpdatePage {
  protected page: AppointmentFormPage = 'attendance-outcome'

  public getCommonViewDataForTest({
    appointmentOrSession,
    originalSearch,
    project,
    form,
    formId,
  }: {
    appointmentOrSession: AppointmentOrSession
    originalSearch?: Record<string, string>
    project?: ProjectDto
    form: AppointmentOutcomeForm
    formId: string
  }): AppointmentUpdatePageViewData {
    return this.commonViewData({ appointmentOrSession, originalSearch, project, form, formId })
  }

  protected nextPage(): AppointmentFormPage {
    return 'confirm-details'
  }

  protected backPage(_appointmentOrSession: AppointmentOrSession): AppointmentFormPage {
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

  protected backPage(_appointmentOrSession: AppointmentOrSession): AppointmentFormPage {
    return 'choose-supervisor'
  }

  protected getForm(form: AppointmentOutcomeForm): AppointmentOutcomeForm {
    return form
  }
}
