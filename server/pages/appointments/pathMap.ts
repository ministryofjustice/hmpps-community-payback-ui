import { FormPageHandlerMethod } from '../../@types/user-defined'
import { Page } from '../../services/auditService'

export const NEW_APPOINTMENT_ID = 'create'

export type AppointmentFormPage =
  'choose-supervisor' | 'attendance-outcome' | 'log-hours' | 'log-compliance' | 'choose-project' | 'confirm-details'

export type AppointmentPage = AppointmentFormPage | 'appointment-details' | 'select-people'

export const APPOINTMENT_FORM_PAGES_AUDIT_MAP: Record<AppointmentFormPage, Record<FormPageHandlerMethod, Page>> = {
  'choose-supervisor': {
    show: Page.VIEW_CHOOSE_SUPERVISOR_PAGE,
    submit: Page.EDIT_CHOOSE_SUPERVISOR_PAGE,
    create: Page.VIEW_CREATE_APPOINTMENT_CHOOSE_SUPERVISOR_PAGE,
    submitCreate: Page.EDIT_CREATE_APPOINTMENT_CHOOSE_SUPERVISOR_PAGE,
  },
  'attendance-outcome': {
    show: Page.VIEW_APPOINTMENT_ATTENDANCE_OUTCOME_PAGE,
    submit: Page.EDIT_APPOINTMENT_ATTENDANCE_OUTCOME_PAGE,
    create: Page.VIEW_CREATE_APPOINTMENT_ATTENDANCE_OUTCOME_PAGE,
    submitCreate: Page.EDIT_CREATE_APPOINTMENT_ATTENDANCE_OUTCOME_PAGE,
  },
  'log-hours': {
    show: Page.VIEW_APPOINTMENT_LOG_HOURS_PAGE,
    submit: Page.EDIT_APPOINTMENT_LOG_HOURS_PAGE,
    create: Page.VIEW_CREATE_APPOINTMENT_LOG_HOURS_PAGE,
    submitCreate: Page.EDIT_CREATE_APPOINTMENT_LOG_HOURS_PAGE,
  },
  'log-compliance': {
    show: Page.VIEW_APPOINTMENT_LOG_COMPLIANCE_PAGE,
    submit: Page.EDIT_APPOINTMENT_LOG_COMPLIANCE_PAGE,
    create: Page.VIEW_CREATE_APPOINTMENT_LOG_COMPLIANCE_PAGE,
    submitCreate: Page.EDIT_CREATE_APPOINTMENT_LOG_COMPLIANCE_PAGE,
  },
  'choose-project': {
    show: Page.VIEW_APPOINTMENT_CHOOSE_PROJECT_PAGE,
    submit: Page.EDIT_APPOINTMENT_CHOOSE_PROJECT_PAGE,
    create: Page.VIEW_CREATE_APPOINTMENT_CHOOSE_PROJECT_PAGE,
    submitCreate: Page.EDIT_CREATE_APPOINTMENT_CHOOSE_PROJECT_PAGE,
  },
  'confirm-details': {
    show: Page.VIEW_APPOINTMENT_CONFIRM_PAGE,
    submit: Page.EDIT_APPOINTMENT,
    create: Page.VIEW_APPOINTMENT_CONFIRM_PAGE,
    submitCreate: Page.CREATE_APPOINTMENT,
  },
}
