/* eslint max-classes-per-file: "off" -- need multiple classes to test different implementations of this abstract class */
import { AppointmentOrSession, AppointmentOutcomeForm } from '../../@types/user-defined'
import Offender from '../../models/offender'
import paths from '../../paths'
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

        const result = page.commonViewData({
          pathData: { projectCode: '', date: '' },
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

        const result = page.commonViewData({
          pathData: { projectCode: '', date: '' },
          appointmentOrSession: session,
          form,
          formId: '1',
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

        const result = page.commonViewData({
          pathData: { projectCode: '', date: '' },
          appointmentOrSession: appointmentFactory.build(),
          form,
          formId: '1',
        })

        expect(result.selectedPeopleCard).toBeUndefined()
      })

      it('should return card given session', () => {
        const page = new PageWithNextPage()
        const pathData = { projectCode: 'Project', date: '2026-06-10' }
        const session = sessionFactory.build(pathData)

        const selectedPeopleCard = {
          rows: [{ key: { text: 'person 1' }, value: { text: '09:00 - 13:00' } }],
        }

        jest.spyOn(SessionUtils, 'selectedPeopleCard').mockReturnValue(selectedPeopleCard)

        const result = page.commonViewData({ pathData, appointmentOrSession: session, form, formId: '1' })

        expect(result.selectedPeopleCard).toEqual(selectedPeopleCard)
        expect(SessionUtils.selectedPeopleCard).toHaveBeenCalledWith(session, form.appointments, '1')
      })
    })
  })

  describe('paths', () => {
    it('returns backLink, updatePath and form for an appointment', () => {
      const page = new PageWithNextPage()

      const result = page.paths({
        pathData: { projectCode: 'P123', appointmentId: '1' },
        form,
        formId: 'form-1',
      })

      expect(result).toEqual({
        backLink: `${paths.appointments.update({ projectCode: 'P123', appointmentId: '1', page: 'choose-supervisor' })}?form=form-1`,
        updatePath: `${paths.appointments.update({ projectCode: 'P123', appointmentId: '1', page: 'attendance-outcome' })}?form=form-1`,
        form: 'form-1',
      })
    })

    it('returns backLink, updatePath and form for a session', () => {
      const page = new PageWithNextPage()

      const result = page.paths({
        pathData: { projectCode: 'P123', date: '2026-06-10' },
        form,
        formId: 'form-1',
      })

      expect(result).toEqual({
        backLink: `${paths.sessions.update({ projectCode: 'P123', date: '2026-06-10', page: 'choose-supervisor' })}?form=form-1`,
        updatePath: `${paths.sessions.update({ projectCode: 'P123', date: '2026-06-10', page: 'attendance-outcome' })}?form=form-1`,
        form: 'form-1',
      })
    })

    it('includes original search params in the back link', () => {
      const page = new PageWithNextPage()
      const originalSearch = { provider: 'provider', team: 'team' }

      const result = page.paths({
        pathData: { projectCode: 'P123', appointmentId: '1' },
        form,
        formId: 'form-1',
        originalSearch,
      })

      expect(result.backLink).toBe('/appointments/P123/1/choose-supervisor?form=form-1&provider=provider&team=team')
    })
  })
})

class PageWithNextPage extends BaseAppointmentUpdatePage<unknown> {
  protected getValidationErrors(
    _query: unknown,
    _additionalParams?: unknown,
  ): Partial<Record<never, Record<'text', string>>> {
    throw new Error('Method not implemented.')
  }

  protected page: AppointmentFormPage = 'attendance-outcome'

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

class PageWithoutNextPage extends BaseAppointmentUpdatePage<unknown> {
  protected getValidationErrors(
    _query: unknown,
    _additionalParams?: unknown,
  ): Partial<Record<never, Record<'text', string>>> {
    throw new Error('Method not implemented.')
  }

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
