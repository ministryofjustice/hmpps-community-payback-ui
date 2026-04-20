import request from 'superagent'
import { faker } from '@faker-js/faker'
import { randomUUID } from 'node:crypto'
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs'
import { Team } from '../fixtures/testOptions'
import PersonOnProbation from '../delius/personOnProbation'

export default async (
  externalApiClient: {
    enabled: boolean
    certBase64: string
    apiKey: string
    privateKeyBase64: string
    url: string
  },
  team: Team,
  personOnProbation?: PersonOnProbation,
) => {
  const messageContent = {
    externalRef: randomUUID(),
    firstName: personOnProbation?.firstName ?? faker.person.firstName(),
    lastName: personOnProbation?.lastName ?? faker.person.lastName(),
    completionDateTime: new Date().toISOString(),
    courseName: faker.helpers.arrayElement([
      'First aid',
      'Customer Service Excellence',
      'Food Hygiene Level 2',
      'Business Communication Skills',
      'Construction Skills',
      'Health and Safety Basics',
    ]),
    pdu: team.pdu,
    region: team.provider,
    email: faker.internet.email(),
  }

  if (externalApiClient.enabled) {
    const payload = JSON.parse(CourseCompletionMessageBuilder.toExternalApiMessage(messageContent))

    const cert = Buffer.from(externalApiClient.certBase64, 'base64').toString('binary')
    const privateKey = Buffer.from(externalApiClient.privateKeyBase64, 'base64').toString('binary')

    await request
      .post(externalApiClient.url)
      .cert(cert)
      .key(privateKey)
      .set('x-api-key', externalApiClient.apiKey)
      .set('Content-Type', 'application/json')
      .send(payload)
      .ok(r => r.status === 202)
  } else {
    const url: URL = new URL('http://localhost:4566')
    const sqsClient = new SQSClient({
      region: 'eu-west-2',
      endpoint: { url },
      credentials: {
        accessKeyId: 'doesntmatterforlocalstack',
        secretAccessKey: 'doesntmatterforlocalstack',
      },
    })
    const payload = CourseCompletionMessageBuilder.toSqsMessage(messageContent)

    await sqsClient.send(
      new SendMessageCommand({
        MessageBody: payload,
        QueueUrl: 'http://sqs.eu-west-2.localhost.localstack.cloud:4566/000000000000/cp_stack_course_completion_events',
      }),
    )
  }
}

export interface CourseCompletionContent {
  externalRef: string
  firstName: string
  lastName: string
  completionDateTime: string
  pdu: string
  region: string
  courseName: string
  email: string
}

export class CourseCompletionMessageBuilder {
  static toSqsMessage(content: CourseCompletionContent) {
    return `
    {
      "messageId": "${content.externalRef}",
      "eventType": "education-course.completion.created",
      "description": "A education course completion has been created",
      "messageAttributes": {
         "firstName": "${content.firstName}",
         "lastName": "${content.lastName}",
         "dateOfBirth": "1990-01-01",
         "region": "${content.region}",
         "pdu": "${content.pdu}",
         "office": "${content.region}",
         "email": "${content.email}",
         "courseName": "${content.courseName}",
         "courseType": "Example Course Type",
         "provider": "Moodle",
         "completionDateTime": "${content.completionDateTime}",
         "status": "Completed",
         "totalTimeMinutes": 150,
         "attempts": 1,
         "expectedTimeMinutes": 120,
         "externalReference": "${content.externalRef}"
      },
      "who": null
    }`
  }

  static toExternalApiMessage(content: CourseCompletionContent) {
    return `{
        "courseCompletion": {
          "externalReference": "${content.externalRef}",
          "person": {
            "firstName": "${content.firstName}",
            "lastName": "${content.lastName}",
            "dateOfBirth": "1990-01-01",
            "region": "${content.region}",
            "pdu": "${content.pdu}",
            "office": "Cardiff",
            "email": "${content.email}"
          },
          "course": {
            "courseName": "${content.courseName}",
            "courseType": "Example Course Type",
            "provider": "Moodle",
            "completionDateTime": "${content.completionDateTime}",
            "status": "Completed",
            "totalTimeMinutes": 150,
            "attempts": 1,
            "expectedTimeMinutes": 120
          }
        }
      }`
  }
}
