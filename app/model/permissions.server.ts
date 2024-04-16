import { Schema } from 'mongoose';
import { mongoClientBE } from '~/utils/db.server';

const PermissionsSchema = new Schema(
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
    module: {
      $type: String,
      required: true,
    },
    'slug-module': {
      $type: String,
      required: true,
    },
  },
  { typeKey: '$type', collection: 'permissions' },
);

const PermissionsModel = mongoClientBE.model('Permissions', PermissionsSchema);
export default PermissionsModel;
