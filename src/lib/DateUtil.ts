export class DateUtil 
{
  static formatDate(date: string) 
  {
    let dateObj: Date = new Date(date);
    return dateObj.getDate() + "." + (dateObj.getMonth() + 1) + "." + dateObj.getFullYear();
  }
}