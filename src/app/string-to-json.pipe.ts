import { validate } from 'codelyzer/walkerFactory/walkerFn';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stringToJson'
})
export class StringToJsonPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return JSON.parse(value);
  }

}
