import {
    DynamooseOptionsFactory,
    DynamooseModuleOptions,
  } from 'nestjs-dynamoose';
  
  export class DynamooseConfigService implements DynamooseOptionsFactory {
    createDynamooseOptions(): DynamooseModuleOptions {
      return {
        aws: {
          // .env에 선언해야 보안상 좋음
          accessKeyId: 'AKIAXYKJT4X22X33CFHU',
          secretAccessKey: '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', // 처음 액세스 키 만들 때 말고는 aws-cli로 쳐서 따로 봐야 하니 기록해둘 것
          region: 'ap-northeast-2',
        },
      };
    }
  }