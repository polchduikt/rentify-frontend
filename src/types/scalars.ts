declare const scalarBrand: unique symbol;

type Brand<T, B extends string> = T & { readonly [scalarBrand]?: B };

export type Decimal = Brand<number, 'Decimal'>;
export type LocalDateString = Brand<string, 'LocalDateString'>;
export type LocalTimeString = Brand<string, 'LocalTimeString'>;
export type ZonedDateTimeString = Brand<string, 'ZonedDateTimeString'>;

export const asDecimal = (value: number): Decimal => value as Decimal;
export const asLocalDateString = (value: string): LocalDateString => value as LocalDateString;
export const asLocalTimeString = (value: string): LocalTimeString => value as LocalTimeString;
export const asZonedDateTimeString = (value: string): ZonedDateTimeString => value as ZonedDateTimeString;
