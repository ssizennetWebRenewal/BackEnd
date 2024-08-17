import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { Stream } from 'stream';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppService {
  constructor() {
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
    console.log(file);
    const { originalname, buffer, mimetype } = file;

    const uniqueFileName = `${uuidv4()}-${originalname}`;
    
    return await this.s3_upload(buffer, this.AWS_S3_BUCKET, uniqueFileName, mimetype);
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

  async getFile(key: string): Promise<Stream> {
    const command = new GetObjectCommand({
      Bucket: this.AWS_S3_BUCKET,
      Key: key,
    });

    try {
      const response = await this.s3Client.send(command);
      return response.Body as Stream;
    } catch (e) {
      console.error('Error getting file from S3:', e);
      throw new Error('Error getting file from S3');
    }
  }
}
