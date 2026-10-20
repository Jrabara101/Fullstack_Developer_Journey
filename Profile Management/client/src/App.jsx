import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import confetti from 'canvas-confetti';

import { SettingsLayout, SECTIONS } from './components/layout/SettingsLayout';
import { AvatarUploadDock } from './components/profile/AvatarUploadDock';
import { PersonalIdentityForm } from './components/profile/PersonalIdentityForm';
import { ProfilePreviewCard } from './components/profile/ProfilePreviewCard';
import { PreferencesConsole } from './components/preferences/PreferencesConsole';
import { AccountSecurityCard } from './components/account/AccountSecurityCard';
import { DataSovereigntyModule } from './components/data/DataSovereigntyModule';
import { ViewAsSimulatorModal } from './components/simulator/ViewAsSimulatorModal';
import { DirtyStateActionBar } from './components/common/DirtyStateActionBar';
import { Toast } from './components/common/Toast';

import { useTheme } from './hooks/useTheme';
import { useUnsavedChanges } from './hooks/useUnsavedChanges';
import { api } from './services/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function ProfileManagementApp() {
  const [activeSection, setActiveSection] = useState('profile');
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Theme & Density
  const { theme, setTheme, density, setDensity } = useTheme('dark', 'cozy');

  // Query profile from API / cache
  const { data, isLoading, isError } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.getProfile(),
  });

  const pristineProfile = data?.profile;
  const pendingDeletion = data?.pending_deletion;

  // Local working form state
  const [formData, setFormData] = useState(null);

  // Sync pristine state into local form state upon load
  useEffect(() => {
    if (pristineProfile && !formData) {
      setFormData(JSON.parse(JSON.stringify(pristineProfile)));
    }
  }, [pristineProfile, formData]);

  // Compute dirty state
  const isDirty = useMemo(() => {
    if (!formData || !pristineProfile) return false;
    return JSON.stringify(formData) !== JSON.stringify(pristineProfile);
  }, [formData, pristineProfile]);

  const qc = useQueryClient();

  // Optimistic Profile Mutation with instant cache rollback
  const updateMutation = useMutation({
    mutationFn: (newProfile) => api.updateProfile(newProfile),
    onMutate: async (newProfile) => {
      await qc.cancelQueries({ queryKey: ['profile'] });
      const previousData = qc.getQueryData(['profile']);
      qc.setQueryData(['profile'], (old) => ({
        ...old,
        profile: { ...old?.profile, ...newProfile }
      }));
      return { previousData };
    },
    onError: (err, newProfile, context) => {
      if (context?.previousData) {
        qc.setQueryData(['profile'], context.previousData);
      }
      setToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Could not commit profile changes to backend'
      });
    },
    onSuccess: (savedProfile) => {
      setFormData(JSON.parse(JSON.stringify(savedProfile)));
      setToast({
        type: 'success',
        title: 'Changes Saved Permanently',
        message: 'Profile configuration committed with zero latency.'
      });
      // Delight micro-interaction confetti
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.9 },
          colors: ['#2563EB', '#3B82F6', '#10B981']
        });
      } catch (e) {}
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
    }
  });

  // Save handler
  const handleSave = useCallback(() => {
    if (!formData) return;
    updateMutation.mutate(formData);
  }, [formData, updateMutation]);

  // Revert handler
  const handleRevert = useCallback(() => {
    if (pristineProfile) {
      setFormData(JSON.parse(JSON.stringify(pristineProfile)));
      setToast({
        type: 'info',
        title: 'Changes Reverted',
        message: 'Restored fields to the last committed state.'
      });
    }
  }, [pristineProfile]);

  // Hook for beforeunload protection & Cmd+S hotkey
  useUnsavedChanges({
    isDirty,
    onSave: handleSave,
    onRevert: handleRevert
  });

  // Field change helper
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Privacy change helper
  const handlePrivacyChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      visibility_settings: {
        ...(prev.visibility_settings || {}),
        [field]: value
      }
    }));
  };

  // Locale preference helper
  const handleLocaleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      locale_preferences: {
        ...(prev.locale_preferences || {}),
        [key]: value
      }
    }));
  };

  // Quiet hours change helper
  const handleQuietHoursChange = (newHours) => {
    setFormData((prev) => ({
      ...prev,
      quiet_hours: newHours
    }));
  };

  // Account status change helper
  const handleAccountStatusChange = (status, deletionObj = null) => {
    setFormData((prev) => ({
      ...prev,
      account_status: status
    }));
    qc.setQueryData(['profile'], (old) => ({
      ...old,
      profile: { ...old?.profile, account_status: status },
      pending_deletion: deletionObj || null
    }));
    setToast({
      type: status === 'active' ? 'success' : 'info',
      title: 'Account Status Updated',
      message: `Account is now ${status}.`
    });
  };

  if (isLoading || !formData) {
    return (
      <div className="min-h-screen bg-canvas-light dark:bg-canvas-dark flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-mono text-slate-500">Initializing Identity Atelier...</p>
        </div>
      </div>
    );
  }

  const currentSectionMeta = SECTIONS.find(s => s.id === activeSection) || SECTIONS[0];

  return (
    <SettingsLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      profile={formData}
      theme={theme}
      onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      onOpenSimulator={() => setSimulatorOpen(true)}
    >
      {/* Page Title & Scaffolding */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight font-display text-slate-900 dark:text-slate-100">
          {currentSectionMeta.label}
        </h1>
        <p className="text-xs text-text-muted mt-1">
          {currentSectionMeta.desc}
        </p>
      </div>

      {/* Render Active Section */}
      <div className="space-y-6">
        {activeSection === 'profile' && (
          <>
            {/* Media Upload Dock */}
            <AvatarUploadDock
              avatarUrl={formData.avatar_url}
              bannerUrl={formData.banner_url}
              avatarAltText={formData.avatar_alt_text}
              displayName={formData.display_name}
              email={formData.email}
              githubHandle={formData.social_links?.github}
              onAvatarChange={(newUrl, newAlt) => {
                handleFieldChange('avatar_url', newUrl);
                if (newAlt) handleFieldChange('avatar_alt_text', newAlt);
              }}
              onBannerChange={(newBanner) => handleFieldChange('banner_url', newBanner)}
              onAvatarRemove={() => handleFieldChange('avatar_url', '')}
            />

            {/* Personal Identity Form */}
            <PersonalIdentityForm
              formData={formData}
              onChange={handleFieldChange}
              onPrivacyChange={handlePrivacyChange}
            />

            {/* Real-Time Live Profile Reflection */}
            <ProfilePreviewCard profile={formData} />
          </>
        )}

        {activeSection === 'account' && (
          <AccountSecurityCard
            email={formData.email}
            phone={formData.phone}
            visibilitySettings={formData.visibility_settings}
            onEmailChange={(val) => handleFieldChange('email', val)}
            onPhoneChange={(val) => handleFieldChange('phone', val)}
            onPrivacyChange={handlePrivacyChange}
          />
        )}

        {activeSection === 'preferences' && (
          <PreferencesConsole
            preferences={formData.locale_preferences}
            quietHours={formData.quiet_hours}
            themePreference={formData.theme_preference || theme}
            densityPreference={formData.density_preference || density}
            onChange={handleLocaleChange}
            onQuietHoursChange={handleQuietHoursChange}
            onThemeChange={(newTheme) => {
              handleFieldChange('theme_preference', newTheme);
              setTheme(newTheme);
            }}
            onDensityChange={(newDensity) => {
              handleFieldChange('density_preference', newDensity);
              setDensity(newDensity);
            }}
          />
        )}

        {activeSection === 'privacy' && (
          <div className="space-y-6">
            <PersonalIdentityForm
              formData={formData}
              onChange={handleFieldChange}
              onPrivacyChange={handlePrivacyChange}
            />
            <DataSovereigntyModule
              profile={formData}
              pendingDeletion={pendingDeletion}
              onProfileUpdate={handleFieldChange}
              onAccountStatusChange={handleAccountStatusChange}
            />
          </div>
        )}

        {activeSection === 'data' && (
          <DataSovereigntyModule
            profile={formData}
            pendingDeletion={pendingDeletion}
            onProfileUpdate={handleFieldChange}
            onAccountStatusChange={handleAccountStatusChange}
          />
        )}
      </div>

      {/* Floating Unsaved Changes Dock */}
      <DirtyStateActionBar
        isDirty={isDirty}
        isSaving={updateMutation.isPending}
        onSave={handleSave}
        onRevert={handleRevert}
      />

      {/* Live "View Profile As" Impersonation Sandbox Modal */}
      <ViewAsSimulatorModal
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        profile={formData}
      />

      {/* Floating Feedback Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </SettingsLayout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProfileManagementApp />
    </QueryClientProvider>
  );
}
