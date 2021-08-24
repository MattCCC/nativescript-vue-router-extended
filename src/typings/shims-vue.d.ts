declare module 'vue/types/vue' {
  import type Vue from 'vue';

  import type {
      RouterService,
  } from '../router-service';

  interface VueConstructor<V extends Vue = Vue> {
    $router: RouterService;
  }
}