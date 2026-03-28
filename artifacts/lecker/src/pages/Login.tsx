import React, { useState } from 'react';
import { useSendOtp, useVerifyOtp, useGetMe } from '@workspace/api-client-react';
import { Button, Input, Card } from '@/components/ui-elements';
import { useLocation } from 'wouter';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [, setLocation] = useLocation();

  const sendOtpMutation = useSendOtp();
  const verifyOtpMutation = useVerifyOtp();
  const { data: user, refetch } = useGetMe({ query: { retry: false } });

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') setLocation('/admin/dashboard');
      else setLocation('/');
    }
  }, [user, setLocation]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    try {
      const res = await sendOtpMutation.mutateAsync({ data: { phone } });
      setStep('otp');
      toast({ title: 'تم إرسال الرمز', description: res.message }); // In dev this shows the OTP
    } catch (err: any) {
      toast({ title: 'خطأ', description: err.message || 'فشل إرسال الرمز', variant: 'destructive' });
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    try {
      await verifyOtpMutation.mutateAsync({ data: { phone, otp } });
      await refetch(); // Will trigger the redirect effect
    } catch (err: any) {
      toast({ title: 'خطأ', description: 'رمز التحقق غير صحيح', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <img src={`${import.meta.env.BASE_URL}images/hero-bg.png`} alt="Background" className="w-full h-full object-cover opacity-20 blur-sm" />
      </div>
      
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="z-10 w-full max-w-md">
        <Card className="p-8 sm:p-10 backdrop-blur-xl bg-card/80 border-primary/20 shadow-2xl shadow-primary/10">
          <div className="text-center mb-8">
            <img src={`${import.meta.env.BASE_URL}images/lecker-logo.png`} alt="Lecker" className="h-20 w-20 mx-auto mb-4 drop-shadow-md" />
            <h1 className="text-3xl font-display text-gold-gradient">أهلاً بك في لكر</h1>
            <p className="text-muted-foreground mt-2">تسجيل الدخول لمتابعة طلباتك</p>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <Input 
                label="رقم الجوال" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="05XXXXXXXX" 
                dir="ltr" 
                className="text-center text-lg tracking-widest font-mono"
                required
              />
              <Button type="submit" className="w-full text-lg py-4" isLoading={sendOtpMutation.isPending}>متابعة</Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center mb-4 text-sm text-muted-foreground">
                أدخل الرمز المرسل إلى <span className="font-bold text-foreground" dir="ltr">{phone}</span>
                <button type="button" onClick={() => setStep('phone')} className="block mx-auto mt-2 text-primary hover:underline">تعديل الرقم</button>
              </div>
              <Input 
                label="رمز التحقق (OTP)" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                placeholder="----" 
                dir="ltr" 
                maxLength={6}
                className="text-center text-2xl tracking-[1em] font-mono font-bold"
                required
              />
              <Button type="submit" className="w-full text-lg py-4" isLoading={verifyOtpMutation.isPending}>تأكيد الدخول</Button>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
