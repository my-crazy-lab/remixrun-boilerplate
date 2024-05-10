import { Schema } from 'mongoose';
import { mongoClientApp } from '~/utils/db.server';

export const workingPlacesName = 'workingPlaces';
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
  { typeKey: '$type', collection: workingPlacesName },
);

const WorkingPlacesModel = mongoClientApp.model(
  'th_workingPlaces',
  WorkingPlacesSchema,
);

export const workingPlaces = WorkingPlacesModel;
