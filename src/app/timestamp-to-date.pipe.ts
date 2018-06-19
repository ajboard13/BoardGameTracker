import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timestampToDate'
})
export class TimestampToDatePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    var date = new Date(value.seconds * 1000);
    var dateObject =  ('0' + (date.getMonth() + 1)).slice(-2) +'/'+ ('0' + date.getDate()).slice(-2)  +'/' +date.getFullYear();
    return dateObject;
  }

}
