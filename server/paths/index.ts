import { path } from 'static-path'
import createAppointmentPaths from './createAppointmentPaths'

const projectsPath = path('/projects')
const sessionsPath = path('/sessions')
const courseCompletionsPath = path('/course-completions')
const courseCompletionsShowPath = courseCompletionsPath.path(':id')
const appointmentsPath = path('/appointments')
const projectAppointmentsPath = appointmentsPath.path(':projectCode')
const appointmentPath = projectAppointmentsPath.path(':appointmentId')
const projectsIndividualPlacementsPath = projectsPath.path('individual-placements')

const travelTimeTaskPath = appointmentPath.path('travel-time/:taskId')
const singleSessionPath = sessionsPath.path(':projectCode').path(':date')

const peoplePath = path('/people')
const personAppointmentsPath = peoplePath.path(':crn/:deliusEventNumber/appointments')

const singleProjectPath = projectsPath.path(':projectCode')
const paths = {
  error: path('/error'),
  data: {
    teams: path('/data/regions/:provider/teams'),
  },
  projects: {
    index: projectsIndividualPlacementsPath,
    filter: projectsIndividualPlacementsPath.path('filter'),
    show: singleProjectPath,
    create: createAppointmentPaths(singleProjectPath),
  },
  sessions: {
    index: sessionsPath,
    search: sessionsPath.path('search'),
    inductions: sessionsPath.path('search/inductions'),
    show: singleSessionPath,
    update: singleSessionPath.path('update/:page'),
    create: createAppointmentPaths(singleSessionPath),
  },
  courseCompletions: {
    index: courseCompletionsPath,
    show: courseCompletionsShowPath,
    search: courseCompletionsPath.path('search'),
    process: courseCompletionsShowPath.path(':page'),
    createAppointment: courseCompletionsShowPath.path('create-new-appointment'),
    unableToCreditTime: courseCompletionsShowPath.path('unable-to-credit-time'),
  },
  appointments: {
    create: appointmentsPath.path('create/:page'),
    update: appointmentPath.path(':page'),
    travelTime: {
      index: appointmentsPath.path('attended'),
      filter: appointmentsPath.path('attended').path('filter'),
      update: travelTimeTaskPath,
      complete: travelTimeTaskPath.path('complete'),
      create: appointmentPath.path('credit-travel-time'),
    },
  },
  people: {
    find: peoplePath,
    requirement: peoplePath.path(':crn/requirement'),
    appointments: personAppointmentsPath.path(':appointmentSection'),
    appointmentsWithoutEvent: peoplePath.path(':crn/appointment/:projectCode/:appointmentId'),
    createAppointment: personAppointmentsPath.path('create/:projectTypeGroup'),
  },
}

export default paths
