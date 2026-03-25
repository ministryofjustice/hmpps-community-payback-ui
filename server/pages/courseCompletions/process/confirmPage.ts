import { ProjectOutcomeSummaryDto, ProviderTeamSummaryDto } from '../../../@types/shared'
import { GovUkSummaryListItem } from '../../../@types/user-defined'
import paths from '../../../paths'
import { CourseCompletionForm } from '../../../services/forms/courseCompletionFormService'
import BaseCourseCompletionFormPage from './baseCourseCompletionFormPage'
import { CourseCompletionPage } from './pathMap'

interface Body {
  alert: boolean
}

interface PersonItems {
  courseCompletionId: string
  form: CourseCompletionForm
  formId?: string
}

interface AppointmentItems {
  courseCompletionId: string
  form: CourseCompletionForm
  formId?: string
  teams?: ProviderTeamSummaryDto[]
  projects?: ProjectOutcomeSummaryDto[]
}

export default class ConfirmPage extends BaseCourseCompletionFormPage<Body> {
  protected page: CourseCompletionPage = 'confirm'

  protected getValidationErrors(_: Body) {
    return {}
  }

  getFormData(formData: CourseCompletionForm, _body: Body): CourseCompletionForm {
    // TODO: implement form data to save
    return formData
  }

  personItems({ courseCompletionId, form, formId }: PersonItems): GovUkSummaryListItem[] {
    return [
      {
        key: {
          text: 'CRN',
        },
        value: {
          text: form.crn,
        },
        actions: {
          items: [
            {
              href: this.pathWithFormId(
                paths.courseCompletions.process({ page: 'crn', id: courseCompletionId }),
                formId,
              ),
              text: 'Change',
              visuallyHiddenText: 'crn',
            },
          ],
        },
      },
    ]
  }

  appointmentItems({ courseCompletionId, form, formId, teams, projects }: AppointmentItems): GovUkSummaryListItem[] {
    const selectedTeam = teams?.find(team => team.code === form.team)
    const selectedProject = projects?.find(project => project.projectCode === form.project)

    return [
      {
        key: {
          text: 'Project team',
        },
        value: {
          text: selectedTeam?.name,
        },
        actions: {
          items: [
            {
              href: this.pathWithFormId(
                paths.courseCompletions.process({ page: 'project', id: courseCompletionId }),
                formId,
              ),
              text: 'Change',
              visuallyHiddenText: 'project team',
            },
          ],
        },
      },
      {
        key: {
          text: 'Project',
        },
        value: {
          text: selectedProject?.projectName,
        },
        actions: {
          items: [
            {
              href: this.pathWithFormId(
                paths.courseCompletions.process({ page: 'project', id: courseCompletionId }),
                formId,
              ),
              text: 'Change',
              visuallyHiddenText: 'project',
            },
          ],
        },
      },
    ]
  }
}
