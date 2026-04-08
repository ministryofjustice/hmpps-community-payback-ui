import { path } from 'static-path'

const adminUiPath = path('/admin')
const formsPath = path('/common/forms')
const providersPath = adminUiPath.path('/providers')
const projectsPath = adminUiPath.path('/projects')
const projectAppointmentsPath = projectsPath.path(':projectCode/appointments')
const referenceDataPath = path('/common/references')
const singleProjectPath = projectsPath.path(':projectCode')
const courseCompletionPath = adminUiPath.path('/course-completions')
const singleCourseCompletionPath = courseCompletionPath.path(':id')
const appointmentTasksPath = adminUiPath.path('/appointment-tasks')

const teamsPath = providersPath.path(':providerCode/teams')

export default {
  appointments: {
    filter: adminUiPath.path('appointments'),
    singleAppointment: projectAppointmentsPath.path(':appointmentId'),
    outcome: projectAppointmentsPath.path(':appointmentId/outcome'),
    tasks: {
      filter: appointmentTasksPath.path('pending'),
    },
  },
  forms: formsPath.path(':type/:id'),
  providers: {
    providers: providersPath,
    teams: teamsPath,
    supervisors: teamsPath.path(':teamCode/supervisors'),
  },
  projects: {
    filter: teamsPath.path(':teamCode/projects'),
    singleProject: singleProjectPath,
    sessions: teamsPath.path(':teamCode/sessions'),
    sessionAppointments: singleProjectPath.path('sessions').path(':date'),
  },
  courseCompletions: {
    singleCourseCompletion: singleCourseCompletionPath,
    save: singleCourseCompletionPath.path('resolution'),
    filter: providersPath.path(':providerCode/course-completions'),
  },
  referenceData: {
    projectTypes: referenceDataPath.path('project-types'),
    contactOutcomes: referenceDataPath.path('contact-outcomes'),
    communityCampusPdus: referenceDataPath.path('community-campus-pdus'),
    adjustmentReasons: referenceDataPath.path('adjustment-reasons'),
  },
  offenders: {
    summary: adminUiPath.path('/offenders/:crn/summary'),
  },
}
