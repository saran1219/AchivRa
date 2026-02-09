import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  User,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { User as AppUser, UserRole } from '@/types';

export const authService = {
  // Register a new user
  async register(email: string, password: string, displayName: string, role: UserRole, department: string) {
    try {
      console.log('🔷 Starting registration for:', email, 'Role:', role);
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('🔷 Auth user created:', user.uid);
      console.log('🔷 About to save user profile with role:', role, typeof role);

      // Create user profile in Firestore - WAIT for it to complete
      const userData = {
        id: user.uid,
        email,
        name: displayName,
        role: role, // Make sure role is saved correctly
        department,
        profileImageUrl: '',
        phoneNumber: '',
        enrollmentNumber: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
        isActive: true,
      };

      console.log('🔷 User data to save:', userData);

      try {
        await setDoc(doc(db, 'users', user.uid), userData);
        console.log('🔷 SUCCESS! User profile saved to Firestore with role:', role);
      } catch (firestoreError: any) {
        console.error('🔷 FIRESTORE ERROR:', firestoreError?.code, firestoreError?.message);
        throw new Error(`Failed to create user profile: ${firestoreError?.message}`);
      }

      // Give Firestore a moment to sync across regions
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('🔷 Registration complete, user:', email, 'role:', role);
      return user;
    } catch (error: any) {
      const errorMessage = error?.message || 'Registration failed';
      console.error('🔷 Registration error:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Login user
  async login(email: string, password: string) {
    try {
      await setPersistence(auth, browserLocalPersistence);
      
      // First, authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Then, verify that user profile exists in Firestore
      const userProfile = await this.getUserProfile(user.uid);
      
      if (!userProfile) {
        // User is authenticated but doesn't have a profile
        // Sign them out and throw error
        await signOut(auth);
        throw new Error('User account not found. Please register first before logging in.');
      }

      console.log('🔷 User logged in successfully:', email, 'Role:', userProfile.role, 'Department:', userProfile.department);
      return user;
    } catch (error: any) {
      // Handle specific Firebase auth errors
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email. Please register first.');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address.');
      } else if (error.message?.includes('User account not found')) {
        throw error; // Re-throw our custom message
      }
      throw error;
    }
  },

  // Logout user
  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  },

  // Get user profile from Firestore with retry logic
  async getUserProfile(uid: string): Promise<AppUser | null> {
    try {
      const docRef = doc(db, 'users', uid);
      let docSnap = await getDoc(docRef);
      
      // Retry up to 3 times if document doesn't exist (Firestore consistency)
      let retries = 0;
      while (!docSnap.exists() && retries < 3) {
        console.log(`User document not found, retrying... (attempt ${retries + 1})`);
        await new Promise(resolve => setTimeout(resolve, 500));
        docSnap = await getDoc(docRef);
        retries++;
      }
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const userProfile: AppUser = {
          id: data?.id || uid,
          email: data?.email || '',
          name: (data?.name || data?.displayName || 'User') as string,
          role: data?.role,
          department: data?.department || '',
          createdAt: data?.createdAt || new Date(),
          updatedAt: data?.updatedAt || new Date(),
        };
        console.log('User profile loaded:', userProfile.email, 'Role:', userProfile.role);
        return userProfile;
      }
      
      console.warn('User profile not found after retries');
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  // Get all users with a specific role
  async getUsersByRole(role: UserRole): Promise<AppUser[]> {
    try {
      const q = query(collection(db, 'users'), where('role', '==', role));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => doc.data() as AppUser);
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  // Google Sign-In (Login only - requires pre-existing account)
  async signInWithGoogle(_selectedRole?: UserRole, _selectedDept?: string) {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log('🔷 Google sign-in attempt for:', user.email);

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // User tried to sign in with Google but doesn't have an account
        // Sign them out and throw error
        await signOut(auth);
        throw new Error('User account not found. Please register first before logging in with Google.');
      }

      // Update last login
      console.log('🔷 User exists, updating last login');
      await setDoc(
        doc(db, 'users', user.uid),
        { lastLogin: new Date(), updatedAt: new Date() },
        { merge: true }
      );

      const userProfile = userDoc.data() as AppUser;
      console.log('🔷 Google sign-in successful:', user.email, 'Role:', userProfile.role, 'Department:', userProfile.department);

      // Give Firestore a moment to sync
      await new Promise(resolve => setTimeout(resolve, 1500));

      return user;
    } catch (error) {
      console.error('🔷 Google sign-in error:', error);
      throw error;
    }
  },

  // Google Sign-Up (Registration - creates new account)
  async signUpWithGoogle(selectedRole: UserRole, selectedDept: string) {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log('🔷 Google sign-up attempt for:', user.email, 'Role:', selectedRole, 'Dept:', selectedDept);

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create new user profile with selected role and department
        console.log('🔷 Creating new Google account with role:', selectedRole, 'department:', selectedDept);
        
        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid,
          email: user.email,
          name: user.displayName || 'User',
          role: selectedRole,
          department: selectedDept,
          profileImageUrl: user.photoURL || '',
          phoneNumber: user.phoneNumber || '',
          enrollmentNumber: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLogin: new Date(),
          isActive: true,
        });
        console.log('🔷 SUCCESS! Google account created with role:', selectedRole, 'department:', selectedDept);
      } else {
        // Account already exists, just update last login
        console.log('🔷 Google account already exists, updating last login');
        await setDoc(
          doc(db, 'users', user.uid),
          { lastLogin: new Date(), updatedAt: new Date() },
          { merge: true }
        );
      }

      // Give Firestore a moment to sync
      await new Promise(resolve => setTimeout(resolve, 1500));

      return user;
    } catch (error) {
      console.error('🔷 Google sign-up error:', error);
      throw error;
    }
  },
};
