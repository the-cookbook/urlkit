import { boolean, object, search, string } from '@cookbook/urlkit';

const UserFilters = search({
  filter: object({
    role: string().optional(),
    active: boolean().optional(),
    profile: object({
      city: string().optional(),
    }).optional(),
    'user.name': string().optional(),
    'literal~key': string().optional(),
    'path~id': string().optional(),
  }),
});

const parsed = UserFilters.parse(
  '/users?filter.role=admin&filter.profile.city=Berlin&filter.user%7E1name=Ada&filter.literal%7E0key=value&filter.path%7E0id=abc',
);

// parsed.search.filter.role === 'admin'
// parsed.search.filter.profile?.city === 'Berlin'
// parsed.search.filter['user.name'] === 'Ada'
// parsed.search.filter['literal~key'] === 'value'
// parsed.search.filter['path~id'] === 'abc'

const built = UserFilters.build({
  search: {
    filter: {
      role: 'admin',
      active: true,
      profile: { city: 'Berlin' },
      'user.name': 'Ada',
      'literal~key': 'value',
      'path~id': 'abc',
    },
  },
});

// Object search uses dot notation for declared object fields.
// Object key segment escaping happens before URL encoding:
//   '~' -> '~0'
//   '.' -> '~1'
// built === '?filter.role=admin&filter.active=true&filter.profile.city=Berlin&filter.user%7E1name=Ada&filter.literal%7E0key=value&filter.path%7E0id=abc'

const collisionSafe = UserFilters.safeParse('/users?filter.path~id=a&filter.path%7E0id=b');

// collisionSafe.success === false
// Ambiguous object search paths throw UrlKitError with code "invalid-search".

export { UserFilters, built, collisionSafe, parsed };
