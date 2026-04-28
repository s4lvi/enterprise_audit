# RLS matrix (role × table × action)

Enforced in `supabase/migrations/20260426235002_initial_schema.sql`.
Sensitive writes are also recorded to `audit_log` via triggers
(`supabase/migrations/20260428042622_audit_log.sql`).

`✓ = allowed`, `✗ = denied`, `own = limited to your own row/chapter`,
`-- = N/A`. Auth role `anon` is denied everything; the listed roles all
require `authenticated`.

## chapters

|        | admin | auditor | chapter_exec | member |
| ------ | ----- | ------- | ------------ | ------ |
| SELECT | ✓     | ✓       | ✓            | ✓      |
| INSERT | ✓     | ✗       | ✗            | ✗      |
| UPDATE | ✓     | ✗       | ✗            | ✗      |
| DELETE | ✓     | ✗       | ✗            | ✗      |

## profiles

|        | admin                             | auditor               | chapter_exec          | member                |
| ------ | --------------------------------- | --------------------- | --------------------- | --------------------- |
| SELECT | ✓                                 | ✓                     | ✓                     | ✓                     |
| INSERT | (auto via trigger on auth signup) |                       |                       |                       |
| UPDATE | ✓                                 | own (no role/chapter) | own (no role/chapter) | own (no role/chapter) |
| DELETE | ✓                                 | ✗                     | ✗                     | ✗                     |

## enterprises

|        | admin | auditor | chapter_exec | member      |
| ------ | ----- | ------- | ------------ | ----------- |
| SELECT | ✓     | ✓       | ✓            | ✓           |
| INSERT | ✓     | ✓       | own chapter  | own chapter |
| UPDATE | ✓     | ✓       | own chapter  | own chapter |
| DELETE | ✓     | ✗       | ✗            | ✗           |

## enterprise_members

|        | admin | auditor | chapter_exec | member      |
| ------ | ----- | ------- | ------------ | ----------- |
| SELECT | ✓     | ✓       | ✓            | ✓           |
| INSERT | ✓     | ✓       | own chapter  | own chapter |
| UPDATE | ✓     | ✓       | own chapter  | own chapter |
| DELETE | ✓     | ✗       | ✗            | ✗           |

## audits

|        | admin                   | auditor                 | chapter_exec | member |
| ------ | ----------------------- | ----------------------- | ------------ | ------ |
| SELECT | ✓                       | ✓                       | ✓            | ✓      |
| INSERT | ✓ (must self-attribute) | ✓ (must self-attribute) | ✗            | ✗      |
| UPDATE | ✓                       | ✓ own audits only       | ✗            | ✗      |
| DELETE | ✓                       | ✗                       | ✗            | ✗      |

## enterprise_relationships

|        | admin | auditor | chapter_exec | member |
| ------ | ----- | ------- | ------------ | ------ |
| SELECT | ✓     | ✓       | ✓            | ✓      |
| INSERT | ✓     | ✓       | ✗            | ✗      |
| UPDATE | ✓     | ✓       | ✗            | ✗      |
| DELETE | ✓     | ✓       | ✗            | ✗      |

## audit_log

|        | admin                                             | auditor | chapter_exec | member |
| ------ | ------------------------------------------------- | ------- | ------------ | ------ |
| SELECT | ✓                                                 | ✗       | ✗            | ✗      |
| INSERT | (only via trigger; security definer bypasses RLS) |         |              |        |
| UPDATE | ✗                                                 | ✗       | ✗            | ✗      |
| DELETE | ✗                                                 | ✗       | ✗            | ✗      |

## TODO (post-v1)

- Automated test script (TS) that signs in as test users for each role
  and asserts each cell. Today this matrix is verified manually + by
  reading the SQL.
