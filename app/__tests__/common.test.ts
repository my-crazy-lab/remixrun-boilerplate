import { getFutureTime, getFutureTimeFromToday, groupPermissionsByModule, momentTz } from "~/utils/common";

describe('Common function', () => {
  describe('getFutureTime', () => {
    // Returns a moment object representing a future time when given a date and a duration.
    it('should return a moment object representing a future time when given a date and a duration', () => {
      const date = new Date();
      const futureTime = getFutureTime(date, 1, 'hour');
      expect(futureTime).toBeInstanceOf(momentTz);
    });

    // Returns an invalid date when given an invalid date.
    it('should return an invalid date when given an invalid date', () => {
      const invalidDate = new Date('invalid');
      const futureTime = getFutureTime(invalidDate, 1, 'hour');
      expect(futureTime.isValid()).toBe(false);
    });
  });

  describe('getFutureTimeFromToday', () => {
    // Returns a moment object representing a future time when passed valid duration inputs
    it('should return a moment object representing a future time when passed valid duration inputs', () => {
      const futureTime = getFutureTimeFromToday(1, 'day');
      expect(futureTime).toBeInstanceOf(momentTz);
    });

    // Returns a moment object representing a future time when passed a negative duration input
    it('should return a moment object representing a future time when passed a negative duration input', () => {
      const futureTime = getFutureTimeFromToday(-1, 'day');
      expect(futureTime).toBeInstanceOf(momentTz);
    });
  });

  describe('groupPermissionsByModule', () => {
    // Should group permissions by module correctly when given a valid array of permissions
    it('should group permissions by module correctly when given a valid array of permissions', () => {
      const mockPermissions = [
        { _id: '1', name: 'Permission 1', description: 'Description 1', module: 'Module 1', 'slug-module': 'Slug 1' },
        { _id: '2', name: 'Permission 2', description: 'Description 2', module: 'Module 2', 'slug-module': 'Slug 2' },
        { _id: '3', name: 'Permission 3', description: 'Description 3', module: 'Module 1', 'slug-module': 'Slug 3' },
      ];

      const result = groupPermissionsByModule(mockPermissions);

      expect(result).toEqual([
        {
          module: 'Module 1', actions: [
            { _id: '1', name: 'Permission 1', description: 'Description 1', 'slug-module': 'Slug 1' },
            { _id: '3', name: 'Permission 3', description: 'Description 3', 'slug-module': 'Slug 3' },
          ]
        },
        {
          module: 'Module 2', actions: [
            { _id: '2', name: 'Permission 2', description: 'Description 2', 'slug-module': 'Slug 2' },
          ]
        }
      ]);
    });
  })
})