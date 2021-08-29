import Vue from "vue";
import type { Route, RouteOptions } from "nativescript-vue-router-extended";
import type {
  NavigationGuardWithThis,
  NavigationGuard,
} from "vue-router/dist/vue-router.d";
import type { RouterService } from "nativescript-vue-router-extended/router-service";

declare module "*.vue" {
  export default Vue;
}

declare module "vue/types/vue" {
  interface Vue {
    $router: RouterService;
    $routeTo(route: Route | string, options?: RouteOptions): void;
  }
}

declare module "vue/types/options" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ComponentOptions<V extends Vue> {
    beforeRouteEnter?: NavigationGuardWithThis<undefined>;
    beforeRouteLeave?: NavigationGuard;
    beforeRouteUpdate?: NavigationGuard;
    navigatedFrom?: NavigationGuard;
  }
}
