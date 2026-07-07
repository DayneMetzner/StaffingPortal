/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FestivalEvent, StaffProfile, Shift, TimeLog } from './types';

export const INITIAL_EVENTS: FestivalEvent[] = [
  {
    id: 'evt-savour-2026',
    name: 'Savour Food Festival 2026',
    location: 'Chelsea Physic Garden, London',
    startDate: '2026-07-07',
    endDate: '2026-07-12',
    locations: ['Main Stage Kitchen', 'VIP Bar Garden', 'Entrance Gate A', 'Ticket Booth']
  },
  {
    id: 'evt-beats-2026',
    name: 'Wilderness Beats Festival 2026',
    location: 'Cornbury Park, Oxfordshire',
    startDate: '2026-08-14',
    endDate: '2026-08-16',
    locations: ['The Valley Stage', 'Woods Cocktail Bar', 'Production Office', 'General Camping Security']
  }
];

export const INITIAL_STAFF: StaffProfile[] = [
  {
    id: 'staff-admin',
    fullName: 'Dayne Savour',
    preferredName: 'Dayne',
    phoneNumber: '+44 7700 900077',
    email: 'dayne@savourfestival.com',
    pronouns: 'he/him',
    address: '123 Festival Way, London, SW3 4AX',
    financialDetails: {
      nameOnAccount: 'Dayne Savour Ltd',
      sortCode: '20-40-60',
      accountNumber: '98765432',
      bankName: 'Barclays Bank'
    },
    emergencyContact: {
      name: 'Sarah Savour',
      number: '+44 7700 900088',
      relationship: 'Spouse'
    },
    medicalConditions: 'None',
    seriousAllergies: 'None',
    codeOfConductSigned: true,
    codeOfConductSignedAt: '2026-07-01T10:00:00.000Z',
    codeOfConductSignature: 'Dayne Savour',
    role: 'admin',
    createdAt: '2026-07-01T10:00:00.000Z'
  },
  {
    id: 'staff-alice',
    fullName: 'Alice Vance',
    preferredName: 'Alice',
    phoneNumber: '+44 7700 900123',
    email: 'alice@festivalstaff.com',
    pronouns: 'she/her',
    address: '45 High Street, Oxford, OX1 4DF',
    financialDetails: {
      nameOnAccount: 'Alice Vance',
      sortCode: '10-20-30',
      accountNumber: '11223344',
      bankName: 'HSBC'
    },
    emergencyContact: {
      name: 'Mark Vance',
      number: '+44 7700 900456',
      relationship: 'Father'
    },
    medicalConditions: 'Asthma (carry blue inhaler)',
    seriousAllergies: 'Peanuts (does NOT require Epipen, standard antihistamines sufficient)',
    codeOfConductSigned: true,
    codeOfConductSignedAt: '2026-07-05T09:15:00.000Z',
    codeOfConductSignature: 'Alice Vance',
    role: 'staff',
    createdAt: '2026-07-05T09:00:00.000Z'
  },
  {
    id: 'staff-bob',
    fullName: 'Robert Smith',
    preferredName: 'Bobby',
    phoneNumber: '+44 7700 900789',
    email: 'bob@festivalstaff.com',
    pronouns: 'he/him',
    address: '72 Park Avenue, Bristol, BS1 5TT',
    financialDetails: {
      nameOnAccount: 'R Smith',
      sortCode: '30-40-50',
      accountNumber: '55667788',
      bankName: 'Lloyds Bank'
    },
    emergencyContact: {
      name: 'Clara Smith',
      number: '+44 7700 900987',
      relationship: 'Mother'
    },
    medicalConditions: 'None',
    seriousAllergies: 'Bee stings (REQUIRES Epipen, always carries one in bum bag)',
    codeOfConductSigned: true,
    codeOfConductSignedAt: '2026-07-06T11:30:00.000Z',
    codeOfConductSignature: 'Bobby Smith',
    role: 'staff',
    createdAt: '2026-07-06T11:15:00.000Z'
  },
  {
    id: 'staff-charlie',
    fullName: 'Charlie Rose',
    preferredName: 'Charlie',
    phoneNumber: '+44 7700 900234',
    email: 'charlie@festivalstaff.com',
    pronouns: 'they/them',
    address: '12 Creative Lane, Brighton, BN1 1EE',
    financialDetails: {
      nameOnAccount: 'Charlie Rose',
      sortCode: '40-50-60',
      accountNumber: '99887766',
      bankName: 'Monzo Bank'
    },
    emergencyContact: {
      name: 'Alex Rose',
      number: '+44 7700 900345',
      relationship: 'Sibling'
    },
    medicalConditions: 'None',
    seriousAllergies: 'None',
    codeOfConductSigned: false, // Charlie needs to sign to be allocated to shifts
    role: 'staff',
    createdAt: '2026-07-07T08:00:00.000Z'
  }
];

export const INITIAL_SHIFTS: Shift[] = [
  // Savour Food Festival Shifts
  {
    id: 'shift-1',
    eventId: 'evt-savour-2026',
    locationName: 'Main Stage Kitchen',
    date: '2026-07-07',
    startTime: '09:00',
    endTime: '17:00',
    allocatedStaffId: 'staff-alice',
    status: 'accepted',
    unpaidBreakMinutes: 30,
    payRatePerHour: 15.00
  },
  {
    id: 'shift-2',
    eventId: 'evt-savour-2026',
    locationName: 'VIP Bar Garden',
    date: '2026-07-07',
    startTime: '16:00',
    endTime: '23:00',
    allocatedStaffId: 'staff-bob',
    status: 'pending', // Bobby can accept/deny
    unpaidBreakMinutes: 45,
    payRatePerHour: 16.50
  },
  {
    id: 'shift-3',
    eventId: 'evt-savour-2026',
    locationName: 'Entrance Gate A',
    date: '2026-07-11',
    startTime: '08:00',
    endTime: '16:00',
    allocatedStaffId: 'staff-charlie', // Charlie hasn't signed CoC yet, so this was allocated but Charlie can't accept/work it until CoC is signed
    status: 'pending',
    unpaidBreakMinutes: 60,
    payRatePerHour: 14.00
  },
  {
    id: 'shift-4',
    eventId: 'evt-savour-2026',
    locationName: 'Ticket Booth',
    date: '2026-07-11',
    startTime: '10:00',
    endTime: '18:00',
    allocatedStaffId: null, // Blank shift
    status: 'pending',
    unpaidBreakMinutes: 30,
    payRatePerHour: 13.50
  }
];

export const INITIAL_TIMELOGS: TimeLog[] = [
  {
    id: 'log-1',
    shiftId: 'shift-1',
    staffId: 'staff-alice',
    clockInTime: '2026-07-10T08:58:12.000Z',
    clockOutTime: '2026-07-10T17:02:45.000Z',
    breaks: [
      {
        start: '2026-07-10T12:30:00.000Z',
        end: '2026-07-10T13:00:00.000Z'
      }
    ],
    locationLogs: [
      {
        locationName: 'Main Stage Kitchen',
        timestamp: '2026-07-10T08:58:12.000Z'
      },
      {
        locationName: 'VIP Bar Garden', // Moved mid shift
        timestamp: '2026-07-10T14:15:00.000Z'
      }
    ]
  }
];

// LocalStorage helpers
export const loadData = <T>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    console.error('Error loading key: ' + key, e);
    return defaultValue;
  }
};

export const saveData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving key: ' + key, e);
  }
};
