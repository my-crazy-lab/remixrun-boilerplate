import { Schema } from 'mongoose';
import { mongoClientApp } from '~/utils/db.server';

const WorkingPlacesSchema = new Schema(
  {
    _id: { $type: String, required: true },
    countryCode: { $type: String },
    countryName: { $type: String },
    cities: [
      {
        name: { $type: String, required: true },
        code: { $type: String },
        districts: [String],
      },
    ],
  },
  { typeKey: '$type', collection: 'workingPlaces' },
);

const WorkingPlacesModel = mongoClientApp.model(
  'th_workingPlaces',
  WorkingPlacesSchema,
);

export const workingPlaces = WorkingPlacesModel;
