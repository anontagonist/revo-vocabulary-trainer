import { User } from "../types";

const USERS_KEY = 'revo_users';
const CURRENT_USER_KEY = 'revo_current_user_id';

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
    password, // Simulation only
    name,
    avatar: undefined
  };

  users.push(newUser);
  saveUsers(users);
  localStorage.setItem(CURRENT_USER_KEY, newUser.id);
  return newUser;
};

export const loginUser = (email: string, password: string): User => {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  
  if (!user) {
    throw new Error("E-Mail oder Passwort falsch.");
  }
  
  localStorage.setItem(CURRENT_USER_KEY, user.id);
  return user;
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

export const updateUserProfile = (userId: string, updates: Partial<User>): User => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) throw new Error("Benutzer nicht gefunden");

  const updatedUser = { ...users[index], ...updates };
  users[index] = updatedUser;
  saveUsers(users);
  return updatedUser;
};