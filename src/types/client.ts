import { OwnedEntity } from './common';

export interface Client extends OwnedEntity {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  industry: string;
  notes: string;
}

export type ClientInput = Omit<Client, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>;
