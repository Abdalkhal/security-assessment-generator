import { AssetEnvironment, AssetType } from '../constants/asset';
import { OwnedEntity } from './common';

export interface Asset extends OwnedEntity {
  assessmentId: string;
  name: string;
  type: AssetType;
  location: string;
  environment: AssetEnvironment;
  description: string;
}

export type AssetInput = Omit<Asset, 'id' | 'ownerId' | 'createdAt' | 'updatedAt' | 'assessmentId'>;
