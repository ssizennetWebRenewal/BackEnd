import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {}
    
    /*
    @Get('test')
    async test() {
        this.userService.test("partition", "sorting", "ect");
    }
    */


}
