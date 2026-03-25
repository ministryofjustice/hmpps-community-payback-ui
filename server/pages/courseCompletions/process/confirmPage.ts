import { ProjectOutcomeSummaryDto, ProviderTeamSummaryDto, UnpaidWorkDetailsDto } from '../../../@types/shared'
import { GovUkSummaryListItem } from '../../../@types/user-defined'
import paths from '../../../paths'
import { CourseCompletionForm } from '../../../services/forms/courseCompletionFormService'
import DateTimeFormats from '../../../utils/dateTimeUtils'
import BaseCourseCompletionFormPage from './baseCourseCompletionFormPage'
import { CourseCompletionPage } from './pathMap'

interface Body {
  alert: boolean
}

interface PersonItems {
  courseCompletionId: string
  form: CourseCompletionForm
  formId?: string
  unpaidWorkDetails?: UnpaidWorkDetailsDto
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

  personItems({ courseCompletionId, form, formId, unpaidWorkDetails }: PersonItems): GovUkSummaryListItem[] {
    const requirementDetails = unpaidWorkDetails
      ? [
          `Offence: ${unpaidWorkDetails.mainOffence.description}`,
          `Event number: ${unpaidWorkDetails.eventNumber}`,
          `Sentence date: ${DateTimeFormats.isoDateToUIDate(unpaidWorkDetails.sentenceDate)}`,
          `Status: ${unpaidWorkDetails.upwStatus}`,
        ].join('<br>')
      : undefined

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
      {
        key: {
          text: 'Requirement',
        },
        value: {
          html: requirementDetails,
        },
        actions: {
          items: [
            {
              href: this.pathWithFormId(
                paths.courseCompletions.process({ page: 'requirement', id: courseCompletionId }),
                formId,
              ),
              text: 'Change',
              visuallyHiddenText: 'requirement',
            },
          ],
        },
      },
    ]
  }

  appointmentItems({ courseCompletionId, form, formId, teams, projects }: AppointmentItems): GovUkSummaryListItem[] {
    return [
      this.teamRow(teams, form, courseCompletionId, formId),
      this.projectRow(projects, form, courseCompletionId, formId),
    ]
  }

  private projectRow(
    projects: ProjectOutcomeSummaryDto[],
    form: CourseCompletionForm,
    courseCompletionId: string,
    formId?: string,
  ): GovUkSummaryListItem {
    const selectedProject = projects?.find(project => project.projectCode === form.project)
    return {
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
    }
  }

  private teamRow(
    teams: Array<ProviderTeamSummaryDto>,
    form: CourseCompletionForm,
    courseCompletionId: string,
    formId?: string,
  ): GovUkSummaryListItem {
    const selectedTeam = teams?.find(team => team.code === form.team)
    return {
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
    }
  }
}
