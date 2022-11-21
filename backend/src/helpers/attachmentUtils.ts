import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('AttachmentUtils');
// TODO: Implement the fileStogare logic

class attachmentUtils {
  constructor(
    private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
    private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION) {
  }

  getAttachmentUrl(todoId: string): string {
    const attachmentUrl = this.s3.getSignedUrl('getObject', {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: Number(this.urlExpiration),
    })

    return attachmentUrl
  }

  async generateUploadUrl(todoId: string): Promise<string> {
    logger.info('Generating upload url', { todoId })
    const uploadUrl = this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: Number(this.urlExpiration),
    })
    logger.info('Generated upload url', { uploadUrl })
    return uploadUrl;
  }
}

export const AttachmentUtils = new attachmentUtils()


