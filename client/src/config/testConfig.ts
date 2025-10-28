import { TestType } from '../types/test.types';

export interface TestConfig {
  id: string;
  type: TestType;
  name: string;
  description: string;
  order: number;
  category: 'critical' | 'important' | 'optional';
  estimatedTime: string;
}

export const TESTS: TestConfig[] = [
  {
    id: '1',
    type: TestType.DOMAIN_ACCESS,
    name: 'Domain Access Test',
    description: 'Verifies that your device can access the required domain and network resources for the platform',
    order: 1,
    category: 'critical',
    estimatedTime: '5s'
  },
  {
    id: '2',
    type: TestType.EMAIL_DELIVERY,
    name: 'Email Delivery Test',
    description: 'Tests if emails can be sent and received to verify email system functionality',
    order: 2,
    category: 'critical',
    estimatedTime: '10s'
  },
  {
    id: '3',
    type: TestType.EMAIL_2FA,
    name: 'Email 2FA Timing Test',
    description: 'Measures email delivery time for two-factor authentication codes to ensure timely delivery',
    order: 3,
    category: 'important',
    estimatedTime: '10s'
  },
  {
    id: '4',
    type: TestType.FILE_DOWNLOAD,
    name: 'File Download Test',
    description: 'Tests your ability to download files from the platform and checks for download restrictions',
    order: 4,
    category: 'critical',
    estimatedTime: '15s'
  },
  {
    id: '5',
    type: TestType.FILE_UPLOAD,
    name: 'File Upload Test',
    description: 'Tests your ability to upload files to the platform and validates file handling',
    order: 5,
    category: 'critical',
    estimatedTime: '15s'
  },
  {
    id: '6',
    type: TestType.INTERCOM,
    name: 'Intercom Widget Test',
    description: 'Verifies that the Intercom support widget loads and functions correctly without blockers',
    order: 6,
    category: 'important',
    estimatedTime: '5s'
  },
  {
    id: '7',
    type: TestType.SCREEN_RESOLUTION,
    name: 'Screen Resolution Test',
    description: 'Checks if your screen resolution meets the minimum requirements for optimal display',
    order: 7,
    category: 'important',
    estimatedTime: '2s'
  },
  {
    id: '8',
    type: TestType.CONNECTION_SPEED,
    name: 'Connection Speed Test',
    description: 'Measures your internet connection speed for optimal platform performance',
    order: 8,
    category: 'critical',
    estimatedTime: '20s'
  }
];

export const getTestById = (id: string): TestConfig | undefined => {
  return TESTS.find(test => test.id === id);
};

export const getTestByType = (type: TestType): TestConfig | undefined => {
  return TESTS.find(test => test.type === type);
};

export const getTestsByCategory = (category: 'critical' | 'important' | 'optional'): TestConfig[] => {
  return TESTS.filter(test => test.category === category);
};

export const getCriticalTests = (): TestConfig[] => {
  return getTestsByCategory('critical');
};
