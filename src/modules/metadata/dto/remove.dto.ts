import { IsOptional, IsString, Validate } from "class-validator";
import { DeleteAllOrFilter } from "./deleteAll-or-filter";

export class RemoveDto {
  @IsOptional()
  @IsString()
  readonly namespace?: string;

  @Validate(DeleteAllOrFilter)
  readonly deleteAll?: boolean;

  @Validate(DeleteAllOrFilter)
  readonly filter?: Object;
}