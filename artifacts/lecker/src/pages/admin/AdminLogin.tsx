import React, { useState } from 'react';
import { Button, Input, Card } from '@/components/ui-elements';
import { useLocation } from 'wouter';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { sendOtp, verifyOtp } from '@/lib/firestore';
import { useAuth } from '@/lib/auth-context';

export default function AdminLogin() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loadingPhone, setLoadingPhone] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [, setLocation] = useLocation();
  const { user, login, logout, isLoading } = useAuth();

  React.useEffect(() => {
    if (!isLoading && user && user.role === 'admin') {
      setLocation('/manage/dashboard');
    }
  }, [user, isLoading, setLocation]);

  const isRegularUser = !isLoading && !!user && user.role !== 'admin';

  const handleLogoutAndSwitch = () => {
    logout();
    setStep('phone');
    setPhone('');
    setOtp('');
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoadingPhone(true);
    try {
      const result = await sendOtp(phone);
      setStep('otp');
      if (!result.fromServer) {
        toast({ title: 'تم الإرسال', description: `رمز التحقق: ${result.otp} (تجريبي)` });
      } else {
        toast({ title: 'تم الإرسال', description: 'تم إرسال الرمز إلى هاتفك' });
      }
    } catch (err: any) {
      toast({ title: 'خطأ', description: err.message || 'فشل إرسال الرمز', variant: 'destructive' });
    } finally {
      setLoadingPhone(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setLoadingOtp(true);
    try {
      const userResult = await verifyOtp(phone, otp);
      if (userResult.role !== 'admin') {
        toast({ title: 'غير مصرح', description: 'هذا الرقم ليس حساب أدمن', variant: 'destructive' });
        setStep('phone');
        setOtp('');
        return;
      }
      login(userResult);
      setLocation('/manage/dashboard');
    } catch (err: any) {
      toast({ title: 'خطأ', description: 'رمز التحقق غير صحيح', variant: 'destructive' });
    } finally {
      setLoadingOtp(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-gradient-to-br from-background via-secondary/20 to-background" />
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="z-10 w-full max-w-md">
        <Card className="p-8 sm:p-10 backdrop-blur-xl bg-card/90 border-primary/30 shadow-2xl shadow-primary/10">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 border border-primary/30 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gold-gradient">لوحة إدارة ليكير</h1>
            <p className="text-muted-foreground mt-2 text-sm">مخصص للمشرفين فقط</p>
          </div>

          {isRegularUser ? (
            <div className="text-center space-y-4">
              <div className="bg-secondary/50 rounded-xl p-4 text-sm text-muted-foreground">
                أنت مسجل الدخول كـ <span className="font-bold text-foreground" dir="ltr">{user!.phone}</span>
                <br />
                <span className="text-xs">هذا الحساب ليس لديه صلاحية الأدمن</span>
              </div>
              <Button onClick={handleLogoutAndSwitch} className="w-full">
                تسجيل خروج والدخول بحساب الأدمن
              </Button>
            </div>
          ) : step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <Input
                label="رقم هاتف الأدمن"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+970599000000"
                dir="ltr"
                className="text-center text-lg tracking-widest font-mono"
                required
              />
              <Button type="submit" className="w-full text-lg py-4" isLoading={loadingPhone}>
                إرسال رمز التحقق
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center mb-4 text-sm text-muted-foreground">
                أدخل الرمز المرسل إلى <span className="font-bold text-foreground" dir="ltr">{phone}</span>
                <button
                  type="button"
                  onClick={() => { setStep('phone'); setOtp(''); }}
                  className="block mx-auto mt-2 text-primary hover:underline"
                >
                  تعديل الرقم
                </button>
              </div>
              <Input
                label="رمز التحقق"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="------"
                dir="ltr"
                maxLength={6}
                className="text-center text-2xl tracking-[1em] font-mono font-bold"
                required
              />
              <Button type="submit" className="w-full text-lg py-4" isLoading={loadingOtp}>
                دخول لوحة الإدارة
              </Button>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
