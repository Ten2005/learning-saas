import { create } from "zustand";

interface FormState {
  // Login form
  loginEmail: string;
  loginPassword: string;
  loginError: string;
  loginLoading: boolean;

  // Signup form
  signupEmail: string;
  signupPassword: string;
  signupConfirmPassword: string;
  signupError: string;
  signupMessage: string;
  signupLoading: boolean;

  // Actions
  setLoginEmail: (email: string) => void;
  setLoginPassword: (password: string) => void;
  setLoginError: (error: string) => void;
  setLoginLoading: (loading: boolean) => void;

  setSignupEmail: (email: string) => void;
  setSignupPassword: (password: string) => void;
  setSignupConfirmPassword: (password: string) => void;
  setSignupError: (error: string) => void;
  setSignupMessage: (message: string) => void;
  setSignupLoading: (loading: boolean) => void;

  resetLoginForm: () => void;
  resetSignupForm: () => void;
}

export const useFormStore = create<FormState>((set) => ({
  // Login form state
  loginEmail: "",
  loginPassword: "",
  loginError: "",
  loginLoading: false,

  // Signup form state
  signupEmail: "",
  signupPassword: "",
  signupConfirmPassword: "",
  signupError: "",
  signupMessage: "",
  signupLoading: false,

  // Login actions
  setLoginEmail: (email) => set({ loginEmail: email }),
  setLoginPassword: (password) => set({ loginPassword: password }),
  setLoginError: (error) => set({ loginError: error }),
  setLoginLoading: (loading) => set({ loginLoading: loading }),

  // Signup actions
  setSignupEmail: (email) => set({ signupEmail: email }),
  setSignupPassword: (password) => set({ signupPassword: password }),
  setSignupConfirmPassword: (password) =>
    set({ signupConfirmPassword: password }),
  setSignupError: (error) => set({ signupError: error }),
  setSignupMessage: (message) => set({ signupMessage: message }),
  setSignupLoading: (loading) => set({ signupLoading: loading }),

  // Reset actions
  resetLoginForm: () =>
    set({
      loginEmail: "",
      loginPassword: "",
      loginError: "",
      loginLoading: false,
    }),

  resetSignupForm: () =>
    set({
      signupEmail: "",
      signupPassword: "",
      signupConfirmPassword: "",
      signupError: "",
      signupMessage: "",
      signupLoading: false,
    }),
}));
