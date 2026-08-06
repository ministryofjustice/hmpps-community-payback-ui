import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import appointmentSummaryFactory from './appointmentSummaryFactory'
import { Session } from '../../@types/user-defined'
import projectFactory from './projectFactory'

export default Factory.define<Session>(() => ({
  ...projectFactory.build(),
  date: faker.date.recent().toISOString().split('T')[0],
  appointmentSummaries: appointmentSummaryFactory.buildList(3),
}))
