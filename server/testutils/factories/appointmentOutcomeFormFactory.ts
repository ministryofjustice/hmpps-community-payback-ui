import { Factory } from 'fishery'
import attendanceDataFactory from './attendanceDataFactory'
import { AppointmentOutcomeForm } from '../../@types/user-defined'
import { contactOutcomeFactory } from './contactOutcomeFactory'
import supervisorSummaryFactory from './supervisorSummaryFactory'

export default Factory.define<AppointmentOutcomeForm>(
  () =>
    ({
      startTime: '09:00',
      endTime: '17:00',
      contactOutcome: contactOutcomeFactory.build(),
      attendanceData: attendanceDataFactory.build(),
      supervisor: supervisorSummaryFactory.build(),
      notes: null,
      sensitive: null,
    }) satisfies AppointmentOutcomeForm,
)
