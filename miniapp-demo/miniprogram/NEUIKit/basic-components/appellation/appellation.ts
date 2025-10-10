import { autorun } from "../../../libs/store";

Component({
  properties: {
    account: {
      type: String,
      value: '',
      observer: '_updateAppellation'
    },
    teamId: {
      type: String,
      value: undefined,
      observer: '_updateAppellation'
    },
    ignoreAlias: {
      type: Boolean,
      value: false,
      observer: '_updateAppellation'
    },
    nickFromMsg: {
      type: String,
      value: undefined,
      observer: '_updateAppellation'
    }
  },

  data: {
    appellation: '',
    disposer: null as any,
  },

  methods: {
    _updateAppellation() {
      const { account, teamId, ignoreAlias, nickFromMsg } = this.properties;
      const app = getApp();
      
      if (!(app.globalData && app.globalData.store && app.globalData.store.uiStore)) {
        return;
      }

      const appellation = app.globalData.store.uiStore.getAppellation({
        account,
        teamId,
        ignoreAlias,
        nickFromMsg,
      });

      this.setData({ appellation });
    }
  },

  lifetimes: {
    attached() {
      // 初始化appellation
      this._updateAppellation();
      
      const app = getApp();
      
      if (!(app.globalData && app.globalData.store && app.globalData.store.uiStore)) {
        return;
      }

      const disposer = autorun(() => {
        this._updateAppellation();
      });

      this.setData({ disposer });
    },
    detached() {
      const { disposer } = this.data;
      if (disposer) {
        disposer();
      }
      this.setData({ disposer: null });
    }
  }
});