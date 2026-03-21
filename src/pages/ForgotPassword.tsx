import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomBar } from "@/components/MobileBottomBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, AlertTriangle, Loader2, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";
import { PasswordStrength } from "@/components/ui/password-strength";
import { useAuth } from "@/contexts/AuthContext";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const COLORS = {
  TEAL: "#008080",
  CORAL: "#FF7F50",
  CORAL_LIGHT: "#FF9E7A",
};

const ForgotPassword = () => {
  const [step, setStep] = useState<'email' | 'otp' | 'newPassword' | 'done'>('email');
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const validatePassword = (pwd: string): { valid: boolean; message?: string } => {
    if (pwd.length < 8) return { valid: false, message: "Password must be at least 8 characters long" };
    if (!/[A-Z]/.test(pwd)) return { valid: false, message: "Add at least one uppercase letter" };
    if (!/[0-9]/.test(pwd)) return { valid: false, message: "Add at least one number" };
    if (!/[!@#$%^&*()]/.test(pwd)) return { valid: false, message: "Add one special character" };
    return { valid: true };
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });
      if (error) throw error;
      setStep('otp');
      toast({ title: "Code sent!", description: "Check your email for a verification code." });
    } catch (error: any) {
      if (error.message?.toLowerCase().includes("signups not allowed") || error.message?.toLowerCase().includes("otp")) {
        setError("No account found with this email, or OTP is not enabled. Please check your email.");
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });
      if (error) throw error;
      setStep('newPassword');
      toast({ title: "Verified!", description: "Now set your new password." });
    } catch (error: any) {
      setError(error.message || "Invalid or expired code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      setError(validation.message || "Invalid password");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      await supabase.auth.signOut();
      setStep('done');
      toast({ title: "Password updated!", description: "Please log in with your new password." });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthenticatedPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user?.email) {
      setError("Please log in again and try once more");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      setError(validation.message || "Invalid password");
      return;
    }

    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (signInError) throw new Error("Current password is incorrect");

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;

      await supabase.auth.signOut({ scope: 'global' });
      toast({ title: "Password updated", description: "Please log in with your new password." });
      navigate("/auth");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const AuthHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle: string }) => (
    <div className="flex flex-col items-center mb-8">
      <div className="bg-primary/10 p-4 rounded-2xl mb-4">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground text-center">{title}</h1>
      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-2 text-center px-4">
        {subtitle}
      </p>
    </div>
  );

  const handleBack = () => {
    if (step === 'email') navigate("/auth");
    else if (step === 'otp') setStep('email');
    else if (step === 'newPassword') setStep('otp');
    else navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header className="hidden md:block" />
      
      <main className="container px-4 pt-12 max-w-lg mx-auto relative z-10">
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="mb-6 hover:bg-muted rounded-xl font-bold uppercase text-[10px] tracking-widest text-muted-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="bg-card rounded-[32px] p-8 md:p-10 shadow-2xl border border-border transition-all duration-500">
          {user ? (
            <form onSubmit={handleAuthenticatedPasswordChange} className="space-y-5">
              <AuthHeader icon={Lock} title="Change Password" subtitle="Confirm your current password, then set a new one" />

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Password</Label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    className="rounded-2xl border-border bg-muted/50 h-14 pr-12"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">New Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    className="rounded-2xl border-border bg-muted/50 h-14 pr-12"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <PasswordStrength password={newPassword} />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Confirm Password</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    className="rounded-2xl border-border bg-muted/50 h-14"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-destructive text-[10px] font-bold uppercase tracking-tight"><AlertTriangle className="h-4 w-4" /> {error}</div>}
              <PrimaryButton loading={loading} text="Change Password" disabled={!currentPassword || !newPassword || newPassword !== confirmPassword || !validatePassword(newPassword).valid} />
            </form>
          ) : (
            <>
              {step === 'email' && (
                <form onSubmit={handleSendOtp} className="space-y-6">
                  <AuthHeader icon={Mail} title="Recovery" subtitle="Enter your email to receive a verification code" />
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                    <Input 
                      type="email" 
                      className="rounded-2xl border-border bg-muted/50 h-14" 
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  {error && <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-destructive text-[10px] font-bold uppercase tracking-tight"><AlertTriangle className="h-4 w-4" /> {error}</div>}
                  <PrimaryButton loading={loading} text="Send Code" disabled={!email} />
                </form>
              )}

              {step === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <AuthHeader icon={KeyRound} title="Enter Code" subtitle={`We sent a verification code to ${email}`} />
                  
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    Didn't receive the code?{" "}
                    <button type="button" onClick={handleSendOtp} className="text-primary hover:underline font-semibold">
                      Resend
                    </button>
                  </p>

                  {error && <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-destructive text-[10px] font-bold uppercase tracking-tight"><AlertTriangle className="h-4 w-4" /> {error}</div>}
                  <PrimaryButton loading={loading} text="Verify Code" disabled={otp.length !== 6} />
                </form>
              )}

              {step === 'newPassword' && (
                <form onSubmit={handleSetNewPassword} className="space-y-6">
                  <AuthHeader icon={Lock} title="New Password" subtitle="Set your new password" />

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">New Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        className="rounded-2xl border-border bg-muted/50 h-14 pr-12"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <PasswordStrength password={newPassword} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        className="rounded-2xl border-border bg-muted/50 h-14 pr-12"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error && <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-destructive text-[10px] font-bold uppercase tracking-tight"><AlertTriangle className="h-4 w-4" /> {error}</div>}
                  <PrimaryButton loading={loading} text="Set New Password" disabled={!newPassword || newPassword !== confirmPassword || !validatePassword(newPassword).valid} />
                </form>
              )}

              {step === 'done' && (
                <div className="space-y-8 text-center">
                  <AuthHeader icon={CheckCircle2} title="All Done!" subtitle="Your password has been updated successfully" />
                  <Button
                    onClick={() => navigate("/auth")}
                    className="w-full rounded-2xl h-12 font-bold uppercase text-[10px] tracking-widest"
                  >
                    Go to Login
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer className="pb-24" />
      <MobileBottomBar />
    </div>
  );
};

const PrimaryButton = ({ text, loading, disabled }: { text: string, loading?: boolean, disabled?: boolean }) => (
  <Button 
    type="submit" 
    disabled={disabled || loading}
    className="w-full py-8 rounded-2xl text-md font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all active:scale-95 border-none"
    style={{ 
        background: `linear-gradient(135deg, ${COLORS.CORAL_LIGHT} 0%, ${COLORS.CORAL} 100%)`,
        boxShadow: `0 12px 24px -8px ${COLORS.CORAL}88`
    }}
  >
    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : text}
  </Button>
);

export default ForgotPassword;
