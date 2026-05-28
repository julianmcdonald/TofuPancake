const mockAuth = {
  onIdTokenChanged: (callback) => {
    // Instantly notify application that there is no active logged-in user (default to guest mode)
    callback(null);
    return () => {};
  },
  signInWithPopup: async () => {
    console.log('Sign in is disabled in guest mode.');
    return {};
  },
  signOut: async () => {
    console.log('Sign out is disabled in guest mode.');
    return {};
  },
  currentUser: null,
};

const mockFirebase = {
  auth: Object.assign(() => mockAuth, {
    GoogleAuthProvider: class {},
  }),
  initializeApp: () => {},
};

const auth = mockAuth;
const firebase = mockFirebase;

export { auth, firebase };
