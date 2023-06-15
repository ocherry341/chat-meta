
import { ValidationArguments } from 'class-validator';
import { DeleteAllOrFilter } from './deleteAll-or-filter';

describe('deleteAll-or-filter', () => {
  let testSpec: DeleteAllOrFilter = null;

  beforeEach(async () => {
    testSpec = new DeleteAllOrFilter();
  });

  it('should be defined', () => {
    expect(testSpec).toBeDefined();
  });

  describe('validate', () => {
    describe('should return true when', () => {
      it('deleteAll is boolean and filter is undefined', () => {
        const args = {
          object: {
            deleteAll: false,
          },
          property: 'deleteAll',
        } as ValidationArguments;
        expect(testSpec.validate(false, args)).toBe(true);
        expect(testSpec.validate(undefined, args)).toBe(true);
      });

      it('when deleteAll is undefined and filter is object', () => {
        const args = {
          object: {
            filter: {},
          },
          property: 'filter',
        } as ValidationArguments;
        expect(testSpec.validate({}, args)).toBe(true);
        expect(testSpec.validate(undefined, args)).toBe(true);
      });
    });

    describe('should return false when', () => {
      it('deleteAll is boolean and filter is object', () => {
        const args = {
          object: {
            deleteAll: true,
            filter: {},
          },
          property: 'deleteAll',
        } as ValidationArguments;
        expect(testSpec.validate(true, args)).toBe(false);
      });

      it('deleteAll is undefined and filter is undefined', () => {
        const args = {
          object: {},
          property: 'deleteAll',
        } as ValidationArguments;
        expect(testSpec.validate(true, args)).toBe(false);
      });

      it('deleteAll is not boolean and filter is undefined', () => {
        const args = {
          object: {
            deleteAll: 'true',
          },
          property: 'deleteAll',
        } as ValidationArguments;
        expect(testSpec.validate('true', args)).toBe(false);
      });

      it('deleteAll is undefined and filter is not object', () => {
        const args = {
          object: {
            filter: 'true',
          },
          property: 'filter',
        } as ValidationArguments;
        expect(testSpec.validate('filter', args)).toBe(false);
      });

    });


  });
});
