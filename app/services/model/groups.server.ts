import { Schema } from 'mongoose';
import type { Groups } from '~/types';
import { mongoClientBE } from '~/utils/db.server';

const GroupsSchema = new Schema<Groups>(
  {
    _id: {
      $type: String,
      required: true,
    },
    name: {
      $type: String,
      required: true,
    },
    description: {
      $type: String,
      required: true,
    },
    userIds: {
      $type: [String],
      required: true,
    },
    roleAssignedIds: {
      $type: [String],
      required: true,
    },
    roleIds: {
      $type: [String],
    },
    genealogy: {
      $type: [String],
    },
    nearestChildren: {
      $type: [String],
    },
    hierarchy: {
      $type: Number,
      required: true,
    },
    createdAt: {
      $type: Date,
      default: Date.now,
    },
    updatedAt: {
      $type: Date,
    },
    status: {
      $type: String,
      required: true,
    },
  },
  { typeKey: '$type', collection: 'groups' },
);

const GroupsModel = mongoClientBE.model('Groups', GroupsSchema);
export default GroupsModel;
