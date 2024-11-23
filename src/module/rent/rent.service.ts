import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from 'nestjs-dynamoose';
import { RentsSchema } from 'src/model/schemas/Rents.schema';
import { ApplyRentDto, ApproveRentDto, UpdateRentDto } from './dto/rent.dto';
import { model } from 'dynamoose';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';

@Injectable()
export class RentService {
    private readonly logger = new Logger(RentService.name);

    constructor(
        @InjectModel('Rents')
        private readonly RentsModel = model("Rents", RentsSchema),
      ) {}
      
    async applyRent(apply: ApplyRentDto, userId: string, userName: string): Promise<any> {
        const startDate = new Date(apply.startDate).toISOString();
        const endDate = new Date(apply.endDate).toISOString();

        const combinedDate = `${startDate}#${endDate}`;

        const conflictingRents = await this.RentsModel.query("constTrue")
            .eq(1)
            .using("DateIndex")
            .where("combinedDate").eq(combinedDate)
            .exec();
        
        const conflictingEquipment = conflictingRents.filter(rent => {
            if (rent && rent.equipmentList && Array.isArray(rent.equipmentList)) {
                return rent.equipmentList.some((equipment: any) =>
                    apply.equipmentList.some(
                        (newEquipment: any) =>
                            equipment.category === newEquipment.category &&
                            Array.isArray(equipment.items) &&
                            equipment.items.some((item: string) => newEquipment.items.includes(item))
                    )
                );
            }
            return false;
        });

        if (conflictingEquipment.length > 0) {
            throw new HttpException('대여 기간 중 겹치는 장비가 이미 대여 중입니다.', 409);
        }

        const newRent = new this.RentsModel({
          id: uuidv4(),
          startDate: startDate,
          endDate: endDate,
          team: apply.team,
          title: apply.title,
          applicantId: userId,
          applicantName: userName,
          approved: 0,
          equipmentList: apply.equipmentList,
          combinedDate: combinedDate
        });
      
        await newRent.save();
        this.logger.log(`대여 신청: ${newRent.title}, ${newRent.applicantName} (${newRent.id})`);
        return newRent;
    }

    async monthRented(year: number, month: number): Promise<any[]> {
        const startOfMonth = moment(`${year}-${month}`, "YYYY-MM").startOf('month').toISOString();
        const endOfMonth = moment(`${year}-${month}`, "YYYY-MM").endOf('month').toISOString();
        
        const rents = await this.RentsModel.query("constTrue")
            .eq(1)
            .where("combinedDate")
            .between(`${startOfMonth}#0000-00-00T00:00:00.000Z`, `${endOfMonth}#9999-99-99T99:99:99.999Z`)
            .using("DateIndex")
            .exec();

        if (rents.length === 0) {
            throw new HttpException('선택한 달에 대여 정보가 없습니다.', 204);
        }

        return rents;
    }

    async getRent(page: number, count: number): Promise<any[]> {
        let exclusiveStartKey = null;
        let items: any[] = [];
    
        for (let i = 0; i < page; i++) {
            const result: any = await this.RentsModel.query("constTrue")
                .eq(1)
                .using("DateIndex")
                .limit(count)
                .startAt(exclusiveStartKey)
                .sort("descending")
                .exec();
            
            items = result;
            exclusiveStartKey = result.lastKey;
        }
    
        if (items.length === 0) {
            throw new HttpException('대여 정보가 없습니다.', 204);
        }
        return items;
    }

    async getRentById(id: string): Promise<any> {
        const rent = await this.RentsModel.query("id").eq(id).exec().then((res) => res[0]);
        if (!rent) {
            throw new HttpException('대여 정보를 찾을 수 없습니다.', 404);
        }
        return rent;
    }

    async updateRent(id: string, updateRentDto: UpdateRentDto, user: any): Promise<void> {
        const rent = await this.RentsModel.query("id").eq(id).exec().then((res) => res[0]);
        if (!rent) {
            throw new HttpException('대여 정보를 찾을 수 없습니다.', 404);
        } else if (user.role === '사용자' && rent.applicantId !== user.id) {
            throw new HttpException('본인이 작성한 대여만 수정할 수 있습니다.', 403);
        }

        const currentTime = new Date().toISOString();
        const startTime = updateRentDto.startDate ? new Date(updateRentDto.startDate).toISOString() : rent.startDate;
        const endTime = updateRentDto.endDate ? new Date(updateRentDto.endDate).toISOString() : rent.endDate;

        if (startTime < currentTime) {
            throw new HttpException('이미 시작된 대여는 수정할 수 없습니다.', 403);
        }

        const updateData = {
            ...updateRentDto,
            startDate: startTime,
            endDate: endTime,
            approved: 0
        };
        await this.RentsModel.update({ id }, updateData);
        this.logger.log(`대여 수정: ${rent.title}, ${user.id} (${rent.id})`);
    }

    async approveRent(approveRentDto: ApproveRentDto): Promise<void> {
        const { id, approved } = approveRentDto;
        const rent = await this.RentsModel.query("id").eq(id).exec().then((res) => res[0]);
        if (!rent) {
            throw new HttpException('대여 정보를 찾을 수 없습니다.', 404);
        }

        const currentTime = new Date().toISOString();
        
        if (rent.endDate < currentTime) {
            throw new HttpException('이미 지난 대여는 승인 상태를 변경할 수 없습니다.', 403);
        }

        rent.approved = approved;
        await this.RentsModel.update({ id }, { approved });
        this.logger.log(`대여 승인: ${rent.title} (${rent.id})`);
    }

    async deleteRent(id: string, user: any): Promise<void> {
        const rent = await this.RentsModel.query("id").eq(id).exec().then((res) => res[0]);
        if (!rent) {
            throw new HttpException('대여 정보를 찾을 수 없습니다.', 404);
        }

        if (user.role === '사용자' && rent.applicantId !== user.id) {
            throw new HttpException('본인이 작성한 대여만 삭제할 수 있습니다.', 403);
        }

        await this.RentsModel.delete({ id });
        this.logger.log(`대여 삭제: ${rent.title}, ${user.id} (${rent.id})`);
    }
}
