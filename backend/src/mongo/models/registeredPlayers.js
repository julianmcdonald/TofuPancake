export const RegisteredPlayer = {
  populate: async (player, path) => {
    // Already populated by our Postgres DAO
    return player;
  }
};
