import React, { useState, useEffect } from "react";
import { Lock, User, LogIn, UserPlus, AlertCircle, CheckCircle2, Compass, Eye, EyeOff } from "lucide-react";
import { User as UserType } from "../types";

interface AuthScreenProps {
  onLoginSuccess: (user: UserType) => void;
}

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [isLoginTab, setIsLoginTab] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  // Login fields
  const [loginUsername, setLoginUsername] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  
  // Register fields
  const [registerName, setRegisterName] = useState<string>("");
  const [registerUsername, setRegisterUsername] = useState<string>("");
  const [registerPassword, setRegisterPassword] = useState<string>("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState<string>("");
  
  // Notifications
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load and seed registered users
  const getRegisteredUsers = () => {
    try {
      const stored = localStorage.getItem("terrain_registered_users");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error reading users", e);
    }
    // Seed default admin account
    const defaultData = [
      { username: "admin", name: "Eng. Lucas Admin", password: "123", createdAt: new Date().toISOString() }
    ];
    localStorage.setItem("terrain_registered_users", JSON.stringify(defaultData));
    return defaultData;
  };

  // Automatically clear errors/success notifications on tab toggle
  useEffect(() => {
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [isLoginTab]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const usernameTrimmed = loginUsername.trim().toLowerCase();
    const passwordTrimmed = loginPassword.trim();

    if (!usernameTrimmed || !passwordTrimmed) {
      setErrorMsg("Preencha todos os campos do formulário para entrar.");
      return;
    }

    const users = getRegisteredUsers();
    const matchedUser = users.find(
      (u: any) => u.username.toLowerCase() === usernameTrimmed && u.password === passwordTrimmed
    );

    if (matchedUser) {
      setSuccessMsg(`Bem-vindo, ${matchedUser.name}!`);
      setTimeout(() => {
        onLoginSuccess({
          username: matchedUser.username,
          name: matchedUser.name,
          createdAt: matchedUser.createdAt
        });
      }, 500);
    } else {
      setErrorMsg("Usuário ou senha inválidos. Tente novamente ou cadastre-se.");
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const nameTrimmed = registerName.trim();
    const usernameTrimmed = registerUsername.trim().toLowerCase();
    const passwordTrimmed = registerPassword.trim();
    const confirmPasswordTrimmed = registerConfirmPassword.trim();

    if (!nameTrimmed || !usernameTrimmed || !passwordTrimmed || !confirmPasswordTrimmed) {
      setErrorMsg("Todos os campos do cadastro são obrigatórios.");
      return;
    }

    if (usernameTrimmed.length < 3) {
      setErrorMsg("O nome de usuário deve conter no mínimo 3 caracteres.");
      return;
    }

    if (passwordTrimmed.length < 3) {
      setErrorMsg("A senha deve conter no mínimo 3 caracteres.");
      return;
    }

    if (passwordTrimmed !== confirmPasswordTrimmed) {
      setErrorMsg("As senhas informadas não coincidem.");
      return;
    }

    const users = getRegisteredUsers();
    const alreadyExists = users.some((u: any) => u.username.toLowerCase() === usernameTrimmed);

    if (alreadyExists) {
      setErrorMsg("Este usuário já está cadastrado. Tente outro nome.");
      return;
    }

    // Save user
    const newUser = {
      username: usernameTrimmed,
      name: nameTrimmed,
      password: passwordTrimmed,
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem("terrain_registered_users", JSON.stringify(updatedUsers));

    setSuccessMsg("Cadastro feito com sucesso! Entrando...");
    setTimeout(() => {
      onLoginSuccess({
        username: newUser.username,
        name: newUser.name,
        createdAt: newUser.createdAt
      });
    }, 800);
  };

  const handleGuestLogin = () => {
    setErrorMsg(null);
    setSuccessMsg("Acessando como convidado...");
    setTimeout(() => {
      onLoginSuccess({
        username: "convidado",
        name: "Convidado",
        createdAt: new Date().toISOString()
      });
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col justify-start p-6 bg-slate-900 overflow-y-auto select-none">
      {/* Brand logo & title */}
      <div className="flex flex-col items-center mt-6 mb-8 text-center shrink-0">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/10 mb-4 animate-pulse">
          <Compass className="h-7 w-7 text-slate-950 stroke-[2.5]" />
        </div>
        <h1 className="font-display font-black text-lg text-white leading-tight tracking-wide">
          Análise de Terreno Híbrida IA
        </h1>
        <p className="text-[11px] text-slate-400 mt-1 max-w-[240px] leading-relaxed">
          Planejamento geotécnico, topológico e fundações em lotes civis.
        </p>
      </div>

      {/* Main card panel */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 shadow-xl">
        {/* TAB Switcher */}
        <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800/40 mb-5">
          <button
            id="auth-tab-login"
            type="button"
            onClick={() => setIsLoginTab(true)}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              isLoginTab ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Entrar</span>
          </button>
          <button
            id="auth-tab-register"
            type="button"
            onClick={() => setIsLoginTab(false)}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              !isLoginTab ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Cadastrar</span>
          </button>
        </div>

        {/* Action feedback notifications */}
        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-400 text-[11px] leading-relaxed flex items-start gap-2 mb-4 animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400 text-[11px] leading-relaxed flex items-start gap-2 mb-4 animate-fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Forms box */}
        {isLoginTab ? (
          /* LOGIN FORM */
          <form id="login-form" onSubmit={handleLoginSubmit} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-1">
                Usuário do Sistema
              </label>
              <div className="relative">
                <User className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="login-username-input"
                  type="text"
                  placeholder="Seu usuário (Ex: admin)"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-1">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha civil (Ex: 123)"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                />
                <button
                  id="login-show-pass-btn"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="mt-2 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 active:scale-98"
            >
              <LogIn className="h-4 w-4" />
              <span>Conectar Loteamento</span>
            </button>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form id="register-form" onSubmit={handleRegisterSubmit} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-1">
                Nome do Engenheiro/Arquiteto
              </label>
              <div className="relative">
                <User className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="register-name-input"
                  type="text"
                  placeholder="Nome Completo ou Registro"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-1">
                Nome de Usuário (Username)
              </label>
              <div className="relative">
                <User className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="register-username-input"
                  type="text"
                  placeholder="Ex: engenheiroL"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-1">
                Sua Senha
              </label>
              <div className="relative">
                <Lock className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="register-password-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 3 caracteres"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                />
                <button
                  id="register-show-pass-btn"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-1">
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="register-confirm-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Repita a mesa senha"
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                />
              </div>
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              className="mt-2 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 active:scale-98"
            >
              <UserPlus className="h-4 w-4" />
              <span>Registrar e Conectar</span>
            </button>
          </form>
        )}
      </div>

      {/* Guest bypass divider */}
      <div className="flex items-center gap-3 my-5 shrink-0">
        <div className="flex-1 h-px bg-slate-800/80"></div>
        <span className="text-[10px] font-mono text-slate-500 tracking-wider">OU ACESSE</span>
        <div className="flex-1 h-px bg-slate-800/80"></div>
      </div>

      <button
        id="guest-login-btn"
        type="button"
        onClick={handleGuestLogin}
        className="py-3 bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800/80 hover:border-slate-700/80 font-semibold rounded-xl text-xs transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 shrink-0"
      >
        <span>Acessar de forma Anônima (Convidado)</span>
        <span className="text-emerald-500">→</span>
      </button>

      {/* Default credentials note helper */}
      <div className="mt-6 text-center text-[10px] text-slate-500 leading-normal shrink-0 bg-slate-950/20 p-2.5 rounded-lg border border-slate-805/40">
        🔑 Conta de demonstração disponível:<br />
        Dica: Use Usuário <strong className="text-emerald-500">admin</strong> e Senha <strong className="text-emerald-500">123</strong>
      </div>
    </div>
  );
}
