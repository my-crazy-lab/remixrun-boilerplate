import moment from 'moment-timezone';

moment.tz.setDefault('Asia/Jakarta');
moment.locale('en');

export const momentTz = moment;

export const getFutureTime = (date: Date, ...args) =>
  momentTz(date).add(...args);
export const getFutureTimeFromToday = (...args) => momentTz().add(...args);
