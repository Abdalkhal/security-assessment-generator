import { ScopeItemType, ScopeSide } from '../constants/scope';
import { OwnedEntity } from './common';

export interface ScopeItem extends OwnedEntity {
  assessmentId: string;
  side: ScopeSide;
  type: ScopeItemType;
  value: string;
  notes?: string;
}

export type ScopeItemInput = Omit<
  ScopeItem,
  'id' | 'ownerId' | 'createdAt' | 'updatedAt' | 'assessmentId'
>;
