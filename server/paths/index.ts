import { path } from 'static-path'

const projectsPath = path('/projects')
const sessionsPath = path('/sessions')
const courseCompletionsPath = path('/course-completions')
const appointmentsPath = path('/appointments')
const appointmentPath = appointmentsPath.path(':projectCode').path(':appointmentId')
const projectsIndividualPlacementsPath = projectsPath.path('individual-placements')

const paths = {
  projects: {
    index: projectsIndividualPlacementsPath,
    filter: projectsIndividualPlacementsPath.path('filter'),
    show: projectsPath.path(':projectCode'),
  },
  sessions: {
    index: sessionsPath,
    search: sessionsPath.path('search'),
    show: sessionsPath.path(':projectCode').path(':date'),
  },
  courseCompletions: {
    index: courseCompletionsPath,
    show: courseCompletionsPath.path(':id'),
    search: courseCompletionsPath.path('search'),
  },
  appointments: {
    update: appointmentPath.path('update'),
    projectDetails: appointmentPath.path('project-details'),
    attendanceOutcome: appointmentPath.path('attendance-outcome'),
    logHours: appointmentPath.path('log-hours'),
    logCompliance: appointmentPath.path('log-compliance'),
    confirm: appointmentPath.path('confirm-details'),
  },
}

export default paths
