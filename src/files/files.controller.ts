import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Controller, Get, Param } from '@nestjs/common'
import { v4 as uuid } from 'uuid'

@Controller('files')
export class FilesController {
  @Get('presigned-url/:fileType')
  async getPresignedUrl(@Param('fileType') fileType: string) {
    const bucketName = process.env.AWS_S3_BUCKET_NAME

    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_IAM_USER_ACCESS_KEY,
        secretAccessKey: process.env.AWS_IAM_USER_SECRET_ACCESS_KEY
      }
    })

    const fileName = `${uuid()}-${uuid()}.${fileType}`

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName
    })

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 120
    })

    return {
      data: {
        pre_signed_url: signedUrl,
        file_url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`
      }
    }
  }
}
