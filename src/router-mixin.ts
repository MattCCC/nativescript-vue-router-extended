import Vue from "nativescript-vue";
import { Page } from "@nativescript/core/ui/page";
import { RouterService } from "./router-service";

export default {
  nextCallbacks: [],

  mounted() {
    if (!this.nativeView.eventsSet && this.isPage()) {
      this.nativeView.eventsSet = true;

      // Register all navigation events
      this.nativeView.on(
        Page.navigatingFromEvent,
        this.onNavigatingFrom.bind(this)
      );
      this.nativeView.on(
        Page.navigatingToEvent,
        this.onNavigatingTo.bind(this)
      );
      this.nativeView.on(Page.navigatedToEvent, this.onNavigatedTo.bind(this));
      this.nativeView.on(
        Page.navigatedFromEvent,
        this.onNavigatedFrom.bind(this)
      );
    }
  },

  destroyed() {
    if (this.nativeView.eventsSet && this.isPage()) {
      this.nativeView.off(Page.navigatedToEvent, this.onNavigatedTo.bind(this));
      this.nativeView.off(
        Page.navigatingToEvent,
        this.onNavigatingTo.bind(this)
      );
      this.nativeView.off(
        Page.navigatingFromEvent,
        this.onNavigatingFrom.bind(this)
      );
      this.nativeView.off(
        Page.navigatedFromEvent,
        this.onNavigatedFrom.bind(this)
      );
    }
  },

  methods: {
    onNavigatingFrom(data) {
      // Don't call the callback when entering a modal, but when an actual navigation out of it happens
      // This way modals won't be treated as another routes in NS 6.5+
      // This is to support teardown of events when navigating out of pages, on which modals are displayed
      if (
        data.object.frame &&
        data.object.frame.parent &&
        data.object.frame.parent.modal
      ) {
        // Preserve instance to execute it on redirection within the context of component's instance
        (Vue as any).prototype.$modalPage = {
          data,
          instance: this,
        };

        return;
      }

      const to = (this.$router as RouterService).getNewRoute();
      const from = (this.$router as RouterService).getPreviousRoute();

      if (this.$options.beforeRouteLeave) {
        this.$options.beforeRouteLeave.call(
          this,
          to,
          from,
          data.object.navigationContext
        );
      }

      if (this.$options.navigatingFrom) {
        console.warn(
          "ROUTER",
          "navigatingFrom() is deprecated. Use beforeRouteLeave() instead"
        );

        this.$options.navigatingFrom.call(
          this,
          to,
          from,
          data.object.navigationContext
        );
      }
    },

    onNavigatingTo(data) {
      const to = (this.$router as RouterService).getNewRoute();
      const from = (this.$router as RouterService).getPreviousRoute();

      if (this.$options.beforeRouteUpdate && to && from && to.path === from.path) {
        this.$options.beforeRouteUpdate.call(
          this,
          to,
          from,
          data.object.navigationContext
        );
      }

      if (to && to.beforeEnter && typeof to.beforeEnter === "function") {
        const next = (vmContext) => {
          if (typeof vmContext === "undefined") {
            return;
          }

          // Do not invoke callback immediately even though instance of new component is provided
          // This is to keep cb invocation order in sync with Vue-Router
          if (typeof vmContext === "function") {
            this.$options.nextCallbacks.push(vmContext);
          }
        };

        to.beforeEnter.call(
          this,
          to,
          from,
          next,
          data.object.navigationContext
        );
      }

      if (this.$options.beforeRouteEnter) {
        const next = (vmContext) => {
          if (typeof vmContext === "undefined") {
            return;
          }

          // Do not invoke callback immediately even though instance of new component is provided
          // This is to keep cb invocation order in sync with Vue-Router
          if (typeof vmContext === "function") {
            this.$options.nextCallbacks.push(vmContext);
          }
        };

        this.$options.beforeRouteEnter.call(
          this,
          to,
          from,
          next,
          data.object.navigationContext
        );
      }

      this.$router.invokeBeforeResolve();

      if (this.$options.navigatingTo) {
        console.warn(
          "ROUTER",
          "navigatingTo() is deprecated. Use beforeRouteEnter() instead"
        );

        this.$options.navigatingTo.call(
          this,
          to,
          from,
          data.object.navigationContext
        );
      }
    },

    onNavigatedFrom(data) {
      if (this.$options.navigatedFrom) {
        // eslint-disable-next-line max-len
        console.warn(
          "ROUTER",
          "navigatedFrom() is deprecated. For store state updates use meta dispatcher instead. For component state you could opt for beforeRouteLeave()"
        );

        this.$options.navigatedFrom.call(this, data.object.navigationContext);
      }
    },

    onNavigatedTo(data) {
      this.$router.invokeAfterEach();

      this.$options.nextCallbacks.forEach((callback) => {
        callback.call(this, this, data.object.navigationContext);
      });

      this.$options.nextCallbacks.splice(0);

      if (this.$options.navigatedTo) {
        console.warn(
          "ROUTER",
          'navigatedTo() is deprecated. Use beforeRouteEnter() with "next(vm => ...)" callback instead'
        );

        this.$options.navigatedTo.call(this, data.object.navigationContext);
      }
    },

    isPage() {
      if (this.nativeView.__vuePageRef__) {
        return true;
      }

      return false;
    },
  },
};
