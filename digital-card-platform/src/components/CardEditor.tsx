'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import BusinessCard from './BusinessCard';
import ThemePicker from './ThemePicker';
import ImageUploader from './ImageUploader';
import { CardFormData, SocialLinks, CardData } from '@/types';
import { generateSlug } from '@/lib/utils';

const SOCIAL_FIELDS: { key: keyof SocialLinks; label: string }[] = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'twitter', label: 'Twitter / X' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'github', label: 'GitHub' },
  { key: 'codepen', label: 'CodePen' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'youtube', label: 'YouTube' },
];

const defaultForm: CardFormData = {
  fullName: '',
  jobTitle: '',
  company: '',
  bio: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  socialLinks: {},
  primaryColor: '#c8261d',
  accentColor: '#6b0500',
  backgroundColor: '#220200',
  slug: '',
  isPublished: true,
};

interface CardEditorProps {
  cardId?: string;
  initialData?: CardData;
}

export default function CardEditor({ cardId, initialData }: CardEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState<CardFormData>(defaultForm);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [enabledSocials, setEnabledSocials] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (initialData) {
      setForm({
        fullName: initialData.fullName,
        jobTitle: initialData.jobTitle || '',
        company: initialData.company || '',
        bio: initialData.bio || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        website: initialData.website || '',
        address: initialData.address || '',
        socialLinks: initialData.socialLinks || {},
        primaryColor: initialData.primaryColor,
        accentColor: initialData.accentColor,
        backgroundColor: initialData.backgroundColor,
        slug: initialData.slug,
        isPublished: initialData.isPublished,
      });
      setAvatarUrl(initialData.avatarUrl || null);
      setBannerUrl(initialData.bannerUrl || null);
      // Enable social fields that have values
      const enabled = new Set<string>();
      if (initialData.socialLinks) {
        for (const [key, val] of Object.entries(initialData.socialLinks)) {
          if (val) enabled.add(key);
        }
      }
      setEnabledSocials(enabled);
    }
  }, [initialData]);

  const updateField = useCallback(
    <K extends keyof CardFormData>(field: K, value: CardFormData[K]) => {
      setForm((prev) => {
        const next = { ...prev, [field]: value };
        // Auto-generate slug from name if slug is empty or matches old auto-slug
        if (field === 'fullName' && (!prev.slug || prev.slug === generateSlug(prev.fullName))) {
          next.slug = generateSlug(value as string);
        }
        return next;
      });
    },
    []
  );

  const updateSocialLink = useCallback((key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [key]: value },
    }));
  }, []);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!cardId) return;
    const interval = setInterval(() => {
      handleSave(true);
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardId, form]);

  const handleSave = async (silent = false) => {
    if (!form.fullName.trim()) {
      if (!silent) setError('Full name is required');
      return;
    }

    if (!silent) setSaving(true);
    setError('');

    try {
      const url = cardId ? `/api/cards/${cardId}` : '/api/cards';
      const method = cardId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          avatarUrl,
          bannerUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      if (!silent) {
        setSuccess('Card saved successfully!');
        setTimeout(() => {
          setSuccess('');
          router.push('/dashboard');
        }, 1500);
      }
    } catch (err) {
      if (!silent) setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      if (!silent) setSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!cardId) {
      // For new cards, use local preview
      const reader = new FileReader();
      reader.onload = () => setAvatarUrl(reader.result as string);
      reader.readAsDataURL(file);
      return;
    }
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await fetch(`/api/cards/${cardId}/upload-avatar`, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      setAvatarUrl(data.avatarUrl);
    }
  };

  const handleBannerUpload = async (file: File) => {
    if (!cardId) {
      const reader = new FileReader();
      reader.onload = () => setBannerUrl(reader.result as string);
      reader.readAsDataURL(file);
      return;
    }
    const formData = new FormData();
    formData.append('banner', file);
    const res = await fetch(`/api/cards/${cardId}/upload-banner`, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      setBannerUrl(data.bannerUrl);
    }
  };

  // Build preview card data
  const previewCard: CardData = {
    id: cardId || 'preview',
    slug: form.slug || 'preview',
    fullName: form.fullName || 'Your Name',
    jobTitle: form.jobTitle || null,
    company: form.company || null,
    bio: form.bio || null,
    email: form.email || null,
    phone: form.phone || null,
    website: form.website || null,
    address: form.address || null,
    avatarUrl,
    bannerUrl,
    socialLinks: form.socialLinks,
    primaryColor: form.primaryColor,
    accentColor: form.accentColor,
    backgroundColor: form.backgroundColor,
    viewCount: 0,
    isPublished: form.isPublished,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left Panel - Form */}
      <div className="flex-1 space-y-6">
        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Personal Info</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                className="w-full rounded-lg bg-gray-700 border border-gray-600 px-4 py-2.5 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none text-sm"
                placeholder="John Doe"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={form.jobTitle}
                  onChange={(e) => updateField('jobTitle', e.target.value)}
                  className="w-full rounded-lg bg-gray-700 border border-gray-600 px-4 py-2.5 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none text-sm"
                  placeholder="Software Engineer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => updateField('company', e.target.value)}
                  className="w-full rounded-lg bg-gray-700 border border-gray-600 px-4 py-2.5 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none text-sm"
                  placeholder="Acme Inc."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                className="w-full rounded-lg bg-gray-700 border border-gray-600 px-4 py-2.5 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none text-sm"
                placeholder="A brief introduction..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Contact Info</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full rounded-lg bg-gray-700 border border-gray-600 px-4 py-2.5 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none text-sm"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full rounded-lg bg-gray-700 border border-gray-600 px-4 py-2.5 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none text-sm"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Website
              </label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => updateField('website', e.target.value)}
                className="w-full rounded-lg bg-gray-700 border border-gray-600 px-4 py-2.5 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none text-sm"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Address
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                className="w-full rounded-lg bg-gray-700 border border-gray-600 px-4 py-2.5 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none text-sm"
                placeholder="123 Main St, City, State"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Social Links</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {SOCIAL_FIELDS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  setEnabledSocials((prev) => {
                    const next = new Set(prev);
                    if (next.has(key)) {
                      next.delete(key);
                      updateSocialLink(key, '');
                    } else {
                      next.add(key);
                    }
                    return next;
                  });
                }}
                className={`rounded-lg px-3 py-1.5 text-xs transition ${
                  enabledSocials.has(key)
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {SOCIAL_FIELDS.filter(({ key }) => enabledSocials.has(key)).map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {label}
                </label>
                <input
                  type="url"
                  value={(form.socialLinks as Record<string, string>)[key] || ''}
                  onChange={(e) => updateSocialLink(key, e.target.value)}
                  className="w-full rounded-lg bg-gray-700 border border-gray-600 px-4 py-2.5 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none text-sm"
                  placeholder={`https://${key}.com/username`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Images</h2>
          <div className="flex gap-6">
            <ImageUploader
              label="Avatar"
              currentUrl={avatarUrl}
              onUpload={handleAvatarUpload}
              onClear={() => setAvatarUrl(null)}
              aspect="square"
            />
            <ImageUploader
              label="Banner / Cover"
              currentUrl={bannerUrl}
              onUpload={handleBannerUpload}
              onClear={() => setBannerUrl(null)}
              aspect="banner"
            />
          </div>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Theme</h2>
          <ThemePicker
            currentPrimary={form.primaryColor}
            onSelect={(theme) => {
              updateField('primaryColor', theme.primaryColor);
              updateField('accentColor', theme.accentColor);
              updateField('backgroundColor', theme.backgroundColor);
            }}
          />
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Primary</label>
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => updateField('primaryColor', e.target.value)}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Accent</label>
              <input
                type="color"
                value={form.accentColor}
                onChange={(e) => updateField('accentColor', e.target.value)}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Background</label>
              <input
                type="color"
                value={form.backgroundColor}
                onChange={(e) => updateField('backgroundColor', e.target.value)}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Custom URL Slug
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">/card/</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => updateField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  className="flex-1 rounded-lg bg-gray-700 border border-gray-600 px-4 py-2.5 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none text-sm"
                  placeholder="john-doe"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Published</p>
                <p className="text-xs text-gray-500">Make this card publicly visible</p>
              </div>
              <button
                onClick={() => updateField('isPublished', !form.isPublished)}
                className={`relative w-11 h-6 rounded-full transition ${
                  form.isPublished ? 'bg-red-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    form.isPublished ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="rounded-lg bg-red-600 px-8 py-3 font-medium text-white hover:bg-red-700 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : cardId ? 'Update Card' : 'Create Card'}
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-lg border border-gray-600 px-6 py-3 text-sm text-gray-300 hover:border-gray-500 transition"
          >
            Cancel
          </button>
          {error && <p className="text-sm text-red-400">{error}</p>}
          {success && <p className="text-sm text-green-400">{success}</p>}
        </div>
      </div>

      {/* Right Panel - Live Preview */}
      <div className="lg:w-[380px] lg:sticky lg:top-24 lg:self-start">
        <h2 className="text-lg font-semibold text-white mb-4">Live Preview</h2>
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: form.backgroundColor }}
        >
          <BusinessCard card={previewCard} isPreview />
        </div>
      </div>
    </div>
  );
}
