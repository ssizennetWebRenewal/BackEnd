import { Module } from '@nestjs/common';
import { RentService } from './rent.service';
import { RentController } from './rent.controller';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RentsSchema } from 'src/model/schemas/Rents.schema';
import { DynamooseConfigService } from 'src/dynamoose-config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    DynamooseModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DynamooseConfigService,
      inject: [ConfigService],
    }),
    DynamooseModule.forFeature([
      { name: 'Rents', schema: RentsSchema },
    ]),
  ],
  providers: [RentService],
  controllers: [RentController],
  exports: [RentService]
})
export class RentModule {}
