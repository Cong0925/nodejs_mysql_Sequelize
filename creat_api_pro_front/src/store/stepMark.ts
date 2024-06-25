import { Session } from "@/utils/cookieSet";

export default {
  namespaced: true,
  state: {
    activeStep:1
  },
  mutations: {
    SET_ACTIVESTEP(state:any, data: any) {
      Session.set('activeStep',data)
      state.activeStep = data;
    },
  },
  getters: {
    activeStep: (state: any) => state.activeStep
  },
  actions: {
    async setActiveStep({ commit }:any, data: any) {
      commit('SET_ACTIVESTEP', data);
    },
  },
};
