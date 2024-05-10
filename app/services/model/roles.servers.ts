import { Schema } from 'mongoose';
import type { Roles } from '~/types';
import { mongoClientBE } from '~/utils/db.server';

const RolesSchema = new Schema<Roles>(
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
    permissions: {
      $type: [String],
      required: true,
    },
    slug: {
      $type: String,
      required: true,
    },
    createdAt: { $type: Date, default: Date.now },
    updatedAt: {
      $type: Date,
    },
    status: {
      $type: String,
      required: true,
    },
  },
  { typeKey: '$type', collection: 'roles' },
);

const RolesModel = mongoClientBE.model('Roles', RolesSchema);
export default RolesModel;
