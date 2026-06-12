import { AppointmentDto, SessionDto } from '../../@types/shared'
import { AppointmentOutcomeForm, GovUkRadioOrCheckboxOption, ValidationErrors } from '../../@types/user-defined'
import GovUkCheckboxes from '../../forms/GovUkCheckboxes'
import Offender from '../../models/offender'
import paths from '../../paths'
import DateTimeFormats from '../../utils/dateTimeUtils'
import { pathWithQuery } from '../../utils/utils'
import PageWithValidation from '../pageWithValidation'

interface Body {
  appointments: string | Array<string>
}

export default class BulkUpdatePage extends PageWithValidation<Body> {
  viewData({ formData, session, formId }: { formData: AppointmentOutcomeForm; session: SessionDto; formId: string }): {
    backLink: string
    updatePath: string
    options: Array<GovUkRadioOrCheckboxOption>
    heading: { title: string; caption: string }
  } {
    return {
      backLink: this.backPath(session, formData.originalSearch),
      updatePath: this.updatePath(formId, session),
      options: this.items(session, formData),
      heading: {
        title: `${session.projectName} (${DateTimeFormats.isoDateToUIDate(session.date)})`,
        caption: 'Bulk update',
      },
    }
  }

  protected getValidationErrors(query: Body): ValidationErrors<Body> {
    const errors: ValidationErrors<Body> = {}

    if (!query.appointments) {
      errors.appointments = { text: 'Select people with the same outcome' }
    }

    return errors
  }

  next(formId: string, projectCode: string, date: string): string {
    const path = paths.sessions.update({
      projectCode,
      date,
      page: 'choose-supervisor',
    })
    return this.pathWithFormId(path, formId)
  }

  private backPath(session: SessionDto, originalSearch?: Record<string, string>): string {
    const backPath = paths.sessions.show({ projectCode: session.projectCode, date: session.date })
    return pathWithQuery(backPath, originalSearch)
  }

  private updatePath(formId: string, session: SessionDto): string {
    const path = paths.sessions.bulkUpdate({ projectCode: session.projectCode, date: session.date })
    return this.pathWithFormId(path, formId)
  }

  selected(body: Body): Array<string> {
    return typeof body.appointments === 'string' ? [body.appointments] : body.appointments
  }

  getFormData(form: AppointmentOutcomeForm, appointments: Array<AppointmentDto>): AppointmentOutcomeForm {
    return {
      ...form,
      appointments: appointments.map(appointment => ({ id: appointment.id, deliusVersion: appointment.version })),
    }
  }

  private items(session: SessionDto, formData: AppointmentOutcomeForm) {
    return GovUkCheckboxes.getOptions(
      session.appointmentSummaries
        .filter(appointment => !appointment.contactOutcome && appointment.offender.objectType === 'Full')
        .map(appointment => {
          const offender = new Offender(appointment.offender)
          return { value: appointment.id, text: offender.details.description }
        }),
      'text',
      'value',
      formData.appointments?.map(appointment => appointment.id.toString()),
    )
  }

  private pathWithFormId(path: string, formId: string): string {
    return pathWithQuery(path, { form: formId })
  }
}
