import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import paths from '../../server/paths/api'
import { AppointmentDto } from '../../server/@types/shared'

export default {
  stubFindAppointment: ({ appointment }: { appointment: AppointmentDto }): SuperAgentRequest => {
    const pattern = paths.appointments.singleAppointment({ appointmentId: appointment.id.toString() })
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: pattern,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          ...appointment,
        },
      },
    })
  },
}
