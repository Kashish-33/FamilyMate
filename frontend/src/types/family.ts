export type FamilyMember = {
  id: number;
  name: string;
  relation: string;
  age: number;
  gender: string;
  phone: string;
};
export type Family = {
  id: number;
  name?: string;
  owner_id?: number;
  members?: FamilyMember[];
};
