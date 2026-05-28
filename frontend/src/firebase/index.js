let tokenListeners = [];
let currentUserVal = null;

const mockAuth = {
  onIdTokenChanged: (callback) => {
    tokenListeners.push(callback);
    callback(currentUserVal ? { getIdToken: async () => 'mock-session-token' } : null);
    return () => {
      tokenListeners = tokenListeners.filter(l => l !== callback);
    };
  },
  signInWithPopup: async () => {
    return {};
  },
  signOut: async () => {
    currentUserVal = null;
    tokenListeners.forEach(l => l(null));
    return {};
  },
  mockLogin: (name) => {
    currentUserVal = {
      displayName: name,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
    };
    tokenListeners.forEach(l => l({ getIdToken: async () => 'mock-session-token' }));
  },
  mockLogout: () => {
    currentUserVal = null;
    tokenListeners.forEach(l => l(null));
  },
  get currentUser() {
    return currentUserVal;
  }
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
