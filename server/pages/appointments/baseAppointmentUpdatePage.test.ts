/* eslint max-classes-per-file: "off" -- need multiple classes to test different implementations of this abstract class */

import { OffenderDto, ProjectDto } from '../../@types/shared'
import { AppointmentOrSession } from '../../@types/user-defined'
import { AppointmentOutcomeForm } from '../../services/forms/appointmentFormService'
import Offender from '../../models/offender'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import sessionFactory from '../../testutils/factories/sessionFactory'
import DateTimeFormats from '../../utils/dateTimeUtils'
import { pathWithQuery } from '../../utils/utils'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'
import { AppointmentFormPage } from './pathMap'

jest.mock('../../models/offender')

describe('BaseAppointmentUpdatePage', () => {
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

      expect(() =>
        page.next({ projectCode: 'P123', appointmentId: '1', form: appointmentOutcomeFormFactory.build() }),
      ).toThrow('No next page configured')
    })

    it('throws an error when only projectCode is provided', () => {
      const page = new PageWithNextPage()

      expect(() => page.next({ projectCode: 'P123', form: appointmentOutcomeFormFactory.build() })).toThrow(
        'Path must have an appointment ID or session date',
      )
    })
  })

  describe('headingViewDataForSingle()/headingViewDataForSession()', () => {
    it('returns heading with offender name and CRN for a single appointment', () => {
      const page = new PageWithNextPage()
      const appointment = appointmentFactory.build()

      const result = page.getHeadingViewDataForSingleForTest(appointment.offender)

      expect(result.title).toBe(offender.name)
      expect(result.caption).toBe(offender.crn)
      expect(result.description).toBeUndefined()
    })

    it('returns heading with project name, bulk update label, and formatted date for a session', () => {
      const page = new PageWithNextPage()
      const session = sessionFactory.build({ projectName: 'My Project', date: '2026-07-15' })
      const formattedDate = '15 July 2026'

      jest.spyOn(DateTimeFormats, 'isoDateToUIDate').mockReturnValue(formattedDate)

      const result = page.getHeadingViewDataForSessionForTest(session.projectName, session.date)

      expect(result.title).toBe('My Project')
      expect(result.caption).toBe('Bulk update')
      expect(result.description).toBe(`Date: ${formattedDate}`)
      expect(DateTimeFormats.isoDateToUIDate).toHaveBeenCalledWith('2026-07-15')
    })
  })

  describe('paths()', () => {
    it('returns backLink and updatePath for appointment', () => {
      const page = new PageWithNextPage()
      const appointment = appointmentFactory.build()
      const formId = 'form-123'

      const result = page.getPathsForTest(appointment, formId)

      const expectedUpdatePath = pathWithQuery(
        paths.appointments.update({
          projectCode: appointment.projectCode,
          appointmentId: appointment.id.toString(),
          page: 'attendance-outcome',
        }),
        { form: formId },
      )

      const expectedBackLink = pathWithQuery(
        paths.appointments.update({
          projectCode: appointment.projectCode,
          appointmentId: appointment.id.toString(),
          page: 'choose-supervisor',
        }),
        { form: formId },
      )

      expect(result.updatePath).toEqual(expectedUpdatePath)
      expect(result.backLink).toEqual(expectedBackLink)
    })

    it('returns backLink and updatePath for session', () => {
      const page = new PageWithNextPage()
      const session = sessionFactory.build()
      const formId = 'form-456'

      const result = page.getPathsForTest(session, formId)

      const expectedUpdatePath = pathWithQuery(
        paths.sessions.update({
          projectCode: session.projectCode,
          date: session.date,
          page: 'attendance-outcome',
        }),
        { form: formId },
      )

      const expectedBackLink = pathWithQuery(
        paths.sessions.update({
          projectCode: session.projectCode,
          date: session.date,
          page: 'choose-supervisor',
        }),
        { form: formId },
      )

      expect(result.updatePath).toEqual(expectedUpdatePath)
      expect(result.backLink).toEqual(expectedBackLink)
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

  public getHeadingViewDataForSingleForTest(offender: OffenderDto) {
    return this.offenderHeading(offender)
  }

  public getHeadingViewDataForSessionForTest(projectName: string, date: string) {
    return this.sessionUpdateHeading(projectName, date)
  }

  public getPathsForTest(
    appointmentOrSession: AppointmentOrSession,
    formId: string,
    originalSearch?: Record<string, string>,
    project?: ProjectDto,
    form: AppointmentOutcomeForm = appointmentOutcomeFormFactory.build(),
  ) {
    return this.paths({
      projectCode: appointmentOrSession.projectCode,
      appointmentId: 'id' in appointmentOrSession ? appointmentOrSession.id.toString() : undefined,
      date: appointmentOrSession.date,
      formId,
      originalSearch,
      project,
      form,
    })
  }

  protected nextPage(): AppointmentFormPage {
    return 'confirm-details'
  }

  protected backPage(_isSingleAppointment: boolean): AppointmentFormPage {
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

  protected backPage(_isSingleAppointment: boolean): AppointmentFormPage {
    return 'choose-supervisor'
  }

  protected getForm(form: AppointmentOutcomeForm): AppointmentOutcomeForm {
    return form
  }
}
