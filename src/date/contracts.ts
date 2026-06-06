export type BuiltInDateFormat = 'date' | 'date-time' | 'unix-seconds' | 'unix-ms';

export type DateFormatString = string;

export interface DateFormatCodec {
  parse(value: string): Date;
  serialize(value: Date): string;
}
