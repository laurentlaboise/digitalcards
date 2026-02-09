import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class ParseUUIDPipe implements PipeTransform<string, string> {
  constructor(private readonly paramName: string = 'id') {}

  transform(value: string, metadata: ArgumentMetadata): string {
    if (!UUID_REGEX.test(value)) {
      throw new BadRequestException(
        `Validation failed: "${metadata.data || this.paramName}" must be a valid UUID`,
      );
    }

    return value;
  }
}
