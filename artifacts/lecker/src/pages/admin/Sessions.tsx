import React, { useEffect, useRef, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui-elements';
import { useLang } from '@/i18n';
import { Monitor, Smartphone, Tablet, Wifi, WifiOff, Clock, MapPin, Globe, LogOut, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface AdminSession {
  id: number;
  sessionId: string;
  phone: string | null;
  ipAddress: string | null;
  deviceType: string | null;
  browser: string | null;
  os: string | null;
  city: string | null;
  country: string | null;
  loginAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

function getSessionStatus(lastActiveAt: string): 'online' | 'idle' | 'offline' {
  const diff = Date.now() - new Date(lastActiveAt).getTime();
  if (diff < 15_000) return 'online';
  if (diff < 5 * 60_000) return 'idle';
  return 'offline';
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 10) return 'الآن';
  if (diff < 60) return `منذ ${diff} ثانية`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  return `منذ ${Math.floor(hours / 24)} يوم`;
}

function DeviceIcon({ type }: { type: string | null }) {
  if (type === 'mobile') return <Smartphone className="w-5 h-5" />;
  if (type === 'tablet') return <Tablet className="w-5 h-5" />;
  return <Monitor className="w-5 h-5" />;
}

export default function AdminSessions() {
  const { t } = useLang();
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [logoutingId, setLogoutingId] = useState<number | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/admin/sessions');
      if (!res.ok) return;
      const data = await res.json();
      setSessions(data);
    } catch {}
    setLoading(false);
  };

  const sendHeartbeat = async () => {
    try {
      await fetch('/api/admin/sessions/heartbeat', { method: 'POST' });
    } catch {}
  };

  useEffect(() => {
    fetchSessions();
    sendHeartbeat();

    heartbeatRef.current = setInterval(sendHeartbeat, 8_000);
    pollRef.current = setInterval(fetchSessions, 6_000);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleForceLogout = async (session: AdminSession) => {
    if (!window.confirm(t.admin.sessions_confirmLogout)) return;
    setLogoutingId(session.id);
    try {
      const res = await fetch(`/api/admin/sessions/${session.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: t.admin.sessions_loggedOut });
        setSessions(prev => prev.filter(s => s.id !== session.id));
      } else {
        const err = await res.json();
        toast({ title: t.error, description: err.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: t.error, variant: 'destructive' });
    }
    setLogoutingId(null);
  };

  const STATUS_CONFIG = {
    online: {
      label: t.admin.sessions_online,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10 border-emerald-400/30',
      dot: 'bg-emerald-400 animate-pulse',
      Icon: Wifi,
    },
    idle: {
      label: t.admin.sessions_idle,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10 border-amber-400/30',
      dot: 'bg-amber-400',
      Icon: Clock,
    },
    offline: {
      label: t.admin.sessions_offline,
      color: 'text-muted-foreground',
      bg: 'bg-secondary border-border',
      dot: 'bg-muted-foreground',
      Icon: WifiOff,
    },
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gold-gradient">{t.admin.sessions_title}</h1>
          <p className="text-muted-foreground mt-1">{t.admin.sessions_desc}</p>
        </div>
        <button
          onClick={fetchSessions}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title={t.refresh}
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
        تحديث تلقائي كل 6 ثوانٍ
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <Card key={i} className="h-36 animate-pulse bg-secondary/50 border-none" />)}
        </div>
      ) : sessions.length === 0 ? (
        <Card className="p-16 text-center">
          <WifiOff className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">{t.admin.sessions_empty}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map(session => {
            const status = getSessionStatus(session.lastActiveAt);
            const cfg = STATUS_CONFIG[status];
            const StatusIcon = cfg.Icon;

            const deviceTypeLabel = session.deviceType === 'mobile'
              ? t.admin.sessions_mobile
              : session.deviceType === 'tablet'
              ? t.admin.sessions_tablet
              : t.admin.sessions_desktop;

            return (
              <Card key={session.id} className={cn(
                'p-6 transition-all duration-300',
                session.isCurrent && 'border-primary/30 shadow-primary/10 shadow-lg'
              )}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Device icon + status */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    <div className={cn('p-4 rounded-2xl border', cfg.bg, cfg.color)}>
                      <DeviceIcon type={session.deviceType} />
                    </div>
                    <div className={cn('px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border', cfg.bg, cfg.color)}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
                      {cfg.label}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">{t.admin.sessions_device}</p>
                      <p className="font-semibold">
                        {deviceTypeLabel}
                        {session.os ? ` • ${session.os}` : ''}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-xs mb-1">{t.admin.sessions_browser}</p>
                      <p className="font-semibold flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5" />
                        {session.browser || t.admin.sessions_unknown}
                      </p>
                    </div>

                    {(session.city || session.country) && (
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">{t.admin.sessions_location}</p>
                        <p className="font-semibold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {[session.city, session.country].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    )}

                    {session.ipAddress && (
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">{t.admin.sessions_ip}</p>
                        <p className="font-mono text-xs bg-secondary px-2 py-1 rounded-lg inline-block">
                          {session.ipAddress}
                        </p>
                      </div>
                    )}

                    {session.phone && (
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">{t.admin.sessions_phone}</p>
                        <p className="font-semibold" dir="ltr">{session.phone}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-muted-foreground text-xs mb-1">{t.admin.sessions_loginTime}</p>
                      <p className="font-semibold">{format(new Date(session.loginAt), 'MM/dd HH:mm')}</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-xs mb-1">{t.admin.sessions_lastActive}</p>
                      <p className="font-semibold">{timeAgo(session.lastActiveAt)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {session.isCurrent ? (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                        {t.admin.sessions_currentSession}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleForceLogout(session)}
                        disabled={logoutingId === session.id}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-destructive border border-destructive/20 hover:bg-destructive/10 transition-colors disabled:opacity-50"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        {t.admin.sessions_forceLogout}
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
