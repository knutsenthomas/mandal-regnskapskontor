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
  const navigate = useNavigate();
  const location = useLocation();

  // Hent token_hash og type fra query-parametere
  const params = new URLSearchParams(location.search);
  const tokenHash = params.get('token_hash');
  const type = params.get('type');

  useEffect(() => {
    const verify = async () => {
      if (!tokenHash || !type) {
        setError('Ugyldig eller manglende lenke.');
        setVerifying(false);
        return;
      }
      setVerifying(true);
      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash: tokenHash,
      });
      if (error) {
        setError(error.message);
        setVerifying(false);
      } else {
        setVerified(true);
        setVerifying(false);
      }
    };
    verify();
    // eslint-disable-next-line
  }, [tokenHash, type]);


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
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Passordet er satt! Du kan nå logge inn.');
    }
  };

  let heading = "Sett nytt passord";
  let infoText = "Lag et nytt passord for å få tilgang til admin-panelet.";
  if (type === "invite") {
    heading = "Velkommen! Sett ditt passord";
    infoText = "Dette er første gang du logger inn. Velg et passord for kontoen din.";
  } else if (type === "recovery") {
    heading = "Tilbakestill passord";
    infoText = "Skriv inn et nytt passord for å tilbakestille kontoen din.";
  }

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Verifiserer lenke...</div>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600 text-lg">{error || 'Ugyldig eller utløpt lenke.'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">{heading}</h1>
        <p className="mb-6 text-gray-600 text-sm">{infoText}</p>
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
            className="w-full border rounded px-3 py-2"
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
            className="w-full border rounded px-3 py-2"
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
