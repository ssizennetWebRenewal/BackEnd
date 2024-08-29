import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(
    private readonly configService: ConfigService,
  ) {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
      }
    })
  }

  getHello(): string {
    return 'Hello World!';
  }

  private readonly AWS_S3_BUCKET = 'ssizennet-storage-bucket';
  private readonly s3Client: S3Client;

  async uploadFile(file: Express.Multer.File): Promise<any> {
    const fileKey = `${uuidv4()}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: this.configService.get('AWS_S3_BUCKET'),
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    const imageUrl = `https://${this.configService.get('AWS_S3_BUCKET')}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${fileKey}`;
    this.logger.log(`File uploaded to S3: ${imageUrl}`);
    return imageUrl;
  }

  private async s3_upload(
    file: Buffer,
    bucket: string,
    name: string,
    mimetype: string,
  ): Promise<any> {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: name,
      Body: file,
      ContentType: mimetype,
      ContentDisposition: 'inline',
    });

    try {
      const s3Response = await this.s3Client.send(command);
      this.logger.log(`File uploaded to S3: ${name}`);
      return {
        message: 'File uploaded successfully',
        key: name,
        result: s3Response
      };
    } catch (e) {
      console.error('Error uploading to S3:', e);
      throw new Error('Error uploading file to S3');
    }
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.configService.get('AWS_S3_BUCKET'),
      Key: key,
    });
    this.logger.log(`Deleting file from S3: ${key}`);
    await this.s3Client.send(command);
  }
}
