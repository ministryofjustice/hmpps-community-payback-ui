/* istanbul ignore file */

import type { Services } from '../../services'
import AttendanceOutcomeController from './attendanceOutcomeController'
import LogHoursController from './logHoursController'

const controllers = (services: Services) => {
  const attendanceOutcomeController = new AttendanceOutcomeController(
    services.appointmentService,
    services.referenceDataService,
  )

  const logHoursController = new LogHoursController(services.appointmentService)

  return {
    attendanceOutcomeController,
    logHoursController,
  }
}

export default controllers
