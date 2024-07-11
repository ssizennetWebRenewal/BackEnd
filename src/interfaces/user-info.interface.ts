export interface UserInfoKey {
    user_id: string; // hashKey(파티션 키)
    user_idx: string; // rangeKey(정렬 키)
  }
  
  export interface UserInfo extends UserInfoKey {
    user_email?: string;
  }