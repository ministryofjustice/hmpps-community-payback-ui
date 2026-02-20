import request from 'superagent'
import { faker } from '@faker-js/faker'
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs'

export default async (externalApiClient: {
  enabled: boolean
  certBase64: string
  apiKey: string
  privateKeyBase64: string
  url: string
}) => {
  const messageContent = {
    externalRef: crypto.randomUUID(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    completionDate: new Date().toISOString().split('T')[0],
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
  completionDate: string
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
         "region": "East of England",
         "email": "john.doe@example.com",
         "courseName": "First Aid",
         "courseType": "Example Course Type",
         "provider": "Moodle",
         "completionDate": "${content.completionDate}",
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
            "region": "East of England",
            "email": "john.doe@example.com"
          },
          "course": {
            "courseName": "First Aid",
            "courseType": "Example Course Type",
            "provider": "Moodle",
            "completionDate": "${content.completionDate}",
            "status": "Completed",
            "totalTimeMinutes": 150,
            "attempts": 1,
            "expectedTimeMinutes": 120
          }
        }
      }`
  }
}
