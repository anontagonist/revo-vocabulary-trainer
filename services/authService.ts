
import { User } from "../types";

const USERS_KEY = 'revo_users';
const CURRENT_USER_KEY = 'revo_current_user_id';
const LAST_EMAIL_KEY = 'revo_last_email';

const getUsers = (): User[] => {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const registerUser = (email: string, password: string, name: string): User => {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("Diese E-Mail-Adresse wird bereits verwendet.");
  }

  const newUser: User = {
    id: Date.now().toString(),
    email,
    password, 
    name,
    avatar: undefined,
    createdAt: Date.now(),
    lastLogin: Date.now()
  };

  users.push(newUser);
  saveUsers(users);
  localStorage.setItem(CURRENT_USER_KEY, newUser.id);
  localStorage.setItem(LAST_EMAIL_KEY, email);
  return newUser;
};

export const loginUser = (email: string, password: string): User => {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  
  if (!user) {
    throw new Error("E-Mail oder Passwort falsch.");
  }
  
  localStorage.setItem(CURRENT_USER_KEY, user.id);
  localStorage.setItem(LAST_EMAIL_KEY, email);
  return user;
};

// PREPARATION FOR FIREBASE GOOGLE LOGIN
export const loginWithGoogle = async (): Promise<User> => {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 1200));
  
  // This is a placeholder. When Firebase is active, we would use:
  // const provider = new GoogleAuthProvider();
  // const result = await signInWithPopup(auth, provider);
  
  const mockGoogleUser: User = {
    id: "google_" + Date.now(),
    email: "test-user@gmail.com",
    name: "Google Nutzer",
    avatar: "https://lh3.googleusercontent.com/a/ACg8ocL...",
    createdAt: Date.now(),
    lastLogin: Date.now(),
    isPremium: true
  };

  const users = getUsers();
  if (!users.find(u => u.email === mockGoogleUser.email)) {
    users.push(mockGoogleUser);
    saveUsers(users);
  }

  localStorage.setItem(CURRENT_USER_KEY, mockGoogleUser.id);
  localStorage.setItem(LAST_EMAIL_KEY, mockGoogleUser.email);
  return mockGoogleUser;
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const currentId = localStorage.getItem(CURRENT_USER_KEY);
  if (!currentId) return null;
  const users = getUsers();
  return users.find(u => u.id === currentId) || null;
};

export const getLastEmail = (): string | null => {
  return localStorage.getItem(LAST_EMAIL_KEY);
};

export const updateUserProfile = (userId: string, updates: Partial<User>): User => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) throw new Error("Benutzer nicht gefunden");

  const updatedUser = { ...users[index], ...updates };
  users[index] = updatedUser;
  saveUsers(users);
  return updatedUser;
};
