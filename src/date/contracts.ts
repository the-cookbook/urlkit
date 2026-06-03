export type BuiltInDateFormat = 'date' | 'date-time' | 'unix-seconds' | 'unix-ms';

export interface DateFormatCodec {
  parse(value: string): Date;
  serialize(value: Date): string;
}
