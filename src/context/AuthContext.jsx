import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  updateProfile,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth, googleProvider, isConfigured } from '../firebase';

const AuthContext = createContext({
  user: null,
  firebaseUser: null,
  authLoading: true,
  isAuthenticated: false,
  login: async () => {},
  loginWithGoogle: async () => {},
  signup: async () => {},
  logout: async () => {},
  mapFirebaseAuthError: () => ''
});

/**
 * Maps Firebase Auth error codes to user-friendly messages
 */
export const mapFirebaseAuthError = (error) => {
  if (!error) return 'An unknown authentication error occurred.';
  const code = error.code || error.message || '';

  if (code.includes('auth/invalid-credential') || code.includes('auth/invalid-login-credentials')) {
    return 'Invalid email address or password. Please check your credentials.';
  }
  if (code.includes('auth/user-not-found')) {
    return 'No account found with this email address. Please sign up first.';
  }
  if (code.includes('auth/wrong-password')) {
    return 'Incorrect password. Please try again or click "Forgot Password".';
  }
  if (code.includes('auth/email-already-in-use')) {
    return 'An account with this email address already exists. Please sign in.';
  }
  if (code.includes('auth/weak-password')) {
    return 'Password is too weak. Please use at least 8 characters with numbers & symbols.';
  }
  if (code.includes('auth/invalid-email')) {
    return 'Please enter a valid email address.';
  }
  if (code.includes('auth/too-many-requests')) {
    return 'Too many failed login attempts. Please wait a few minutes before trying again.';
  }
  if (code.includes('auth/network-request-failed')) {
    return 'Network connection error. Please check your internet connection.';
  }
  if (code.includes('auth/popup-closed-by-user')) {
    return 'Google Sign-In popup was closed before completing authentication.';
  }
  if (code.includes('auth/popup-blocked')) {
    return 'Google Sign-In popup was blocked by your browser. Please allow popups for this site.';
  }
  if (code.includes('auth/account-exists-with-different-credential')) {
    return 'An account already exists with the same email address using a different sign-in method.';
  }
  if (code.includes('auth/unauthorized-domain')) {
    return 'This web domain is not authorized in Firebase Authentication Console.';
  }

  return error.message || 'Authentication failed. Please try again.';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Helper to build cohesive user profile object
  const buildUserProfile = async (fbUser) => {
    if (!fbUser) return null;
    let storedUser = null;
    try {
      const raw = localStorage.getItem('user');
      if (raw) storedUser = JSON.parse(raw);
    } catch (e) {}

    const email = fbUser.email || storedUser?.email || '';
    const displayName = fbUser.displayName || storedUser?.artistName || storedUser?.name || email.split('@')[0];
    const role = (email.toLowerCase() === 'adventureof693@gmail.com' || storedUser?.role === 'Admin') 
      ? 'Admin' 
      : 'Artist';

    let token = `firebase-${fbUser.uid}`;
    try {
      token = await fbUser.getIdToken();
    } catch (e) {}

    const profile = {
      uid: fbUser.uid,
      email: email,
      name: displayName,
      artistName: displayName,
      role: role,
      isOtpVerified: true,
      emailVerified: fbUser.emailVerified,
      photoURL: fbUser.photoURL || null,
      ...storedUser
    };

    // Cache locally for synchronous reads
    localStorage.setItem('user', JSON.stringify(profile));
    localStorage.setItem('token', token);

    return profile;
  };

  useEffect(() => {
    let unsubscribe = () => {};

    if (isConfigured && auth) {
      // Single global listener for persistent Firebase Auth state
      unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          setFirebaseUser(fbUser);
          const profile = await buildUserProfile(fbUser);
          setUser(profile);
        } else {
          // Check if admin user is logged in via legacy backend token
          let legacyUser = null;
          try {
            const raw = localStorage.getItem('user');
            if (raw) legacyUser = JSON.parse(raw);
          } catch (e) {}

          if (legacyUser && legacyUser.role === 'Admin') {
            setUser(legacyUser);
          } else {
            setFirebaseUser(null);
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        }
        setAuthLoading(false);
      });
    } else {
      // Fallback mode if Firebase env vars not configured
      let storedUser = null;
      try {
        const raw = localStorage.getItem('user');
        if (raw) storedUser = JSON.parse(raw);
      } catch (e) {}
      setUser(storedUser);
      setAuthLoading(false);
    }

    return () => unsubscribe();
  }, []);

  // Email / Password Login
  const login = async (email, password) => {
    if (!isConfigured || !auth) {
      throw new Error('Firebase authentication is not configured.');
    }
    await setPersistence(auth, browserLocalPersistence);
    const userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
    const profile = await buildUserProfile(userCredential.user);
    setUser(profile);
    setFirebaseUser(userCredential.user);
    window.dispatchEvent(new Event('auth-change'));
    return profile;
  };

  // Google OAuth Login
  const loginWithGoogle = async () => {
    if (!isConfigured || !auth) {
      throw new Error('Firebase authentication is not configured.');
    }
    await setPersistence(auth, browserLocalPersistence);
    const result = await signInWithPopup(auth, googleProvider);
    const profile = await buildUserProfile(result.user);
    setUser(profile);
    setFirebaseUser(result.user);
    window.dispatchEvent(new Event('auth-change'));
    return profile;
  };

  // Email / Password Registration
  const signup = async (email, password, name) => {
    if (!isConfigured || !auth) {
      throw new Error('Firebase authentication is not configured.');
    }
    await setPersistence(auth, browserLocalPersistence);
    const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
    if (name) {
      await updateProfile(userCredential.user, { displayName: name.trim() });
    }
    const profile = await buildUserProfile(userCredential.user);
    setUser(profile);
    setFirebaseUser(userCredential.user);
    window.dispatchEvent(new Event('auth-change'));
    return profile;
  };

  // Explicit User Logout
  const logout = async () => {
    try {
      if (isConfigured && auth) {
        await signOut(auth);
      }
    } catch (e) {
      console.warn("SignOut error:", e);
    } finally {
      setUser(null);
      setFirebaseUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      sessionStorage.clear();
      window.dispatchEvent(new Event('auth-change'));
    }
  };

  const value = {
    user,
    firebaseUser,
    authLoading,
    isAuthenticated: !authLoading && !!user,
    login,
    loginWithGoogle,
    signup,
    logout,
    mapFirebaseAuthError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
