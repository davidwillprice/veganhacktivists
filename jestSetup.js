jest.mock('./src/lib/cms/index', () => ({}));
jest.mock('next/router', () => ({
  useRouter: () => ({}),
}));
