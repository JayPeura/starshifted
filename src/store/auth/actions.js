export const logIn = async ({ commit }, payload) => {
  await api.post("/api/v1/jwt/create", payload).then((response) => {
    const token = response.data;
    commit("setToken", token);
    api.defaults.headers.common.Authorization = "JWT" + token.access;
  });
};

export const logOut = ({ commit }) => {};

export const getMe = async ({ commit, dispatch }, token) => {};
