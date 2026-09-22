import { Page } from '../../../services/auditService'

export type OtherEteFormPage = 'region' | 'project' | 'outcome' | 'compliance' | 'confirm'

export const OTHER_ETE_FORM_PAGES_AUDIT_MAP: Record<OtherEteFormPage, { show: Page; submit: Page }> = {
  region: {
    show: Page.VIEW_OTHER_ETE_CHOOSE_REGION_PAGE,
    submit: Page.EDIT_OTHER_ETE_CHOOSE_REGION_PAGE,
  },
  project: {
    show: Page.VIEW_OTHER_ETE_CHOOSE_PROJECT_PAGE,
    submit: Page.EDIT_OTHER_ETE_CHOOSE_PROJECT_PAGE,
  },
  outcome: {
    show: Page.VIEW_OTHER_ETE_RECORD_OUTCOME_PAGE,
    submit: Page.EDIT_OTHER_ETE_RECORD_OUTCOME_PAGE,
  },
  compliance: {
    show: Page.VIEW_OTHER_ETE_LOG_COMPLIANCE_PAGE,
    submit: Page.EDIT_OTHER_ETE_LOG_COMPLIANCE_PAGE,
  },
  confirm: {
    show: Page.VIEW_OTHER_ETE_CONFIRM_PAGE,
    submit: Page.CREATE_OTHER_ETE_APPOINTMENT,
  },
}
