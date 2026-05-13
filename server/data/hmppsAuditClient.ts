import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs'
import logger from '../../logger'

export interface AuditEvent {
  what: string
  who: string
  subjectId?: string
  subjectType?: string
  correlationId?: string
  details?: object
}

export interface SqsMessage {
  what: string
  who: string
  when: string
  service: string
  subjectId?: string
  subjectType?: string
  correlationId?: string
  details?: string
}

export interface AuditClientConfig {
  queueUrl: string
  region: string
  serviceName: string
  enabled: boolean
  logErrors: boolean
}

export default class HmppsAuditClient {
  private sqsClient: SQSClient

  private queueUrl: string

  private serviceName: string

  private enabled: boolean

  private logErrors: boolean

  constructor(config: AuditClientConfig) {
    this.enabled = config.enabled
    this.queueUrl = config.queueUrl
    this.serviceName = config.serviceName
    this.sqsClient = new SQSClient({ region: config.region })
    this.logErrors = config.logErrors
  }

  async sendAuditMessage(
    action: string,
    username: string,
    details: Record<string, string>,
    correlationId: string,
    subjectType?: string,
    subjectId?: string,
  ) {
    const jsonDetails = JSON.stringify(details)

    const jsonMessage = JSON.stringify({
      what: action,
      who: username,
      when: new Date(),
      service: this.serviceName,
      details: jsonDetails,
      correlationId,
      subjectType,
      subjectId,
    })

    try {
      logger.info(`Sending audit message ${action} (${jsonDetails})`)
      await this.sqsClient.send(
        new SendMessageCommand({
          MessageBody: jsonMessage,
          QueueUrl: this.queueUrl,
        }),
      )
    } catch (error) {
      if (this.logErrors) {
        logger.error('Problem sending audit message to SQS queue', error)
      }
    }
  }

  async sendMessage(event: AuditEvent, throwOnError: boolean = true) {
    if (!this.enabled) return null

    const sqsMessage: SqsMessage = {
      ...event,
      details: JSON.stringify(event.details),
      service: this.serviceName,
      when: new Date().toISOString(),
    }

    try {
      const messageResponse = await this.sqsClient.send(
        new SendMessageCommand({ MessageBody: JSON.stringify(sqsMessage), QueueUrl: this.queueUrl }),
      )

      logger.info(`HMPPS Audit SQS message sent (${messageResponse.MessageId})`)

      return messageResponse
    } catch (error) {
      logger.error('Error sending HMPPS Audit SQS message, ', error)
      if (throwOnError) throw error
    }
    return null
  }
}
