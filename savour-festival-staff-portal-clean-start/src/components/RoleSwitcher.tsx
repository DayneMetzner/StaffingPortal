/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StaffProfile } from '../types';
import { Shield, User, UserPlus, X, HelpCircle, Mail } from 'lucide-react';

interface RoleSwitcherProps {
  staffProfiles: StaffProfile[];
  currentProfileId: string;
  onSelectProfile: (id: string) => void;
  onRegisterStaff: (profile: Omit<StaffProfile, 'id' | 'createdAt'>) => void;
  onInviteStaffEmail?: (email: string) => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  staffProfiles,
  currentProfileId,
  onSelectProfile,
  onRegisterStaff,
  onInviteStaffEmail
}) => {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [pronouns, setPronouns] = useState('they/them');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  
  // Financial
  const [bankName, setBankName] = useState('');
  const [nameOnAccount, setNameOnAccount] = useState('');
  const [sortCode, setSortCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  // Emergency
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyNumber, setEmergencyNumber] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');

  // Medical
  const [medicalConditions, setMedicalConditions] = useState('');
  const [seriousAllergies, setSeriousAllergies] = useState('');

  const [error, setError] = useState('');

  const currentProfile = staffProfiles.find((p) => p.id === currentProfileId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !fullName.trim() || !phoneNumber.trim()) {
      setError('Email, Full Name, and Phone Number are required.');
      return;
    }

    if (staffProfiles.some((p) => p.email.toLowerCase() === email.trim().toLowerCase())) {
      setError('A staff member with this email address already exists.');
      return;
    }

    onRegisterStaff({
      fullName: fullName.trim(),
      preferredName: preferredName.trim() || fullName.split(' ')[0],
      email: email.trim().toLowerCase(),
      pronouns,
      phoneNumber: phoneNumber.trim(),
      address: address.trim(),
      financialDetails: {
        nameOnAccount: nameOnAccount.trim() || fullName.trim(),
        sortCode: sortCode.trim(),
        accountNumber: accountNumber.trim(),
        bankName: bankName.trim()
      },
      emergencyContact: {
        name: emergencyName.trim(),
        number: emergencyNumber.trim(),
        relationship: emergencyRelationship.trim()
      },
      medicalConditions: medicalConditions.trim() || 'None',
      seriousAllergies: seriousAllergies.trim() || 'None',
      codeOfConductSigned: false,
      role: 'staff'
    });

    // Reset Form
    setEmail('');
    setFullName('');
    setPreferredName('');
    setPronouns('they/them');
    setPhoneNumber('');
    setAddress('');
    setBankName('');
    setNameOnAccount('');
    setSortCode('');
    setAccountNumber('');
    setEmergencyName('');
    setEmergencyNumber('');
    setEmergencyRelationship('');
    setMedicalConditions('');
    setSeriousAllergies('');
    
    setShowRegisterModal(false);
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-200 py-2.5 px-4 sticky top-0 z-50 shadow-md flex flex-wrap items-center justify-between gap-3" id="simulator-bar">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-mono uppercase tracking-widest text-slate-400">Preview Console</span>
        <div className="h-4 w-[1px] bg-slate-800" />
        <span className="text-xs text-slate-300">
          Viewing as:{' '}
          <span className="font-semibold text-white">
            {currentProfile ? `${currentProfile.fullName} (${currentProfile.role === 'admin' ? 'Admin' : 'Staff'})` : 'Guest'}
          </span>
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-400 mr-1 font-medium">Quick Switch:</span>
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 gap-1">
          {staffProfiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => onSelectProfile(profile.id)}
              className={`px-2.5 py-1 text-xs rounded-md transition-all flex items-center gap-1 cursor-pointer font-medium ${
                currentProfileId === profile.id
                  ? 'bg-white text-slate-900 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {profile.role === 'admin' ? (
                <Shield size={12} className={currentProfileId === profile.id ? 'text-slate-900' : 'text-slate-500'} />
              ) : (
                <User size={12} className={currentProfileId === profile.id ? 'text-slate-900' : 'text-slate-500'} />
              )}
              {profile.preferredName}
            </button>
          ))}
        </div>

        {currentProfile?.role === 'admin' && (
          <>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-sm shadow-slate-800/25"
            >
              <UserPlus size={12} />
              Manually sign up staff
            </button>

            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-sm shadow-indigo-600/25"
            >
              <Mail size={12} />
              Send staff signup email
            </button>
          </>
        )}
      </div>

      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in" id="register-modal">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Festival Staff Registration</h3>
                <p className="text-xs text-slate-500">Sign up as a new team member and create your profile</p>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="p-1.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 text-slate-800">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm font-medium">
                  {error}
                </div>
              )}

              {/* Personal Details Section */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Eleanor Vance"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none bg-slate-50/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Preferred Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Alice"
                        value={preferredName}
                        onChange={(e) => setPreferredName(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none bg-slate-50/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Pronouns</label>
                      <input
                        type="text"
                        placeholder="e.g. she/her"
                        value={pronouns}
                        onChange={(e) => setPronouns(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none bg-slate-50/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +44 7700 900123"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Home Address *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Full residential address, including postcode"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none bg-slate-50/50 resize-none"
                  />
                </div>
              </div>

              {/* Financial Billing Details */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                  Financial Billing Details (for payment)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Bank Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Barclays, Monzo"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none bg-slate-50/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Name on Bank Account *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Eleanor Vance"
                      value={nameOnAccount}
                      onChange={(e) => setNameOnAccount(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none bg-slate-50/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Sort Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 20-30-40"
                      value={sortCode}
                      onChange={(e) => setSortCode(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none bg-slate-50/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Account Number *</label>
                    <input
                      type="text"
                      required
                      maxLength={8}
                      placeholder="e.g. 12345678"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                  Emergency Contact Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Contact Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mark Vance"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none bg-slate-50/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Contact Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +44 7700 900456"
                      value={emergencyNumber}
                      onChange={(e) => setEmergencyNumber(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none bg-slate-50/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Relationship *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Father, Partner"
                      value={emergencyRelationship}
                      onChange={(e) => setEmergencyRelationship(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                  Medical & Safety Information
                </h4>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                      Pre-existing medical conditions that may impact work
                      <span className="text-[10px] text-slate-400 font-normal">(Leave blank if none)</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Asthma (carries blue inhaler), Diabetes, Epilepsy, heart condition, or physical constraints..."
                      value={medicalConditions}
                      onChange={(e) => setMedicalConditions(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none bg-slate-50/50 resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                      Serious allergies requiring an EpiPen or strong prescription antihistamines
                      <span className="text-[10px] text-slate-400 font-normal">(Leave blank if none)</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Serious wasp allergy (REQUIRES EpiPen, carries in pouch), Severe peanut/tree-nut allergy..."
                      value={seriousAllergies}
                      onChange={(e) => setSeriousAllergies(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none bg-slate-50/50 resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/25"
                >
                  Register Staff Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="invite-email-modal">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden text-slate-800">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <Mail size={18} className="text-indigo-600" />
                  Send Onboarding Email
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Send setup instructions directly to a candidate</p>
              </div>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail('');
                  setInviteError('');
                }}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setInviteError('');
                const cleanEmail = inviteEmail.trim();
                if (!cleanEmail) {
                  setInviteError('Please enter a valid email address.');
                  return;
                }
                if (onInviteStaffEmail) {
                  onInviteStaffEmail(cleanEmail);
                  setInviteEmail('');
                  setShowInviteModal(false);
                } else {
                  setInviteError('Email onboarding action is not available right now.');
                }
              }}
              className="p-6 space-y-4"
            >
              {inviteError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl">
                  {inviteError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Candidate Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. candidate@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-semibold"
                />
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                This will generate a secure onboarding link. The candidate can use it to input personal, financial/payout, emergency contacts, and sign the Code of Conduct before being assigned any shifts.
              </p>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail('');
                    setInviteError('');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/10"
                >
                  <Mail size={14} />
                  Send Invitation Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
