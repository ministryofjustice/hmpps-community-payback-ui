import { FormPageHandlerMethod } from '../../@types/user-defined'
import { Page } from '../../services/auditService'

export type AppointmentFormPage =
  | 'choose-supervisor'
  | 'attendance-outcome'
  | 'log-hours'
  | 'log-compliance'
  | 'choose-project'
  | 'confirm-details'
  // Keeping these in the same type because it's easier to add route guards than type checks
  | 'appointment-details'
  | 'select-people'

export const APPOINTMENT_FORM_PAGES_AUDIT_MAP: Record<AppointmentFormPage, Record<FormPageHandlerMethod, Page>> = {
  'appointment-details': {
    show: Page.VIEW_APPOINTMENT,
    submit: Page.EDIT_APPOINTMENT_DETAILS_PAGE,
  },
  'choose-supervisor': { show: Page.VIEW_CHOOSE_SUPERVISOR_PAGE, submit: Page.EDIT_CHOOSE_SUPERVISOR_PAGE },
  'attendance-outcome': {
    show: Page.VIEW_APPOINTMENT_ATTENDANCE_OUTCOME_PAGE,
    submit: Page.EDIT_APPOINTMENT_ATTENDANCE_OUTCOME_PAGE,
  },
  'log-hours': { show: Page.VIEW_APPOINTMENT_LOG_HOURS_PAGE, submit: Page.EDIT_APPOINTMENT_LOG_HOURS_PAGE },
  'log-compliance': {
    show: Page.VIEW_APPOINTMENT_LOG_COMPLIANCE_PAGE,
    submit: Page.EDIT_APPOINTMENT_LOG_COMPLIANCE_PAGE,
  },
  'choose-project': {
    show: Page.VIEW_APPOINTMENT_CHOOSE_PROJECT_PAGE,
    submit: Page.EDIT_APPOINTMENT_CHOOSE_PROJECT_PAGE,
  },
  'select-people': { show: Page.VIEW_SESSIONS_SELECT_PEOPLE, submit: Page.EDIT_SESSIONS_SELECT_PEOPLE },
  'confirm-details': { show: Page.VIEW_APPOINTMENT_CONFIRM_PAGE, submit: Page.EDIT_APPOINTMENT },
}
