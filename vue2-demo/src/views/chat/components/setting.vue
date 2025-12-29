<template>
  <div class="settings-menu" ref="settingsMenuRef">
    <div class="settings-menu-trigger" @click.stop="toggleMenu($event)">
      <slot></slot>
    </div>
    <Transition name="settings-menu">
      <div
        v-if="visible"
        class="settings-menu-content"
        ref="settingsMenuContent"
        :style="contentStyle"
        @click.stop
      >
        <div
          class="settings-menu-item language-item"
          @click="toggleLanguageSubmenu"
        >
          <Icon type="icon-zhongyingwen" :size="16" />
          <span class="menu-text">{{ currentLanguage }}</span>
          <Icon type="icon-jiantou" :size="12" class="arrow-icon" />
          <div class="language-submenu" v-if="showLanguageSubmenu">
            <div
              class="language-option"
              :class="{ active: currentLanguage === t('zhText') }"
              @click="switchLanguage('zh')"
            >
              {{ t("zhText") }}
            </div>
            <div
              class="language-option"
              :class="{ active: currentLanguage === t('enText') }"
              @click="switchLanguage('en')"
            >
              {{ t("enText") }}
            </div>
          </div>
        </div>
        <div class="settings-menu-item" @click="openSettings">
          <Icon
            type="icon-setting"
            :iconStyle="{ position: 'relative', right: '2px' }"
            :size="18"
          />
          <span class="menu-text">{{ t("settingText") }}</span>
        </div>
        <div class="settings-menu-item" @click="logout">
          <Icon type="icon-tuichudenglu" :size="16" />
          <span class="menu-text">{{ t("logoutText") }}</span>
        </div>
      </div>
    </Transition>
    <SettingModal
      v-if="settingModalVisible"
      :visible="settingModalVisible"
      @close="settingModalVisible = false"
    />
  </div>
</template>

<script>
import Icon from "../../../components/NEUIKit/CommonComponents/Icon.vue";
import { showModal } from "../../../components/NEUIKit/utils/modal";
import { STORAGE_KEY } from "../../../components/NEUIKit/utils/constants";
import { t } from "../../../components/NEUIKit/utils/i18n";
import SettingModal from "./setting-modal.vue";
import { uiKitStore } from "../../../components/NEUIKit/utils/init";
import { nim } from "../../../components/NEUIKit/utils/init";

export default {
  name: "NEUIKitSettingsMenu",
  components: { Icon, SettingModal },
  data() {
    return {
      visible: false,
      showLanguageSubmenu: false,
      position: { x: 0, y: 0 },
      settingModalVisible: false,
      transformOrigin: "top left",
    };
  },
  computed: {
    currentLanguage() {
      const lang = sessionStorage.getItem("switchToEnglishFlag");
      return lang === "en" ? t("enText") : t("zhText");
    },
    contentStyle() {
      return {
        position: "fixed",
        left: `${this.position.x}px`,
        top: `${this.position.y + 8}px`,
        zIndex: 100000,
        transformOrigin: this.transformOrigin,
      };
    },
    store() {
      return uiKitStore;
    },
  },
  methods: {
    t,
    toggleMenu(event) {
      if (this.visible) {
        this.hideMenu();
      } else {
        this.showMenu(event);
      }
    },
    showMenu(event) {
      const el =
        event && event.target && event.target.closest
          ? event.target.closest(".settings-menu-trigger")
          : this.$refs.settingsMenuRef;
      const rect = el.getBoundingClientRect();
      this.visible = true;
      this.showLanguageSubmenu = false;
      this.$nextTick(() => {
        const content = this.$refs.settingsMenuContent;
        const menuW = content ? content.offsetWidth : 160;
        const menuH = content ? content.offsetHeight : 160;
        const viewportW =
          window.innerWidth || document.documentElement.clientWidth;
        const viewportH =
          window.innerHeight || document.documentElement.clientHeight;

        // 默认在触发器右侧居中显示
        let x = rect.right + 8;
        let y = rect.top + (rect.height - menuH) / 2;
        let origin = "center left";

        // 右侧溢出时放到左侧
        if (x + menuW > viewportW) {
          x = rect.left - menuW - 8;
          origin = "center right";
        }

        // 顶/底部溢出时修正
        if (y + menuH > viewportH) {
          y = viewportH - menuH - 8;
        }
        if (y < 8) y = 8;

        this.position = { x, y };
        this.transformOrigin = origin;
      });
    },
    hideMenu() {
      this.visible = false;
      this.showLanguageSubmenu = false;
    },
    toggleLanguageSubmenu() {
      this.showLanguageSubmenu = !this.showLanguageSubmenu;
    },
    switchLanguage(lang) {
      sessionStorage.setItem("switchToEnglishFlag", lang);
      this.hideMenu();
      window.location.reload();
    },
    openSettings() {
      this.hideMenu();
      this.settingModalVisible = true;
    },
    logout() {
      showModal({
        title: t("logoutConfirmText"),
        confirmText: t("confirmText") || "确定",
        cancelText: t("cancelText") || "取消",
        width: 400,
        height: 140,
        onConfirm: () => {
          sessionStorage.removeItem(STORAGE_KEY);
          if (this.store && this.store.destroy) this.store.destroy();
          if (nim.V2NIMLoginService) {
            nim.V2NIMLoginService.logout();
          }
          if (this.$route.path !== "/login") {
            this.$router.push("/login");
          }
        },
        onCancel: () => {},
      });
      this.hideMenu();
    },
    handleClickOutside(event) {
      const el = this.$refs.settingsMenuRef;
      if (el && !el.contains(event.target)) {
        this.hideMenu();
      }
    },
  },
  watch: {
    visible(val) {
      this.$nextTick(() => {
        const content = this.$refs.settingsMenuContent;
        if (val && content) {
          document.body.appendChild(content);
        } else if (!val && content && content.parentNode === document.body) {
          document.body.removeChild(content);
        }
      });
    },
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeDestroy() {
    document.removeEventListener("click", this.handleClickOutside);
    const content = this.$refs.settingsMenuContent;
    if (content && content.parentNode === document.body) {
      document.body.removeChild(content);
    }
  },
};
</script>

<style scoped>
.settings-menu {
  position: absolute;
  bottom: 10px;
  /* 直接应用setting-menu-icon的定位样式 */
}

.settings-menu-trigger {
  font-size: 22px;
  color: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  /* 应用setting-menu-icon的样式 */
}

.settings-menu-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 140px;
  border: 1px solid #e8e8e8;
  left: auto;
  right: auto;
}

.settings-menu-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.settings-menu-item:hover {
  background-color: #f5f5f5;
}

.menu-text {
  margin-left: 8px;
  font-size: 14px;
  color: #333;
  flex: 1;
}

.language-item {
  position: relative;
}

.language-item:hover .language-submenu {
  display: block;
}

.arrow-icon {
  margin-left: auto;
  color: #999;
}

.language-submenu {
  display: none;
  position: absolute;
  left: 100%;
  top: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  min-width: 80px;
  border: 1px solid #e8e8e8;
  z-index: 10000;
}

.language-option {
  padding: 6px 12px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background-color 0.2s;
}

.language-option:hover {
  background-color: #f5f5f5;
}

.language-option.active {
  color: #1890ff;
  background-color: #e6f7ff;
}

/* 动画效果 */
.settings-menu-enter-active,
.settings-menu-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.settings-menu-enter-from,
.settings-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
