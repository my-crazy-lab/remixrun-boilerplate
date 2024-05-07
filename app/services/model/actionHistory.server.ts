import { Schema } from 'mongoose';
import type { ActionsHistory } from '~/types';
import { mongoClientBE } from '~/utils/db.server';

const ActionsHistorySchema = new Schema<ActionsHistory>(
  {
    _id: {
      $type: String,
      required: true,
    },
    actorId: {
      $type: String,
    },
    action: { $type: String },
    requestFormData: { $type: Schema.Types.Mixed },
    createdAt: { $type: Date, required: true },
  },
  { typeKey: '$type', collection: 'actionHistory' },
);

const ActionsHistoryModel = mongoClientBE.model(
  'ActionsHistory',
  ActionsHistorySchema,
);

export default ActionsHistoryModel;
