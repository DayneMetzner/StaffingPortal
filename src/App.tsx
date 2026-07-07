/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  INITIAL_EVENTS, 
  INITIAL_STAFF, 
  INITIAL_SHIFTS, 
  INITIAL_TIMELOGS, 
  loadData, 
  saveData,
  ensureCleanStartDataVersion
} from './mockData';
import { FestivalEvent, StaffProfile, Shift, TimeLog, Invitation, Invoice } from './types';
import { AdminPanel } from './components/AdminPanel';
import { LoginPage } from './components/LoginPage';
import { StaffPanel } from './components/StaffPanel';
import { OnboardingWizard } from './components/OnboardingWizard';
import { Shield, User, Info, LogOut } from 'lucide-react';
import { 
  initGoogleAuth, 
  loginWithGoogle, 
  logoutFromGoogle, 
  sendGmailNotification, 
  createBackupSpreadsheet, 
  appendRowsToSpreadsheet 
} from './utils/googleAuth';
import { 
  calculateBreakMinutes, 
  calculateWorkedHours 
} from './utils/shiftHelpers';

export default function App() {
  ensureCleanStartDataVersion();

  // Load initial data from localStorage or clean live defaults
  const [events, setEvents] = useState<FestivalEvent[]>(() => 
    loadData<FestivalEvent[]>('fest_events', INITIAL_EVENTS)
  );
  
  const [shifts, setShifts] = useState<Shift[]>(() => 
    loadData<Shift[]>('fest_shifts', INITIAL_SHIFTS)
  );
  
  const [staffProfiles, setStaffProfiles] = useState<StaffProfile[]>(() => 
    loadData<StaffProfile[]>('fest_staff', INITIAL_STAFF)
  );
  
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>(() => 
    loadData<TimeLog[]>('fest_timelogs', INITIAL_TIMELOGS)
  );

  const [invitations, setInvitations] = useState<Invitation[]>(() => 
    loadData<Invitation[]>('fest_invitations', [])
  );

  const [invoices, setInvoices] = useState<Invoice[]>(() => 
    loadData<Invoice[]>('fest_invoices', [])
  );

  const [googleUser, setGoogleUser] = useState<any>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [backupSpreadsheetId, setBackupSpreadsheetId] = useState<string | null>(() => {
    return localStorage.getItem('savour_backup_spreadsheet_id') || null;
  });

  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleConnect = async () => {
    try {
      const result = await loginWithGoogle();
      if (result) {
        setGoogleUser(result.user);
        setGoogleToken(result.accessToken);
        
        // If we don't have a spreadsheet ID, automatically create one!
        if (!backupSpreadsheetId) {
          const newSheetId = await createBackupSpreadsheet(result.accessToken);
          setBackupSpreadsheetId(newSheetId);
          localStorage.setItem('savour_backup_spreadsheet_id', newSheetId);
          alert(`Successfully connected to Google Workspace!\n\nCreated new master backup spreadsheet:\n"Savour Festival - Shift Backup Database"`);
        } else {
          alert(`Successfully connected to Google Workspace!\nUsing existing backup spreadsheet.`);
        }
      }
    } catch (err: any) {
      console.error(err);
      alert('Google connection failed: ' + err.message);
    }
  };

  const handleGoogleDisconnect = async () => {
    try {
      await logoutFromGoogle();
      setGoogleUser(null);
      setGoogleToken(null);
      alert('Disconnected from Google Workspace.');
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleBackupAllShifts = async () => {
    if (!googleToken || !backupSpreadsheetId) {
      alert('Please connect Google Workspace first.');
      return;
    }
    
    // Find all completed logs
    const completedLogs = timeLogs.filter(l => l.clockOutTime);
    if (completedLogs.length === 0) {
      alert('No completed shifts found to back up.');
      return;
    }

    try {
      const rows = completedLogs.map(log => {
        const staff = staffProfiles.find(p => p.id === log.staffId);
        const shift = shifts.find(s => s.id === log.shiftId);
        const event = shift ? events.find(e => e.id === shift.eventId) : null;
        
        const workedHours = calculateWorkedHours(log.clockInTime, log.clockOutTime, log.breaks);
        const breakMinutes = calculateBreakMinutes(log.breaks);

        return [
          new Date().toISOString(),
          log.id,
          log.shiftId,
          staff?.fullName || 'N/A',
          staff?.email || 'N/A',
          event?.name || 'N/A',
          shift?.locationName || 'N/A',
          shift?.date || 'N/A',
          log.clockInTime || 'N/A',
          log.clockOutTime || 'N/A',
          workedHours,
          breakMinutes,
          log.breaks.length,
          log.feedbackApproval || 'N/A',
          log.feedbackRating || 0,
          log.feedbackImprovement || 'N/A'
        ];
      });

      await appendRowsToSpreadsheet(googleToken, backupSpreadsheetId, 'Shift Backups!A1', rows);
      alert(`Successfully backed up ${rows.length} completed shifts to Google Sheets!`);
    } catch (err: any) {
      console.error(err);
      alert('Backup failed: ' + err.message);
    }
  };

  const [latestSimulatedEmail, setLatestSimulatedEmail] = useState<{
    to: string;
    subject: string;
    body: string;
  } | null>(null);

  const [onboardingEmail, setOnboardingEmail] = useState<string | null>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('onboardEmail');
    } catch {
      return null;
    }
  });

  // Signed-in portal profile. This is intentionally simple localStorage auth for a Vercel/static build.
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(() => {
    return localStorage.getItem('savour_session_profile_id');
  });

  const currentProfile = currentProfileId
    ? staffProfiles.find((p) => p.id === currentProfileId) || null
    : null;

  const handleLogin = (email: string, accessCode: string): { ok: boolean; message?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const profile = staffProfiles.find((p) => p.email.toLowerCase() === cleanEmail);

    if (!profile) {
      return { ok: false, message: 'No staff profile exists for that email address.' };
    }

    const adminCode = import.meta.env.VITE_ADMIN_ACCESS_CODE || 'admin2026';
    const staffCode = import.meta.env.VITE_STAFF_ACCESS_CODE || 'staff2026';
    const expectedCode = profile.role === 'admin' ? adminCode : staffCode;

    if (accessCode !== expectedCode) {
      return { ok: false, message: 'Incorrect access code for this profile.' };
    }

    localStorage.setItem('savour_session_profile_id', profile.id);
    setCurrentProfileId(profile.id);
    return { ok: true };
  };

  const handleLogout = () => {
    localStorage.removeItem('savour_session_profile_id');
    setCurrentProfileId(null);
  };

  // --- STATE MUTATORS & ACTIONS ---

  // 1. Create a brand new festival event
  const handleCreateEvent = (newEventData: Omit<FestivalEvent, 'id'>) => {
    const newEvent: FestivalEvent = {
      ...newEventData,
      id: `evt-${Date.now()}`
    };
    const updated = [...events, newEvent];
    setEvents(updated);
    saveData('fest_events', updated);
  };

  // 2. Create a blank shift for an event
  const handleCreateShift = (newShiftData: Omit<Shift, 'id'>, count: number = 1) => {
    setShifts((prevShifts) => {
      const newShifts: Shift[] = [];
      const now = Date.now();
      for (let i = 0; i < count; i++) {
        newShifts.push({
          ...newShiftData,
          id: `shift-${now}-${i}-${Math.random().toString(36).substr(2, 5)}`
        });
      }
      const updated = [...prevShifts, ...newShifts];
      saveData('fest_shifts', updated);
      return updated;
    });
  };

  // 3. Allocate/reallocate staff to a shift
  const handleAllocateStaff = (shiftId: string, staffId: string | null) => {
    const updated = shifts.map((s) => {
      if (s.id === shiftId) {
        return {
          ...s,
          allocatedStaffId: staffId,
          // Reset status to pending when a new staff member is allocated
          status: staffId ? 'pending' : 'pending' as const
        };
      }
      return s;
    });
    setShifts(updated);
    saveData('fest_shifts', updated);
  };

  // 4. Update staff profile details (and save/sync)
  const handleUpdateProfile = (updatedProfile: StaffProfile) => {
    const updated = staffProfiles.map((p) => 
      p.id === updatedProfile.id ? updatedProfile : p
    );
    setStaffProfiles(updated);
    saveData('fest_staff', updated);
  };

  // 5. Staff register/signup
  const handleRegisterStaff = (newStaffData: Omit<StaffProfile, 'id' | 'createdAt'>) => {
    const newId = `staff-${Date.now()}`;
    const newStaff: StaffProfile = {
      ...newStaffData,
      id: newId,
      createdAt: new Date().toISOString()
    };
    const updated = [...staffProfiles, newStaff];
    setStaffProfiles(updated);
    saveData('fest_staff', updated);
    
    localStorage.setItem('savour_session_profile_id', newId);
    setCurrentProfileId(newId);
  };

  // 6. Staff responds to shift allocation (accept / deny)
  const handleRespondToShift = (shiftId: string, responseStatus: 'accepted' | 'denied') => {
    if (!currentProfileId) return;
    const updated = shifts.map((s) => {
      if (s.id === shiftId && s.allocatedStaffId === currentProfileId) {
        return {
          ...s,
          status: responseStatus
        };
      }
      return s;
    });
    setShifts(updated);
    saveData('fest_shifts', updated);
  };

  // 7. Timeclock: Clock-In
  const handleClockIn = (shiftId: string, initialLocationName: string) => {
    if (!currentProfileId) return;
    const newLog: TimeLog = {
      id: `log-${Date.now()}`,
      shiftId,
      staffId: currentProfileId,
      clockInTime: new Date().toISOString(),
      clockOutTime: null,
      breaks: [],
      locationLogs: [
        {
          locationName: initialLocationName,
          timestamp: new Date().toISOString()
        }
      ]
    };
    const updated = [...timeLogs, newLog];
    setTimeLogs(updated);
    saveData('fest_timelogs', updated);
  };

  // 8. Timeclock: Start Unpaid Break
  const handleStartBreak = (shiftId: string) => {
    if (!currentProfileId) return;
    const updated = timeLogs.map((log) => {
      if (log.shiftId === shiftId && log.staffId === currentProfileId && !log.clockOutTime) {
        return {
          ...log,
          breaks: [
            ...log.breaks,
            {
              start: new Date().toISOString(),
              end: null
            }
          ]
        };
      }
      return log;
    });
    setTimeLogs(updated);
    saveData('fest_timelogs', updated);
  };

  // 9. Timeclock: End Unpaid Break
  const handleEndBreak = (shiftId: string) => {
    if (!currentProfileId) return;
    const updated = timeLogs.map((log) => {
      if (log.shiftId === shiftId && log.staffId === currentProfileId && !log.clockOutTime) {
        return {
          ...log,
          breaks: log.breaks.map((b) => {
            if (!b.end) {
              return { ...b, end: new Date().toISOString() };
            }
            return b;
          })
        };
      }
      return log;
    });
    setTimeLogs(updated);
    saveData('fest_timelogs', updated);
  };

  // 10. Timeclock: Clock-Out
  const handleClockOut = (
    shiftId: string,
    feedback?: { approval: string; rating: number; improvement: string }
  ) => {
    if (!currentProfileId) return;
    const targetLog = timeLogs.find(
      (log) => log.shiftId === shiftId && log.staffId === currentProfileId && !log.clockOutTime
    );
    if (!targetLog) return;

    const closedBreaks = targetLog.breaks.map((b) => {
      if (!b.end) {
        return { ...b, end: new Date().toISOString() };
      }
      return b;
    });

    const clockOutTime = new Date().toISOString();
    const completedLog: TimeLog = {
      ...targetLog,
      breaks: closedBreaks,
      clockOutTime,
      feedbackApproval: feedback?.approval,
      feedbackRating: feedback?.rating,
      feedbackImprovement: feedback?.improvement
    };

    const updated = timeLogs.map((log) => log.id === targetLog.id ? completedLog : log);
    setTimeLogs(updated);
    saveData('fest_timelogs', updated);

    // Get shift, staff, and event details for notification & sheets backup
    const staff = staffProfiles.find((p) => p.id === currentProfileId);
    const shift = shifts.find((s) => s.id === shiftId);
    const event = shift ? events.find((e) => e.id === shift.eventId) : null;

    if (staff && shift && event) {
      const workedHours = calculateWorkedHours(completedLog.clockInTime, completedLog.clockOutTime, completedLog.breaks);
      const breakMinutes = calculateBreakMinutes(completedLog.breaks);
      
      const staffName = staff.fullName || 'Staff';
      const eventName = event.name || 'Festival Event';
      const locationName = shift.locationName || 'Main Venue';
      const dateStr = shift.date || new Date().toISOString().split('T')[0];
      const clockInStr = completedLog.clockInTime 
        ? new Date(completedLog.clockInTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
        : 'N/A';
      const clockOutStr = completedLog.clockOutTime 
        ? new Date(completedLog.clockOutTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
        : 'N/A';

      // Build Breaks List HTML
      let breaksHtml = '<ul style="margin: 0; padding-left: 20px;">';
      if (completedLog.breaks.length === 0) {
        breaksHtml += '<li>No unpaid breaks were taken.</li>';
      } else {
        completedLog.breaks.forEach((b, index) => {
          const bStart = new Date(b.start).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
          const bEnd = b.end ? new Date(b.end).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
          const bDuration = b.end ? `${Math.round((new Date(b.end).getTime() - new Date(b.start).getTime()) / 60000)}m` : 'N/A';
          breaksHtml += `<li style="margin-bottom: 4px;"><strong>Break #${index + 1}:</strong> ${bStart} - ${bEnd} (${bDuration})</li>`;
        });
      }
      breaksHtml += '</ul>';

      // Build Feedback HTML
      let feedbackHtml = '';
      if (feedback) {
        feedbackHtml = `
          <h4 style="margin: 16px 0 8px 0; font-size: 13px; color: #2d3748; text-transform: uppercase; letter-spacing: 0.5px;">Your Submitted Feedback</h4>
          <div style="font-size: 13px; color: #4a5568; background-color: #f7fafc; padding: 12px; border-radius: 6px; border: 1px solid #edf2f7; margin-bottom: 24px; line-height: 1.5;">
            <div><strong>Start/Finish/Break Approvals:</strong> ${feedback.approval}</div>
            <div style="margin-top: 6px;"><strong>Shift Rating:</strong> ${'★'.repeat(feedback.rating)}${'☆'.repeat(5 - feedback.rating)} (${feedback.rating}/5 stars)</div>
            ${feedback.improvement ? `<div style="margin-top: 6px;"><strong>Suggestions:</strong> ${feedback.improvement}</div>` : ''}
          </div>
        `;
      }

      const emailSubject = `🎪 Shift Completion Confirmation: ${eventName} - ${dateStr}`;
      
      const plainTextBody = `Hi ${staffName},\n\nYou have successfully completed and submitted your shift for ${eventName} on ${dateStr}.\n\n--- SHIFT DETAILS ---\nLocation: ${locationName}\nClock-In: ${clockInStr}\nClock-Out: ${clockOutStr}\nTotal Breaks: ${breakMinutes} minutes\nTotal Worked Hours: ${workedHours} hours\n\n${feedback ? `--- FEEDBACK ---\nApproval Notes: ${feedback.approval}\nRating: ${feedback.rating}/5\nSuggestions: ${feedback.improvement || 'None'}\n` : ''}\nThank you for your hard work!\nBest regards,\nSavour Festival Operations Team`;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <div style="background-color: #4f46e5; padding: 24px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 22px; font-weight: bold; letter-spacing: -0.5px;">🎪 Savour Food Festival</h2>
            <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Shift Completion Confirmation</p>
          </div>
          <div style="padding: 24px; background-color: #ffffff;">
            <p style="font-size: 15px; line-height: 1.5; margin-top: 0;">Hi <strong>${staffName}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.5; color: #4a5568;">Great job! You have successfully clocked out and completed your shift for <strong>${eventName}</strong>. Below is a detailed confirmation of your timesheet for your records.</p>
            
            <div style="margin: 24px 0; background-color: #f7fafc; border-left: 4px solid #4f46e5; padding: 16px; border-radius: 0 8px 8px 0;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="padding: 6px 0; color: #718096; font-weight: bold; width: 40%;">Location/Zone:</td>
                  <td style="padding: 6px 0; color: #1a202c; font-weight: bold;">${locationName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #718096; font-weight: bold;">Date:</td>
                  <td style="padding: 6px 0; color: #1a202c;">${dateStr}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #718096; font-weight: bold;">Clock-In Time:</td>
                  <td style="padding: 6px 0; color: #1a202c;">${clockInStr}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #718096; font-weight: bold;">Clock-Out Time:</td>
                  <td style="padding: 6px 0; color: #1a202c;">${clockOutStr}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #718096; font-weight: bold;">Total Break Time:</td>
                  <td style="padding: 6px 0; color: #1a202c;">${breakMinutes} minutes</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #718096; font-weight: bold; font-size: 14px;">Total Worked Hours:</td>
                  <td style="padding: 6px 0; color: #4f46e5; font-weight: bold; font-size: 14px;">${workedHours} hours</td>
                </tr>
              </table>
            </div>

            <h4 style="margin: 16px 0 8px 0; font-size: 13px; color: #2d3748; text-transform: uppercase; letter-spacing: 0.5px;">Breaks Breakdown</h4>
            <div style="font-size: 13px; color: #4a5568; background-color: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #edf2f7; margin-bottom: 24px;">
              ${breaksHtml}
            </div>

            ${feedbackHtml}

            <p style="font-size: 13px; color: #718096; margin-bottom: 0; line-height: 1.5;">This email serves as an official confirmation of your shift. It has been automatically backed up and logged for coordinator approval and invoice validation. You can generate and submit your invoice for this shift under the <strong>Invoices & Expenses</strong> tab in the portal.</p>
          </div>
          <div style="background-color: #f7fafc; padding: 16px; text-align: center; border-top: 1px solid #edf2f7; font-size: 11px; color: #a0aec0;">
            &copy; 2026 Savour Food Festival HQ. All rights reserved.
          </div>
        </div>
      `;

      // Trigger simulation popup
      setLatestSimulatedEmail({
        to: staff.email || 'staff@savourfestival.com',
        subject: emailSubject,
        body: plainTextBody
      });

      // If Google token exists, send real email via Gmail API
      if (googleToken && staff.email) {
        sendGmailNotification(googleToken, staff.email, emailSubject, htmlContent)
          .then(() => console.log('Successfully sent actual Gmail confirmation to', staff.email))
          .catch((err) => console.error('Gmail send failed:', err));
      }

      // If Google token exists and we have a spreadsheet, backup to Google Sheets
      if (googleToken && backupSpreadsheetId) {
        const row = [
          [
            new Date().toISOString(),
            completedLog.id,
            completedLog.shiftId,
            staffName,
            staff.email || 'N/A',
            eventName,
            locationName,
            dateStr,
            completedLog.clockInTime || 'N/A',
            completedLog.clockOutTime || 'N/A',
            workedHours,
            breakMinutes,
            completedLog.breaks.length,
            completedLog.feedbackApproval || 'N/A',
            completedLog.feedbackRating || 0,
            completedLog.feedbackImprovement || 'N/A'
          ]
        ];
        appendRowsToSpreadsheet(googleToken, backupSpreadsheetId, 'Shift Backups!A1', row)
          .then(() => console.log('Successfully backed up shift to Google Sheets!'))
          .catch((err) => console.error('Google Sheets backup failed:', err));
      }
    }
  };

  // 11. Timeclock: Log Mid-Shift Location Transfer
  const handleMoveLocation = (shiftId: string, newLocation: string) => {
    if (!currentProfileId) return;
    const updated = timeLogs.map((log) => {
      if (log.shiftId === shiftId && log.staffId === currentProfileId && !log.clockOutTime) {
        return {
          ...log,
          locationLogs: [
            ...log.locationLogs,
            {
              locationName: newLocation,
              timestamp: new Date().toISOString()
            }
          ]
        };
      }
      return log;
    });
    setTimeLogs(updated);
    saveData('fest_timelogs', updated);
  };

  // 12. Admin edits or manually creates timesheets
  const handleUpdateTimeLog = (updatedLog: TimeLog) => {
    setTimeLogs((prevLogs) => {
      const exists = prevLogs.some((log) => log.id === updatedLog.id);
      const updated = exists
        ? prevLogs.map((log) => (log.id === updatedLog.id ? updatedLog : log))
        : [...prevLogs, updatedLog];
      saveData('fest_timelogs', updated);
      return updated;
    });
  };

  // 13. Delete a staff profile and all associated allocations
  const handleDeleteStaff = (staffId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this staff member? This will clear all their shift allocations and time records.')) {
      const updatedProfiles = staffProfiles.filter((p) => p.id !== staffId);
      setStaffProfiles(updatedProfiles);
      saveData('fest_staff', updatedProfiles);

      const updatedShifts = shifts.map((s) => {
        if (s.allocatedStaffId === staffId) {
          return { ...s, allocatedStaffId: null, status: 'pending' as const };
        }
        return s;
      });
      setShifts(updatedShifts);
      saveData('fest_shifts', updatedShifts);

      const updatedLogs = timeLogs.filter((log) => log.staffId !== staffId);
      setTimeLogs(updatedLogs);
      saveData('fest_timelogs', updatedLogs);

      if (currentProfileId === staffId) {
        const admin = updatedProfiles.find(p => p.role === 'admin');
        setCurrentProfileId(admin ? admin.id : updatedProfiles[0]?.id || '');
      }
    }
  };

  // 14. Update staff role (promote/demote admin rights)
  const handleUpdateStaffRole = (staffId: string, role: 'staff' | 'admin') => {
    const updated = staffProfiles.map((p) => {
      if (p.id === staffId) {
        return { ...p, role };
      }
      return p;
    });
    setStaffProfiles(updated);
    saveData('fest_staff', updated);
  };

  // 15. Invite staff member by email
  const handleInviteStaff = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    if (staffProfiles.some((p) => p.email.toLowerCase() === cleanEmail)) {
      alert(`Staff member with email "${cleanEmail}" is already registered.`);
      return;
    }

    if (invitations.some((i) => i.email.toLowerCase() === cleanEmail)) {
      alert(`An invitation has already been created for "${cleanEmail}".`);
      return;
    }

    const newInv: Invitation = {
      email: cleanEmail,
      invitedAt: new Date().toISOString(),
      status: 'invited'
    };

    const updated = [...invitations, newInv];
    setInvitations(updated);
    saveData('fest_invitations', updated);

    const currentURL = window.location.origin + window.location.pathname;
    const onboardingLink = `${currentURL}?onboardEmail=${encodeURIComponent(cleanEmail)}`;
    const inviteSubject = '🎪 Join Savour Food Festival Staff Team - Onboarding Link';
    const inviteHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #1f2937; line-height: 1.5;">
        <h2>🎪 Join Savour Food Festival Staff Team</h2>
        <p>Hi there,</p>
        <p>You have been invited to register as a staff member on the Savour Food Festival Portal.</p>
        <p>Please click the button below to complete your onboarding, add your billing details, emergency contact details and sign the Code of Conduct.</p>
        <p><a href="${onboardingLink}" style="display:inline-block;background:#4f46e5;color:white;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold;">Complete Onboarding</a></p>
        <p>If the button does not work, copy and paste this link into your browser:<br />${onboardingLink}</p>
        <p>Best regards,<br />Savour Festival Operations Team</p>
      </div>
    `;

    if (googleToken) {
      try {
        await sendGmailNotification(googleToken, cleanEmail, inviteSubject, inviteHtml);
        alert(`Invitation email sent to ${cleanEmail}`);
      } catch (err: any) {
        console.error('Invite email failed:', err);
        alert(`Invitation saved, but Gmail sending failed. Copy this onboarding link manually:\n\n${onboardingLink}\n\nError: ${err.message}`);
      }
    } else {
      alert(`Invitation saved. Google Workspace is not connected, so no email was sent. Copy this onboarding link manually:\n\n${onboardingLink}`);
    }
  };

  // 16. Onboarding Completion
  const handleOnboardComplete = (profileData: StaffProfile) => {
    const updatedProfiles = [...staffProfiles, profileData];
    setStaffProfiles(updatedProfiles);
    saveData('fest_staff', updatedProfiles);

    const updatedInvs = invitations.map((i) => {
      if (i.email.toLowerCase() === profileData.email.toLowerCase()) {
        return { ...i, status: 'registered' as const };
      }
      return i;
    });
    setInvitations(updatedInvs);
    saveData('fest_invitations', updatedInvs);

    // Clear query param & onboarding state
    setOnboardingEmail(null);
    try {
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (e) {
      console.warn("Could not clear query parameter in iframe", e);
    }

    localStorage.setItem('savour_session_profile_id', profileData.id);
    setCurrentProfileId(profileData.id);
  };

  // Invoices Mutators
  const handleSubmitInvoice = (invoice: Invoice) => {
    const updated = [...invoices.filter(i => i.id !== invoice.id), invoice];
    setInvoices(updated);
    saveData('fest_invoices', updated);
  };

  const handleApproveInvoice = (invoiceId: string, adminId: string, adminName: string) => {
    const updated = invoices.map(inv => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          status: 'approved' as const,
          approvedByAdminId: adminId,
          approvedByAdminName: adminName,
          approvedAt: new Date().toISOString()
        };
      }
      return inv;
    });
    setInvoices(updated);
    saveData('fest_invoices', updated);
  };

  const handleMarkInvoiceAsPaid = (invoiceId: string) => {
    const updated = invoices.map(inv => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          status: 'paid' as const,
          paidAt: new Date().toISOString()
        };
      }
      return inv;
    });
    setInvoices(updated);
    saveData('fest_invoices', updated);
  };

  const handleRejectInvoice = (invoiceId: string, reason: string) => {
    const invoiceToReject = invoices.find(i => i.id === invoiceId);
    if (!invoiceToReject) return;

    // Send simulated email
    setLatestSimulatedEmail({
      to: invoiceToReject.contactDetails.email,
      subject: `❌ Invoice NOT Approved: ${invoiceToReject.eventName}`,
      body: `Hi ${invoiceToReject.contactDetails.fullName || 'Staff'},\n\nYour invoice for the event "${invoiceToReject.eventName}" has been reviewed and was NOT approved for the following reason:\n\n"${reason}"\n\nPlease log in to the portal, update your invoice details, and resubmit.\n\nBest regards,\nFestival Coordinator HQ`
    });

    // Remove from invoices list
    const updated = invoices.filter(inv => inv.id !== invoiceId);
    setInvoices(updated);
    saveData('fest_invoices', updated);
  };

  // Reset demo utility
  const handleResetDemoData = () => {
    if (window.confirm('Are you sure you want to reset all data back to the default seed values?')) {
      localStorage.removeItem('fest_events');
      localStorage.removeItem('fest_shifts');
      localStorage.removeItem('fest_staff');
      localStorage.removeItem('fest_timelogs');
      localStorage.removeItem('fest_invoices');
      setEvents(INITIAL_EVENTS);
      setShifts(INITIAL_SHIFTS);
      setStaffProfiles(INITIAL_STAFF);
      setTimeLogs(INITIAL_TIMELOGS);
      setInvoices([]);
      const admin = INITIAL_STAFF.find(p => p.role === 'admin');
      setCurrentProfileId(admin ? admin.id : INITIAL_STAFF[0]?.id || '');
    }
  };

  if (onboardingEmail) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-between font-sans text-slate-100 p-4 md:p-8" id="onboarding-portal">
        <div className="max-w-3xl w-full mx-auto space-y-8 my-auto py-8">
          {/* Logo / Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex h-16 w-16 bg-slate-800 text-white rounded-3xl items-center justify-center font-extrabold text-3xl shadow-xl border border-slate-700">
              🎪
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Savour Festival Staff Onboarding
            </h1>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              Welcome! Please complete your official staff profile details, payment banking details, emergency contacts, and sign the Code of Conduct to activate your account.
            </p>
          </div>

          <OnboardingWizard 
            email={onboardingEmail} 
            onComplete={handleOnboardComplete} 
            onCancel={() => {
              setOnboardingEmail(null);
              try {
                window.history.replaceState({}, document.title, window.location.pathname);
              } catch {}
            }} 
          />
        </div>

        <footer className="py-4 text-center text-xs text-slate-500 font-medium">
          <p>© 2026 Savour Food Festival. Securely hosted onboarding gateway.</p>
        </footer>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <LoginPage
        staffProfiles={staffProfiles}
        onLogin={handleLogin}
        onStartOnboarding={() => {
          const email = window.prompt('Enter the email address your onboarding link was sent to:');
          if (email) {
            setOnboardingEmail(email.trim().toLowerCase());
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" id="app-root">
      
      {/* Main Brand Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-extrabold text-lg shadow-sm shadow-slate-900/15">
            🎪
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-lg font-extrabold text-slate-950 tracking-tight flex items-center gap-1.5 justify-center sm:justify-start">
              Savour Staff Portal
              <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-bold rounded-md uppercase tracking-wider">
                Platform
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">Onboarding & shift-coordination engine</p>
          </div>
        </div>

        {/* Status indicator / Switch panel */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Operational Mode:</span>
            {currentProfile?.role === 'admin' ? (
              <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold rounded flex items-center gap-1">
                <Shield size={10} /> Coordinator HQ
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded flex items-center gap-1">
                <User size={10} /> Staff Dashboard
              </span>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg text-[10px] font-bold text-white transition-colors cursor-pointer flex items-center gap-1"
          >
            <LogOut size={12} /> Sign out
          </button>
        </div>
      </header>

      {/* Primary Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Router View based on selected role */}
        {currentProfile?.role === 'admin' ? (
          <AdminPanel
            events={events}
            shifts={shifts}
            staffProfiles={staffProfiles}
            timeLogs={timeLogs}
            invitations={invitations}
            invoices={invoices}
            onCreateEvent={handleCreateEvent}
            onCreateShift={handleCreateShift}
            onAllocateStaff={handleAllocateStaff}
            onUpdateTimeLog={handleUpdateTimeLog}
            onDeleteStaff={handleDeleteStaff}
            onUpdateStaffRole={handleUpdateStaffRole}
            onInviteStaffEmail={handleInviteStaff}
            onApproveInvoice={handleApproveInvoice}
            onMarkInvoiceAsPaid={handleMarkInvoiceAsPaid}
            onRejectInvoice={handleRejectInvoice}
            currentAdminProfile={currentProfile}
            googleUser={googleUser}
            googleToken={googleToken}
            backupSpreadsheetId={backupSpreadsheetId}
            onGoogleConnect={handleGoogleConnect}
            onGoogleDisconnect={handleGoogleDisconnect}
            onBackupAllShifts={handleBackupAllShifts}
          />
        ) : currentProfile ? (
          <StaffPanel
            profile={currentProfile}
            events={events}
            shifts={shifts}
            timeLogs={timeLogs}
            invoices={invoices}
            onUpdateProfile={handleUpdateProfile}
            onRespondToShift={handleRespondToShift}
            onClockIn={handleClockIn}
            onClockOut={handleClockOut}
            onStartBreak={handleStartBreak}
            onEndBreak={handleEndBreak}
            onMoveLocation={handleMoveLocation}
            onSubmitInvoice={handleSubmitInvoice}
          />
        ) : (
          <div className="text-center py-20 bg-white border border-slate-100 rounded-2xl space-y-3">
            <Info className="mx-auto text-slate-300 animate-bounce" size={40} />
            <h3 className="font-bold text-slate-900 text-lg">No Active Profile Selected</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Please sign out and sign in with a valid staff profile.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-4 px-6 mt-12 text-center text-xs text-slate-400 font-medium">
        <p>© 2026 Savour Food Festival. All staff activities logged on UTC timezone. Securely audited platform.</p>
      </footer>

    </div>
  );
}