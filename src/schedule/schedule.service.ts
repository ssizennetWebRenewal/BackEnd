import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ScheduleService {
    async createKakaoSchedule() {
        const headers = {
            'Authorization': 'Bearer 00c06c78f75c878fe988f136e8b42b61',
            'Content-Type': 'application/json',
            'redirect_uri': 'http://localhost:3000'
        };

        const ans = await axios.post("https://kauth.kakao.com/oauth/authorize", {headers: headers});
        console.log(ans.data);
    }
}
