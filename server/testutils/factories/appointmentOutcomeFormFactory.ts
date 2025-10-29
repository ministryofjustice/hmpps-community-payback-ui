import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import attendanceDataFactory from './attendanceDataFactory'
import { AppointmentOutcomeForm } from '../../@types/user-defined'
import { contactOutcomeFactory } from './contactOutcomeFactory'
import enforcementActionFactory from './enforcementActionFactory'

export default Factory.define<AppointmentOutcomeForm>(
  () =>
    ({
      startTime: '09:00',
      endTime: '17:00',
      contactOutcome: contactOutcomeFactory.build(),
      attendanceData: attendanceDataFactory.build(),
      enforcement: enforcementActionFactory.build(),
      supervisorOfficerCode: faker.string.alpha(10),
      notes: faker.string.alpha(30),
    }) satisfies AppointmentOutcomeForm,
)
