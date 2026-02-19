import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';

const SetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Hent access token fra URL
  const getAccessToken = () => {
    const params = new URLSearchParams(window.location.hash.replace('#', '?'));
    return params.get('access_token');
  };

  useEffect(() => {
    // Hvis ikke access_token finnes, redirect til login
    if (!getAccessToken()) {
      navigate('/admin/login');
    }
    // eslint-disable-next-line
  }, []);

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
    const access_token = getAccessToken();
    const { error } = await supabase.auth.updateUser({ password }, { accessToken: access_token });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Passordet er satt! Du kan nå logge inn.');
      setTimeout(() => navigate('/admin/login'), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Sett nytt passord</h1>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {success && <div className="mb-4 text-green-600">{success}</div>}
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
