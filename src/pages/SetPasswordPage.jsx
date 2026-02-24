import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';


const SetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [flowType, setFlowType] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verify = async () => {
      setVerifying(true);
      setError('');

      const queryParams = new URLSearchParams(location.search);
      const hashParams = new URLSearchParams((location.hash || '').replace(/^#/, ''));

      const tokenHash = queryParams.get('token_hash');
      const type = queryParams.get('type') || hashParams.get('type') || '';
      const code = queryParams.get('code');
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      setFlowType(type || '');

      try {
        // 1) Direct token session in URL hash (common Supabase email links)
        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) throw sessionError;
        }
        // 2) PKCE code flow (email links with ?code=...)
        else if (code) {
          const { error: codeError } = await supabase.auth.exchangeCodeForSession(code);
          if (codeError) throw codeError;
        }
        // 3) token_hash flow (custom recovery/invite route)
        else if (tokenHash && type) {
          const { error: otpError } = await supabase.auth.verifyOtp({
            type,
            token_hash: tokenHash,
          });
          if (otpError) throw otpError;
        } else {
          throw new Error('Ugyldig eller manglende lenke.');
        }

        // Ensure a usable auth session exists before allowing password update
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          throw new Error('Innloggingssesjon mangler. Åpne lenken fra e-posten på nytt.');
        }

        setVerified(true);
      } catch (verifyError) {
        setError(verifyError?.message || 'Ugyldig eller utløpt lenke.');
        setVerified(false);
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [location.search, location.hash]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!password || password.length < 8) {
      setError('Passordet må være minst 8 tegn.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passordene matcher ikke.');
      return;
    }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Innloggingssesjon mangler. Åpne invitasjonslenken på nytt.');
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSuccess('Passordet er satt! Du kan nå logge inn.');
    } catch (submitError) {
      setError(submitError?.message || 'Kunne ikke sette passord.');
    } finally {
      setLoading(false);
    }
  };

  let heading = "Sett nytt passord";
  let infoText = "Lag et nytt passord for å få tilgang til admin-panelet.";
  if (flowType === "invite") {
    heading = "Velkommen! Sett ditt passord";
    infoText = "Dette er første gang du logger inn. Velg et passord for kontoen din.";
  } else if (flowType === "recovery") {
    heading = "Tilbakestill passord";
    infoText = "Skriv inn et nytt passord for å tilbakestille kontoen din.";
  }

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-lg">Verifiserer lenke...</div>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-red-600 text-lg">{error || 'Ugyldig eller utløpt lenke.'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form onSubmit={handleSubmit} className="bg-card text-card-foreground p-8 rounded shadow-md border border-border w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-foreground">{heading}</h1>
        <p className="mb-6 text-muted-foreground text-sm">{infoText}</p>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {success && (
          <div className="mb-4 text-green-600 flex flex-col gap-2">
            {success}
            <Button type="button" className="w-full" onClick={() => navigate('/admin/login')}>
              Gå til innlogging
            </Button>
          </div>
        )}
        <div className="mb-4">
          <label className="block mb-1">Nytt passord</label>
          <input
            type="password"
            className="w-full border border-border bg-background text-foreground rounded px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1">Gjenta passord</label>
          <input
            type="password"
            className="w-full border border-border bg-background text-foreground rounded px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Lagrer...' : 'Sett passord'}
        </Button>
      </form>
    </div>
  );
};

export default SetPasswordPage;
