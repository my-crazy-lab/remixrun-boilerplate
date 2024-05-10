import { task, taskName } from './task.server';
import { workingPlaces, workingPlacesName } from './workingPlaces.server';

const ID = { task, workingPlaces };

export const IDName = { task: taskName, workingPlaces: workingPlacesName };

export default ID;
