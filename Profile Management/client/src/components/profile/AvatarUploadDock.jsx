import { Camera, Upload, Sparkles, Trash2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { GithubIcon } from '../common/BrandIcons';
import { ImageCropModal } from './ImageCropModal';
import { GenerativeAvatarModal } from './GenerativeAvatarModal';
import { SocialSyncModal } from './SocialSyncModal';
import { generateGradientAvatar } from '../../services/avatarGenerator';

export function AvatarUploadDock({
  avatarUrl,
  bannerUrl,
  avatarAltText,
  displayName,
  email,
  githubHandle,
  onAvatarChange,
  onBannerChange,
  onAvatarRemove
}) {
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [generativeModalOpen, setGenerativeModalOpen] = useState(false);
  const [socialSyncModalOpen, setSocialSyncModalOpen] = useState(false);
  const [pendingCropImage, setPendingCropImage] = useState(null);
  const [cropTarget, setCropTarget] = useState('avatar'); // 'avatar' | 'banner'
  const [isDragOverAvatar, setIsDragOverAvatar] = useState(false);
  const [isDragOverBanner, setIsDragOverBanner] = useState(false);

  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const handleFileSelect = (e, target = 'avatar') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Selected file exceeds maximum limit of 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPendingCropImage(event.target.result);
      setCropTarget(target);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    // Reset file input
    e.target.value = '';
  };

  const handleDrop = (e, target = 'avatar') => {
    e.preventDefault();
    if (target === 'avatar') setIsDragOverAvatar(false);
    if (target === 'banner') setIsDragOverBanner(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPendingCropImage(event.target.result);
      setCropTarget(target);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropSave = (result) => {
    if (cropTarget === 'avatar') {
      onAvatarChange(result.dataUrl, result.altText);
    } else {
      onBannerChange(result.dataUrl);
    }
  };

  const handleGenerativeSelect = (genData) => {
    onAvatarChange(genData.url, genData.altText);
  };

  const handleSocialSyncSuccess = (socialData) => {
    onAvatarChange(socialData.avatar_url, socialData.alt_text);
  };

  const effectiveAvatar = avatarUrl || generateGradientAvatar(displayName || 'User');

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border-light dark:border-border-dark bg-white dark:bg-[#121418] shadow-sm">
      {/* 1. Hero Banner Zone (3:1 panoramic aspect ratio preview) */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOverBanner(true); }}
        onDragLeave={() => setIsDragOverBanner(false)}
        onDrop={(e) => handleDrop(e, 'banner')}
        className={`relative h-44 sm:h-52 w-full overflow-hidden bg-slate-900 group cursor-pointer transition-all ${
          isDragOverBanner ? 'ring-4 ring-blue-500 scale-[1.01]' : ''
        }`}
        onClick={() => bannerInputRef.current?.click()}
      >
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt="Profile banner preview"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <ImageIcon className="w-4 h-4" />
              <span>Panoramic 3:1 Banner Canvas</span>
            </div>
          </div>
        )}

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/70 text-white text-xs font-medium border border-white/20 shadow-lg">
            <Camera className="w-4 h-4" />
            <span>Change Panoramic Banner</span>
          </span>
        </div>

        <input
          type="file"
          ref={bannerInputRef}
          onChange={(e) => handleFileSelect(e, 'banner')}
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
        />
      </div>

      {/* 2. Overlapping Circular Avatar Hub */}
      <div className="px-6 pb-6 pt-0">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-4">
          {/* Avatar Hub with Camera Badge & Dropzone */}
          <div className="flex items-end gap-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOverAvatar(true); }}
              onDragLeave={() => setIsDragOverAvatar(false)}
              onDrop={(e) => handleDrop(e, 'avatar')}
              onClick={() => avatarInputRef.current?.click()}
              className={`relative group cursor-pointer flex-shrink-0 transition-transform ${
                isDragOverAvatar ? 'scale-110' : ''
              }`}
              title="Click or drag & drop to update profile picture"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white dark:ring-[#121418] shadow-xl bg-slate-800 transition-transform group-hover:scale-105">
                <img
                  src={effectiveAvatar}
                  alt={avatarAltText || displayName || 'User avatar'}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating Camera Badge on Bottom-Right */}
              <button
                type="button"
                className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-transform group-hover:scale-110 active:scale-95"
                title="Upload or change photo"
              >
                <Camera className="w-4 h-4" />
              </button>

              <input
                type="file"
                ref={avatarInputRef}
                onChange={(e) => handleFileSelect(e, 'avatar')}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
              />
            </div>

            <div className="pb-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {displayName || 'Anonymous User'}
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Avatar & Cover Identity Media
              </p>
            </div>
          </div>

          {/* Action Stack */}
          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload new photo</span>
            </button>

            <button
              type="button"
              onClick={() => setSocialSyncModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>Import Social</span>
            </button>

            <button
              type="button"
              onClick={() => setGenerativeModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
              title="Create procedural gradient or algorithmic SVG avatar"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Generative Style</span>
            </button>

            {avatarUrl && (
              <button
                type="button"
                onClick={onAvatarRemove}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>

        {/* Microcopy Spec */}
        <p className="text-[11px] text-text-muted mt-2 border-t border-border-light/60 dark:border-border-dark/60 pt-2 flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3 text-slate-400" />
          <span>Recommended: Square JPG, PNG, or WebP. Max 5MB. Client-side compressed under 500ms.</span>
        </p>
      </div>

      {/* Modals */}
      <ImageCropModal
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        imageSrc={pendingCropImage}
        aspectRatio={cropTarget === 'avatar' ? 1 : 3}
        title={cropTarget === 'avatar' ? 'Adjust Profile Picture' : 'Adjust Profile Banner (3:1 Panoramic)'}
        initialAltText={avatarAltText}
        onSave={handleCropSave}
      />

      <GenerativeAvatarModal
        isOpen={generativeModalOpen}
        onClose={() => setGenerativeModalOpen(false)}
        currentName={displayName}
        onSelect={handleGenerativeSelect}
      />

      <SocialSyncModal
        isOpen={socialSyncModalOpen}
        onClose={() => setSocialSyncModalOpen(false)}
        currentEmail={email}
        currentGithub={githubHandle}
        onSyncSuccess={handleSocialSyncSuccess}
      />
    </div>
  );
}
