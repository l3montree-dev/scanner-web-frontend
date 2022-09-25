export interface DOHResponse {
  Status: number;
  TC: boolean;
  RD: boolean;
  RA: boolean;
  AD: boolean;
  CD: boolean;
  Question: Array<{
    name: string;
    type: number;
  }>;
  Answer: Array<{
    name: string;
    type: number;
    TTL: number;
    data: string;
  }>;
}
