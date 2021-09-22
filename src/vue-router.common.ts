import Vue from "nativescript-vue";
import { Frame } from "@nativescript/core/ui/frame";

import { RouterService } from "./router-service";

import {
  NSVueRouterOptions,
  RouterServiceOptions,
} from "./typings/router-service";

import { registerActionDispatcher } from "./router-dispatcher-service";

import routerMixin from "./router-mixin";

/**
 * Create router wrapper function
 *
 * @param {NSVueRouterOptions} vueRouterOptions Vue Router compatible options
 * @param {RouterService} routerOptions Router Service options
 * @returns {RouterService} Router Service Instance
 */
export const createRouter = (
  vueRouterOptions: NSVueRouterOptions,
  routerOptions: RouterServiceOptions = {}
) => {
  const vm = routerOptions.vm || Vue;
  const proto = (Vue as any).prototype;

  const router = new RouterService(vueRouterOptions, {
    frame: Frame,
    vm: proto,
    ...routerOptions,
  });

  // Vue 3 compatibility
  if (vm.createApp && vm.config.globalProperties) {
    vm.config.globalProperties.$routeTo = router.push.bind(router);
    vm.config.globalProperties.$routeBack = router.back.bind(router);
    vm.config.globalProperties.$router = router;
  } else {
    proto.$routeTo = router.push.bind(router);
    proto.$routeBack = router.back.bind(router);
    proto.$router = router;

    const route = (Vue as any).observable({
      name: '',
      path: '',
    });

    proto.$route = route;
  }

  if (vm.mixin) {
    vm.mixin(routerMixin);
  }

  // Register Action Dispatcher if store is available
  if (proto.$store) {
    registerActionDispatcher(router, proto.$store);
  }

  return router;
};

export default {
  createRouter,
};
