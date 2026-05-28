const mockAuth = {
  verifyIdToken: async (token) => {
    return {
      uid: token || 'dummy-user-uid',
      picture: null,
    };
  },
  getUser: async (uid) => {
    return {
      uid: uid || 'dummy-user-uid',
      displayName: 'Guest Player',
      photoURL: null,
    };
  },
};

const mockFirebase = {
  auth: () => mockAuth,
  credential: {
    applicationDefault: () => ({}),
  },
  initializeApp: () => ({}),
};

export default mockFirebase;
