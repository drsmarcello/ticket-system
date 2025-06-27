'use client';
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdatePassword, useUpdateEmail } from '@/hooks/useUsers';
import toast from 'react-hot-toast';
import { UserIcon, KeyIcon, AtSymbolIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const { user } = useAuth();
  const updatePasswordMutation = useUpdatePassword();
  const updateEmailMutation = useUpdateEmail();
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [emailData, setEmailData] = useState({
    newEmail: '',
    password: ''
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Neue Passwörter stimmen nicht überein');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Neues Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }

    if (!user?.id) {
      toast.error('Benutzer-ID nicht gefunden');
      return;
    }

    try {
      await updatePasswordMutation.mutateAsync({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success('Passwort erfolgreich geändert!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error('Fehler beim Ändern des Passworts: ' + (error.message || 'Unbekannter Fehler'));
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailData.newEmail || !emailData.password) {
      toast.error('Bitte füllen Sie alle Felder aus');
      return;
    }

    if (emailData.newEmail === user?.email) {
      toast.error('Die neue E-Mail ist identisch mit der aktuellen');
      return;
    }

    if (!user?.id) {
      toast.error('Benutzer-ID nicht gefunden');
      return;
    }

    try {
      await updateEmailMutation.mutateAsync({
        email: emailData.newEmail,
        password: emailData.password
      });
      
      toast.success('E-Mail erfolgreich geändert! Bitte loggen Sie sich erneut ein.');
      setEmailData({ newEmail: '', password: '' });
    } catch (error: any) {
      toast.error('Fehler beim Ändern der E-Mail: ' + (error.message || 'Unbekannter Fehler'));
    }
  };

  const isChangingPassword = updatePasswordMutation.isPending;
  const isChangingEmail = updateEmailMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>
        <p className="mt-1 text-sm text-gray-600">
          Verwalten Sie Ihre Konto-Einstellungen und Sicherheit
        </p>
      </div>

      <div className="space-y-6">
        {/* Benutzer-Info */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-gray-600 flex items-center justify-center">
                  <span className="text-lg font-medium text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{user?.name}</h3>
                <p className="text-sm text-gray-600">{user?.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Rolle: {user?.role === 'ADMIN' ? 'Administrator' : 
                          user?.role === 'EMPLOYEE' ? 'Mitarbeiter' : 'Kunde'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Passwort ändern */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              <KeyIcon className="h-5 w-5 inline mr-2" />
              Passwort ändern
            </h3>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="form-label">
                  Aktuelles Passwort
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    id="currentPassword"
                    className="form-input pr-10"
                    placeholder="Ihr aktuelles Passwort"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({
                      ...prev,
                      currentPassword: e.target.value
                    }))}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="form-label">
                  Neues Passwort
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    className="form-input pr-10"
                    placeholder="Mindestens 8 Zeichen"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({
                      ...prev,
                      newPassword: e.target.value
                    }))}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="form-label">
                  Neues Passwort bestätigen
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    className="form-input pr-10"
                    placeholder="Neues Passwort wiederholen"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({
                      ...prev,
                      confirmPassword: e.target.value
                    }))}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="btn-primary"
                >
                  {isChangingPassword ? 'Wird geändert...' : 'Passwort ändern'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* E-Mail ändern */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              <AtSymbolIcon className="h-5 w-5 inline mr-2" />
              E-Mail-Adresse ändern
            </h3>
            
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Hinweis:</strong> Nach der Änderung der E-Mail-Adresse müssen Sie sich 
                erneut anmelden. Stellen Sie sicher, dass Sie Zugriff auf die neue E-Mail-Adresse haben.
              </p>
            </div>

            <form onSubmit={handleEmailChange} className="space-y-4">
              <div>
                <label htmlFor="currentEmail" className="form-label">
                  Aktuelle E-Mail
                </label>
                <input
                  type="email"
                  id="currentEmail"
                  className="form-input bg-gray-50"
                  value={user?.email || ''}
                  disabled
                />
              </div>

              <div>
                <label htmlFor="newEmail" className="form-label">
                  Neue E-Mail-Adresse
                </label>
                <input
                  type="email"
                  id="newEmail"
                  className="form-input"
                  placeholder="neue@email.com"
                  value={emailData.newEmail}
                  onChange={(e) => setEmailData(prev => ({
                    ...prev,
                    newEmail: e.target.value
                  }))}
                  required
                />
              </div>

              <div>
                <label htmlFor="passwordConfirm" className="form-label">
                  Passwort zur Bestätigung
                </label>
                <input
                  type="password"
                  id="passwordConfirm"
                  className="form-input"
                  placeholder="Ihr aktuelles Passwort"
                  value={emailData.password}
                  onChange={(e) => setEmailData(prev => ({
                    ...prev,
                    password: e.target.value
                  }))}
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isChangingEmail}
                  className="btn-primary"
                >
                  {isChangingEmail ? 'Wird geändert...' : 'E-Mail ändern'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              <UserIcon className="h-5 w-5 inline mr-2" />
              Konto-Informationen
            </h3>
            
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Benutzer-ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{user?.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Rolle</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user?.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                    user?.role === 'EMPLOYEE' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user?.role === 'ADMIN' ? 'Administrator' : 
                     user?.role === 'EMPLOYEE' ? 'Mitarbeiter' : 'Kunde'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Aktiv
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}