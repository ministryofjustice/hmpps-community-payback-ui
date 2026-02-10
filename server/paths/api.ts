import { path } from 'static-path'

const adminUiPath = path('/admin')
const formsPath = path('/common/forms')
const providersPath = adminUiPath.path('/providers')
const projectsPath = adminUiPath.path('/projects')
const projectAppointmentsPath = projectsPath.path(':projectCode/appointments')
const referenceDataPath = path('/common/references')
const singleProjectPath = projectsPath.path(':projectCode')
const courseCompletionPath = adminUiPath.path('/course-completions')

const teamsPath = providersPath.path(':providerCode/teams')

export default {
  appointments: {
    filter: adminUiPath.path('appointments'),
    singleAppointment: projectAppointmentsPath.path(':appointmentId'),
    outcome: projectAppointmentsPath.path(':appointmentId/outcome'),
  },
  forms: formsPath.path(':type/:id'),
  providers: {
    teams: teamsPath,
    supervisors: teamsPath.path(':teamCode/supervisors'),
  },
  projects: {
    singleProject: singleProjectPath,
    sessions: teamsPath.path(':teamCode/sessions'),
    sessionAppointments: singleProjectPath.path('sessions').path(':date'),
  },
  courseCompletions: {
    singleCourseCompletion: courseCompletionPath.path(':id'),
  },
  referenceData: {
    projectTypes: referenceDataPath.path('project-types'),
    contactOutcomes: referenceDataPath.path('contact-outcomes'),
  },
}
