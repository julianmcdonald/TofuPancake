function firebaseAuth(request, response, next) {
  request.body.firebaseUID = 'dummy-user-uid';
  next();
}

export default firebaseAuth;
