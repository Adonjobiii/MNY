import React, { useState, useEffect } from 'react';
import { Lock, ArrowRight, AlertCircle, ShieldCheck, Fingerprint } from 'lucide-react';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { Capacitor } from '@capacitor/core';

export default function LockScreen({ onUnlock }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Web specific states
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [hasStoredCredentials, setHasStoredCredentials] = useState(false);
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [successPassword, setSuccessPassword] = useState('');

  const isMobile = Capacitor.isNativePlatform();

  useEffect(() => {
    if (isMobile) {
      handleNativeBiometricLogin();
    } else {
      checkBiometricWeb();
    }
  }, [isMobile]);

  // ==========================================
  // MOBILE: BIOMETRIC ONLY
  // ==========================================
  const handleNativeBiometricLogin = async () => {
    try {
      setError('');
      const result = await NativeBiometric.isAvailable();
      if (!result.isAvailable) {
        setError('Biometric authentication is not set up on this device. Please set up a screen lock/fingerprint in your phone settings.');
        return;
      }

      await NativeBiometric.verifyIdentity({
        reason: "Unlock your financial vault",
        title: "Vault Locked",
        subtitle: "Use fingerprint or face to unlock",
      });
      
      // If verifyIdentity succeeds, unlock the app immediately! No server check.
      onUnlock('biometric_bypass');
    } catch (err) {
      console.log('Biometric verification failed or cancelled', err);
      setError('Biometric verification failed. Please try again.');
    }
  };

  // ==========================================
  // WEB / PROGRESSIVE ENHANCEMENT
  // ==========================================
  const checkBiometricWeb = async () => {
    try {
      const result = await NativeBiometric.isAvailable();
      if (result.isAvailable) {
        setIsBiometricAvailable(true);
        try {
          await NativeBiometric.getCredentials({ server: "mny_app" });
          setHasStoredCredentials(true);
          handleBiometricLoginWeb();
        } catch (e) {
          setHasStoredCredentials(false);
        }
      }
    } catch (error) {
      console.log('Biometric not available', error);
    }
  };

  const handleBiometricLoginWeb = async () => {
    try {
      const credentials = await NativeBiometric.getCredentials({ server: "mny_app" });
      await verifyPassword(credentials.password, true);
    } catch (error) {
      console.log('Biometric login failed', error);
    }
  };

  const handleEnableBiometricWeb = async () => {
    try {
      await NativeBiometric.setCredentials({
        username: "mny_user",
        password: successPassword,
        server: "mny_app"
      });
      setShowBiometricPrompt(false);
      onUnlock(successPassword);
    } catch (error) {
      console.error('Failed to save biometric credentials', error);
      onUnlock(successPassword);
    }
  };

  const verifyPassword = async (pwToVerify, isBiometric = false) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwToVerify })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('APP_PASSWORD', pwToVerify);
        
        if (!isBiometric && isBiometricAvailable && !hasStoredCredentials) {
          setSuccessPassword(pwToVerify);
          setShowBiometricPrompt(true);
        } else {
          onUnlock(pwToVerify);
        }
      } else {
        setError('Incorrect Master Password');
      }
    } catch (err) {
      setError('Could not connect to server to verify password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyWeb = async (e) => {
    e.preventDefault();
    await verifyPassword(password);
  };

  // ==========================================
  // RENDER UI
  // ==========================================

  if (showBiometricPrompt) {
    return (
      <div className="fixed inset-0 bg-[var(--background)] flex items-center justify-center z-[9999] p-4">
        <div className="glass-panel p-8 md:p-12 rounded-3xl max-w-md w-full text-center shadow-2xl shadow-blue-500/10 border border-[var(--border)] animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Fingerprint size={40} className="text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Enable Fingerprint?</h1>
          <p className="opacity-60 mb-8">Use your fingerprint or FaceID to unlock MNY faster next time.</p>
          <div className="space-y-3">
            <button 
              onClick={handleEnableBiometricWeb}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 transition-all"
            >
              Enable Biometric Login
            </button>
            <button 
              onClick={() => onUnlock(successPassword)}
              className="w-full bg-black/5 dark:bg-white/5 font-bold py-4 rounded-2xl flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[var(--background)] flex items-center justify-center z-[9999] p-4">
      <div className="glass-panel p-8 md:p-12 rounded-3xl max-w-md w-full text-center shadow-2xl shadow-blue-500/10 border border-[var(--border)] animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck size={40} className="text-blue-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Vault Locked</h1>
        
        {isMobile ? (
          <>
            <p className="opacity-60 mb-8">Use your fingerprint or FaceID to unlock.</p>
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm justify-center font-medium p-3 bg-red-500/10 rounded-xl mb-4">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            <button 
              onClick={handleNativeBiometricLogin}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 transition-all mt-4"
            >
              <Fingerprint size={20} />
              Unlock with Biometrics
            </button>
          </>
        ) : (
          <>
            <p className="opacity-60 mb-8">Enter your Master Password to access your finances.</p>
            <form onSubmit={handleVerifyWeb} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="opacity-40" />
                </div>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Master Password"
                  className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 ring-blue-500 transition-all font-medium"
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm justify-center font-medium p-3 bg-red-500/10 rounded-xl">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={!password || isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none disabled:shadow-none"
              >
                {isLoading ? 'Verifying...' : 'Unlock Vault'}
                {!isLoading && <ArrowRight size={18} />}
              </button>
              
              {hasStoredCredentials && (
                <button 
                  type="button"
                  onClick={handleBiometricLoginWeb}
                  className="w-full bg-black/5 dark:bg-white/5 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:bg-black/10 dark:hover:bg-white/10 mt-4"
                >
                  <Fingerprint size={20} />
                  Use Fingerprint
                </button>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
