import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DynamooseOptionsFactory,
  DynamooseModuleOptions,
} from 'nestjs-dynamoose';

@Injectable()
export class DynamooseConfigService implements DynamooseOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createDynamooseOptions(): DynamooseModuleOptions {
    return {
      aws: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
        region: this.configService.get('AWS_REGION'),
      },
    };
  }
}
