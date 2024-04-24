import { Schema } from 'mongoose';
import { mongoClientBE } from '~/utils/db.server';

const UsersSchema = new Schema(
  {
    _id: {
      $type: String,
      required: true,
    },
    username: {
      $type: String,
      required: true,
    },
    email: {
      $type: String,
      required: true,
    },
    isoCode: {
      $type: String,
      required: true,
    },
    createdAt: { $type: Date, default: Date.now },
    status: {
      $type: String,
      required: true,
    },
    cities: {
      $type: [String],
      required: true,
    },
    services: {
      password: {
        bcrypt: {
          $type: String,
        },
      },
    },
    verification: {
      code: {
        $type: String,
      },
      token: {
        $type: String,
      },
      expired: {
        $type: Date,
      },
    },
    resetPassword: {
      token: {
        $type: String,
      },
      expired: {
        $type: Date,
      },
    },
  },
  { typeKey: '$type', collection: 'users' },
);

const UsersModel = mongoClientBE.model('Users', UsersSchema);
export default UsersModel;
