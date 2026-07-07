/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FestivalEvent, StaffProfile, Shift, TimeLog } from './types';

/**
 * Clean live-start data.
 *
 * The app still needs one bootstrap coordinator account so an admin can log in,
 * create the first real event, invite staff, and build the rota. All events,
 * staff test accounts, shifts, timelogs, invitations, and invoices start empty.
 */
export const INITIAL_EVENTS: FestivalEvent[] = [];

export const INITIAL_STAFF: StaffProfile[] = [
  {
    id: 'staff-admin-dayne',
    fullName: 'Dayne Metzner',
    preferredName: 'Dayne',
    phoneNumber: '',
    email: 'dayne@savourfestival.com',
    pronouns: '',
    address: '',
    financialDetails: {
      nameOnAccount: '',
      sortCode: '',
      accountNumber: '',
      bankName: ''
    },
    emergencyContact: {
      name: '',
      number: '',
      relationship: ''
    },
    medicalConditions: '',
    seriousAllergies: '',
    codeOfConductSigned: true,
    codeOfConductSignedAt: new Date().toISOString(),
    codeOfConductSignature: 'Dayne Metzner',
    role: 'admin',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_SHIFTS: Shift[] = [];

export const INITIAL_TIMELOGS: TimeLog[] = [];

const APP_DATA_VERSION = 'clean-start-v1';
const APP_DATA_VERSION_KEY = 'savour_app_data_version';
const APP_DATA_KEYS = [
  'fest_events',
  'fest_shifts',
  'fest_staff',
  'fest_timelogs',
  'fest_invitations',
  'fest_invoices',
  'savour_session_profile_id',
  'savour_current_user_id',
  'savour_backup_spreadsheet_id'
];

export const ensureCleanStartDataVersion = (): void => {
  try {
    const currentVersion = localStorage.getItem(APP_DATA_VERSION_KEY);
    if (currentVersion !== APP_DATA_VERSION) {
      APP_DATA_KEYS.forEach((key) => localStorage.removeItem(key));
      localStorage.setItem(APP_DATA_VERSION_KEY, APP_DATA_VERSION);
    }
  } catch (e) {
    console.error('Error checking app data version', e);
  }
};

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
