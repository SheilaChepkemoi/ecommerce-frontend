export interface BrandResponse {
  id: number;
  name: string;
  code: string;
  active: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface BrandRequest {
  name: string;
  code: string | null;
}
