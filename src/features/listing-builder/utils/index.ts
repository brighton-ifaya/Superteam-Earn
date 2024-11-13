import { z } from 'zod';

import { BONUS_REWARD_POSITION } from '@/constants';

import {
  createListingFormSchema,
  type ListingFormData,
  type ListingStatus,
} from '../types';

export * from './rewards';
export * from './skills';
export * from './suggestions';

export const calculateTotalOfArray = (values: number[]) =>
  values.reduce((a, b) => (a ?? 0) + (b ?? 0), 0);

export const caculateBonus = (
  bonusSpots: number | undefined,
  bonusReward: number | undefined,
) => (bonusSpots ?? 0) * (bonusReward ?? 0);

export const formatTotalPrice = (total: number) =>
  new Intl.NumberFormat('en-US', {
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(total as number);

export const timeToCompleteOptions = [
  { value: '<1 Week', label: '<1 Week' },
  { value: '1-2 Weeks', label: '1-2 Weeks' },
  { value: '2-4 Weeks', label: '2-4 Weeks' },
  { value: '4-8 Weeks', label: '4-8 Weeks' },
  { value: '>8 Weeks', label: '>8 Weeks' },
];

export const listingToStatus = (listing: ListingFormData): ListingStatus => {
  if (listing.status === 'OPEN') {
    if (listing.isPublished) {
      return 'published';
    } else {
      if (!!listing.publishedAt) {
        return 'unpublished';
      } else {
        return 'draft';
      }
    }
  } else if (listing.status === 'VERIFYING') {
    return 'verifying';
  }
  return 'draft';
};

export const getListingDefaults = (
  isGod: boolean,
  editable: boolean,
  isST: boolean,
) => {
  const schema = createListingFormSchema(isGod, editable, isST);

  // Get the inner schema by unwrapping the ZodEffects
  const getInnerSchema = (schema: z.ZodTypeAny): z.ZodObject<any> => {
    if (schema instanceof z.ZodEffects) {
      return getInnerSchema(schema.innerType());
    }
    return schema as z.ZodObject<any>;
  };

  const innerSchema = getInnerSchema(schema);
  const shape = innerSchema.shape;

  const defaults: Record<string, any> = {};

  for (const [key, value] of Object.entries(shape)) {
    const zodValue = value as z.ZodTypeAny;

    if (zodValue instanceof z.ZodDefault) {
      defaults[key] = zodValue._def.defaultValue();
    } else if (zodValue instanceof z.ZodOptional) {
      if (zodValue._def.innerType instanceof z.ZodObject) {
        defaults[key] = {};
      } else if (zodValue._def.innerType instanceof z.ZodArray) {
        defaults[key] = [];
      } else if (zodValue._def.innerType instanceof z.ZodString) {
        defaults[key] = '';
      } else {
        defaults[key] = undefined;
      }
    } else if ('defaultValue' in zodValue._def) {
      defaults[key] = zodValue._def.defaultValue;
    } else {
      if (zodValue instanceof z.ZodObject) {
        defaults[key] = {};
      } else if (zodValue instanceof z.ZodArray) {
        defaults[key] = [];
      } else if (zodValue instanceof z.ZodString) {
        defaults[key] = '';
      } else {
        defaults[key] = undefined;
      }
    }
  }

  return defaults as ListingFormData;
};

export const calculateTotalRewardsForPodium = (
  currentRewards: Record<string, number>,
  maxBonusSpots?: number,
) => {
  return Object.entries(currentRewards).reduce((sum, [pos, value]) => {
    if (isNaN(value)) return sum;

    if (Number(pos) === BONUS_REWARD_POSITION) {
      console.log('bonus reward', value, maxBonusSpots);
      return sum + value * (maxBonusSpots || 0);
    }
    return sum + value;
  }, 0);
};
