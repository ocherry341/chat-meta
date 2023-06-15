import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ name: 'deleteAllOrFilter', async: false })
export class DeleteAllOrFilter implements ValidatorConstraintInterface {
  validate(value: any, args?: ValidationArguments): boolean | Promise<boolean> {
    if (!args) return false;
    const haveDeleteAll = args.object['deleteAll'] !== undefined;
    const haveFilter = args.object['filter'] !== undefined;
    const haveOnlyOneField = haveDeleteAll !== haveFilter;
    const deleteAllIsBoolean = args.property === 'deleteAll' && value !== undefined ? typeof value === 'boolean' : true;
    const filterIsObject = args.property === 'filter' && value !== undefined ? typeof value === 'object' : true;
    return haveOnlyOneField && deleteAllIsBoolean && filterIsObject;
  }

  defaultMessage?(args?: ValidationArguments): string {
    let msg = '';
    if (!args) {
      msg += "validation arguments must be provided";
      return msg;
    }
    const haveOnlyOneField = (args.object['deleteAll'] !== undefined) !== (args.object['filter'] !== undefined);
    if (!haveOnlyOneField) {
      msg += `'deleteAll' and 'filter' must provided only one. `;
    }

    if (args.property === 'deleteAll') {
      msg += `'deleteAll' must be boolean`;
    }

    if (args.property === 'filter') {
      msg += `'filter' must be object`;
    }
    return msg;
  }
}