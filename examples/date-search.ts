import { date, dateTime, search } from '@cookbook/urlkit';

const Reports = search({
  day: date(),
  publishedAt: dateTime().optional(),
  importedAtSeconds: date({ format: 'unix-seconds' }).optional(),
  importedAtMs: date({ format: 'unix-ms' }).optional(),
});

const reportState = Reports.parse(
  '/reports?day=2026-06-02&publishedAt=2026-06-02T12:30:00.000Z&importedAtSeconds=1780403400&importedAtMs=1780403400000',
);

// date() is date-only and serializes as YYYY-MM-DD.
// dateTime() serializes as strict UTC YYYY-MM-DDTHH:mm:ss.sssZ.
// Unix formats require finite integer seconds or milliseconds.

const reportHref = Reports.build({
  search: {
    day: new Date('2026-06-02T00:00:00.000Z'),
    publishedAt: new Date('2026-06-02T12:30:00.000Z'),
    importedAtSeconds: new Date('2026-06-02T12:30:00.000Z'),
    importedAtMs: new Date('2026-06-02T12:30:00.000Z'),
  },
});

// reportHref === '?day=2026-06-02&publishedAt=2026-06-02T12%3A30%3A00.000Z&importedAtSeconds=1780403400&importedAtMs=1780403400000'

const EuropeanDateSearch = search({
  from: date({
    format: {
      parse(value) {
        const [day, month, year] = value.split('-');
        return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
      },
      serialize(value) {
        const day = String(value.getUTCDate()).padStart(2, '0');
        const month = String(value.getUTCMonth() + 1).padStart(2, '0');
        return `${day}-${month}-${value.getUTCFullYear()}`;
      },
    },
  }),
});

const customDateHref = EuropeanDateSearch.build({
  search: { from: new Date('2026-06-02T00:00:00.000Z') },
});

// customDateHref === '?from=02-06-2026'

export { EuropeanDateSearch, Reports, customDateHref, reportHref, reportState };
