import type { PageQuery } from '@/types/api';

type Primitive = string | number | boolean;
type QueryValue = Primitive | Primitive[] | undefined | null;

export type QueryParams = Record<string, QueryValue>;

export const cleanQueryParams = <T extends object>(
  params: T
): Record<string, Primitive | Primitive[]> => {
  const result: Record<string, Primitive | Primitive[]> = {};

  Object.entries(params as Record<string, QueryValue>).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    result[key] = value;
  });

  return result;
};

export const withPageQuery = (page?: PageQuery): Record<string, Primitive | Primitive[]> => {
  if (!page) {
    return {};
  }

  return cleanQueryParams({
    page: page.page,
    size: page.size,
    sort: page.sort,
  });
};
