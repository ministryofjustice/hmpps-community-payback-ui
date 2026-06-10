/* eslint max-classes-per-file: "off" -- need multiple classes to test different implementations of this abstract class */

import { AppointmentOutcomeForm } from '../../@types/user-defined'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'
import { AppointmentFormPage } from './pathMap'

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
})

class PageWithNextPage extends BaseAppointmentUpdatePage {
  protected page: AppointmentFormPage = 'attendance-outcome'

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
