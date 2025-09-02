'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ShareLink, SharePermission } from '@/types/cloudExport';
import { 
  Share2, 
  Link as LinkIcon, 
  QrCode, 
  Eye, 
  Download, 
  Edit,
  Copy,
  ExternalLink,
  Calendar,
  Users,
  Shield,
  Trash2,
  Plus,
  Settings,
  Globe,
  Lock
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

export function ShareCenter() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock share links data
  const shareLinks: ShareLink[] = [
    {
      id: '1',
      exportJobId: '1',
      url: 'https://expensetracker.app/share/abc123',
      qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PC9zdmc+',
      permission: 'view',
      expiresAt: '2025-02-01T10:30:00Z',
      accessCount: 12,
      maxAccess: 50,
      createdAt: '2025-01-02T10:30:00Z',
      password: true
    },
    {
      id: '2',
      exportJobId: '2',
      url: 'https://expensetracker.app/share/def456',
      permission: 'download',
      accessCount: 5,
      createdAt: '2025-01-01T15:45:00Z',
      password: false
    },
    {
      id: '3',
      exportJobId: '6',
      url: 'https://expensetracker.app/share/ghi789',
      permission: 'edit',
      expiresAt: '2025-01-15T00:00:00Z',
      accessCount: 3,
      maxAccess: 10,
      createdAt: '2024-12-30T11:25:00Z',
      password: true
    }
  ];

  const getPermissionIcon = (permission: SharePermission) => {
    switch (permission) {
      case 'view':
        return <Eye className="h-4 w-4" />;
      case 'download':
        return <Download className="h-4 w-4" />;
      case 'edit':
        return <Edit className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getPermissionColor = (permission: SharePermission) => {
    switch (permission) {
      case 'view':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'download':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'edit':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show success toast
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isNearExpiry = (expiresAt?: string) => {
    if (!expiresAt) return false;
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7 && diffDays > 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Share Center</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Create and manage shareable links for your expense reports
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Share Link
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <LinkIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{shareLinks.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Active Links</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {shareLinks.reduce((sum, link) => sum + link.accessCount, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Views</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {shareLinks.filter(link => isNearExpiry(link.expiresAt) || isExpired(link.expiresAt)).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Expiring Soon</div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Links List */}
      <div className="space-y-4">
        {shareLinks.map((link) => (
          <div
            key={link.id}
            className={`bg-white dark:bg-gray-800 rounded-xl p-6 border transition-all hover:shadow-lg ${
              isExpired(link.expiresAt) 
                ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10' 
                : isNearExpiry(link.expiresAt)
                ? 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                {/* QR Code */}
                <div className="flex-shrink-0">
                  {link.qrCode ? (
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <QrCode className="h-8 w-8 text-gray-600 dark:text-gray-300" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <LinkIcon className="h-8 w-8 text-gray-600 dark:text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Link Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Export Report #{link.exportJobId}
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPermissionColor(link.permission)}`}>
                      {getPermissionIcon(link.permission)}
                      {link.permission.charAt(0).toUpperCase() + link.permission.slice(1)}
                    </span>
                    {link.password && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                        <Lock className="h-3 w-3" />
                        Protected
                      </span>
                    )}
                    {isExpired(link.expiresAt) && (
                      <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 rounded-full text-xs font-medium">
                        Expired
                      </span>
                    )}
                    {isNearExpiry(link.expiresAt) && (
                      <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300 rounded-full text-xs font-medium">
                        Expires Soon
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 font-mono text-sm text-gray-600 dark:text-gray-300 truncate">
                      {link.url}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(link.url)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Views</div>
                      <div>
                        {link.accessCount}
                        {link.maxAccess && ` / ${link.maxAccess}`}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Created</div>
                      <div>{formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}</div>
                    </div>
                    {link.expiresAt && (
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Expires</div>
                        <div className={isExpired(link.expiresAt) ? 'text-red-500' : isNearExpiry(link.expiresAt) ? 'text-orange-500' : ''}>
                          {format(new Date(link.expiresAt), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Security</div>
                      <div className="flex items-center gap-1">
                        {link.password ? <Lock className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                        {link.password ? 'Password' : 'Public'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {link.qrCode && (
                  <Button size="sm" variant="outline" title="Show QR Code">
                    <QrCode className="h-4 w-4" />
                  </Button>
                )}
                <Button size="sm" variant="outline" title="Analytics">
                  <Users className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" title="Open Link">
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" title="Settings">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Usage Progress Bar */}
            {link.maxAccess && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
                  <span>Usage</span>
                  <span>{link.accessCount} / {link.maxAccess} views</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      (link.accessCount / link.maxAccess) > 0.8 
                        ? 'bg-red-500' 
                        : (link.accessCount / link.maxAccess) > 0.6 
                        ? 'bg-orange-500' 
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min((link.accessCount / link.maxAccess) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* No links state */}
      {shareLinks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔗</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No share links yet
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Create your first shareable link to start collaborating
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Share Link
          </Button>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Security & Privacy</h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
              Your shared data is encrypted and protected. You can revoke access, set expiration dates, and track who views your reports.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded text-xs">
                🔒 End-to-end encryption
              </span>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded text-xs">
                👁️ View tracking
              </span>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded text-xs">
                ⏰ Auto expiration
              </span>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded text-xs">
                🛡️ Password protection
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}