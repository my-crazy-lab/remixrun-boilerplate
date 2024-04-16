import { Schema } from 'mongoose';
import { mongoClientBE } from '~/utils/db.server';

const ActionsHistorySchema = new Schema(
  {
    userId: {
      $type: String,
      required: true,
      ref: 'Users',
    },
    action: { $type: String, required: true },
    data: { $type: Schema.Types.Mixed, required: true },
    createdAt: { $type: Date, required: true },
  },
  { typeKey: '$type', collection: 'actionHistory' },
);

const ActionsHistoryModel = mongoClientBE.model(
  'ActionsHistory',
  ActionsHistorySchema,
);

export default ActionsHistoryModel;
