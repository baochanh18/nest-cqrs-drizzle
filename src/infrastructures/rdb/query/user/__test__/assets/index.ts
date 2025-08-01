import type { GetAllUsersResult } from 'use-cases/users/query/get-all-users/result';

export const MOCK_USERS_DATA: GetAllUsersResult[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
  },
  {
    id: 4,
    name: 'Alice Williams',
    email: 'alice.williams@example.com',
  },
  {
    id: 5,
    name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
  },
  {
    id: 6,
    name: 'Diana Davis',
    email: 'diana.davis@example.com',
  },
  {
    id: 7,
    name: 'Edward Wilson',
    email: 'edward.wilson@example.com',
  },
  {
    id: 8,
    name: 'Fiona Martinez',
    email: 'fiona.martinez@example.com',
  },
  {
    id: 9,
    name: 'George Garcia',
    email: 'george.garcia@example.com',
  },
  {
    id: 10,
    name: 'Hannah Rodriguez',
    email: 'hannah.rodriguez@example.com',
  },
];

export const PAGINATION_PARAMS = {
  firstPage: {
    page: 1,
    limit: 3,
  },
  secondPage: {
    page: 2,
    limit: 3,
  },
  largePage: {
    page: 1,
    limit: 10,
  },
  outOfRange: {
    page: 100,
    limit: 5,
  },
  singleItem: {
    page: 1,
    limit: 1,
  },
};

const FIRST_PAGE_START = 0;
const FIRST_PAGE_END = 3;
const SECOND_PAGE_START = 3;
const SECOND_PAGE_END = 6;
const SINGLE_ITEM_START = 0;
const SINGLE_ITEM_END = 1;

export const EXPECTED_RESULTS = {
  firstPage: MOCK_USERS_DATA.slice(FIRST_PAGE_START, FIRST_PAGE_END),
  secondPage: MOCK_USERS_DATA.slice(SECOND_PAGE_START, SECOND_PAGE_END),
  largePage: MOCK_USERS_DATA,
  singleItem: MOCK_USERS_DATA.slice(SINGLE_ITEM_START, SINGLE_ITEM_END),
};
