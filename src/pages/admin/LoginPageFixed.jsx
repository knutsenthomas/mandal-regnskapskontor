import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Briefcase, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ErrorBoundary from '@/components/ErrorBoundary';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const [isResetEmailSent, setIsResetEmailSent] = useState(false);

  const { signIn, signInWithMagicLink, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  React.useEffect(() => {
    if (user) {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  const validateForm = (type) => {
    if (!email) {
      setLocalError('Vennligst skriv inn e-postadressen din.');
      return false;
    }
    if (!email.includes('@')) {
      setLocalError('Vennligst skriv inn en gyldig e-postadresse.');
      return false;
    }
    if (type === 'password' && !password) {
      setLocalError('Vennligst skriv inn passordet ditt.');
      return false;
    }
    return true;
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!validateForm('password')) return;

    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;

      toast({
        title: "Suksess!",
        description: "Du blir nå videresendt til kontrollpanelet.",
        className: "bg-green-50 border-green-200 text-green-800"
      });
      navigate('/admin/dashboard');
    } catch (error) {
      handleLoginError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkLogin = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!validateForm('magic')) return;

    setIsLoading(true);
    try {
      const { error } = await signInWithMagicLink(email);
      if (error) throw error;

      setIsMagicLinkSent(true);
      toast({
        title: "Sjekk e-posten din",
        description: "Vi har sendt en magisk lenke til " + email,
        className: "bg-[#EAF4FB] border-[#B6D6F2] text-[#1B4965]"
      });
    } catch (error) {
      handleLoginError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginError = (error) => {
    console.error("Login Page Error:", error);
    let errorMessage = "Kunne ikke logge inn. Sjekk detaljene dine.";

    if (error.message.includes("check your email")) {
      errorMessage = "Sjekk e-posten din for innloggingslenke.";
    } else if (error.message.includes("Invalid login credentials")) {
      errorMessage = "Feil e-post eller passord.";
    } else {
      errorMessage = "Feil: " + error.message;
    }

    setLocalError(errorMessage);
    toast({
      title: "Noe gikk galt",
      description: errorMessage,
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex justify-center mb-6"
          >
            <div className="p-3 bg-[#1B4965] rounded-xl shadow-lg">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
          </motion.div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Admin Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Velg metode for å logge inn
          </p>
        </div>

        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="password">Passord</TabsTrigger>
            <TabsTrigger value="magic">Magisk Link</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {localError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3 text-red-800"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm font-medium">{localError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <TabsContent value="password">
            <form className="space-y-6" onSubmit={handlePasswordLogin}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-postadresse</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B4965]"
                    placeholder="admin@eksempel.no"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passord</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B4965]"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 bg-[#1B4965] hover:bg-[#0F3347] text-white"
              >
                {isLoading ? "Logger inn..." : <span className="flex items-center">Logg inn <ArrowRight className="ml-2 h-4 w-4" /></span>}
              </Button>
              <div className="flex justify-end mt-2">
                {isResetEmailSent ? (
                  <div className="w-full text-center py-4 bg-[#EAF4FB] border border-[#B6D6F2] rounded-lg text-[#1B4965] text-sm">
                    <p>
                      Vi har sendt deg en lenke for å lage nytt passord.<br />
                      Sjekk e-posten din: <strong>{email}</strong>
                    </p>
                    <button
                      type="button"
                      className="mt-2 text-xs text-[#1B4965] underline"
                      onClick={() => setIsResetEmailSent(false)}
                    >
                      Send på nytt
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="text-sm text-[#1B4965] hover:underline focus:outline-none"
                    onClick={async () => {
                      setLocalError("");
                      if (!email || !email.includes("@")) {
                        setLocalError("Skriv inn e-postadressen din først.");
                        return;
                      }
                      setIsLoading(true);
                      try {
                        const { error } = await supabase.auth.resetPasswordForEmail(email, {
                          redirectTo: window.location.origin + "/set-password"
                        });
                        if (error) throw error;
                        setIsResetEmailSent(true);
                        toast({
                          title: "Sjekk e-posten din",
                          description: "Vi har sendt deg en lenke for å lage nytt passord.",
                          className: "bg-[#EAF4FB] border-[#B6D6F2] text-[#1B4965]"
                        });
                      } catch (error) {
                        setLocalError(error.message || "Noe gikk galt.");
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    Glemt passord?
                  </button>
                )}
              </div>
            </form>
          </TabsContent>

          <TabsContent value="magic">
            {isMagicLinkSent ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-[#EAF4FB] rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-[#1B4965]" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Sjekk innboksen din!</h3>
                  <p className="text-gray-500 mt-2">
                    Vi har sendt en engangs-link til <strong>{email}</strong>.
                    Klikk på lenken for å logge inn.
                  </p>
                </div>
                <Button variant="outline" onClick={() => setIsMagicLinkSent(false)} className="mt-4">
                  Prøv en annen e-post
                </Button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleMagicLinkLogin}>
                <div className="bg-[#EAF4FB] p-4 rounded-lg flex gap-3 text-[#1B4965] text-sm">
                  <Sparkles className="w-5 w-5 flex-shrink-0" />
                  <p>Få en engangs-link på e-post. Du trenger ikke passord.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-postadresse</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      required
                      disabled={isLoading}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B4965]"
                      placeholder="admin@eksempel.no"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-6 bg-[#1B4965] hover:bg-[#0F3347] text-white"
                >
                  {isLoading ? "Sender..." : <span className="flex items-center">Send meg link <Sparkles className="ml-2 h-4 w-4" /></span>}
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

const LoginPageWithBoundary = () => (
  <ErrorBoundary>
    <LoginPage />
  </ErrorBoundary>
);

export default LoginPageWithBoundary;
