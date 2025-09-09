<template>
  <div class="settings-menu" ref="settingsMenuRef">
    <div class="settings-menu-trigger" @click="toggleMenu">
      <slot></slot>
    </div>
    <Teleport to="body" v-if="visible">
      <Transition name="settings-menu">
        <div
          v-show="visible"
          class="settings-menu-content"
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
    </Teleport>
    <SettingModal
      v-if="settingModalVisible"
      :visible="settingModalVisible"
      @close="settingModalVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, getCurrentInstance } from "vue";
import type { CSSProperties } from "vue";
import Icon from "../../../components/NEUIKit/CommonComponents/Icon.vue";
import { showModal } from "../../../components/NEUIKit/utils/modal";
import { useRouter } from "vue-router";
import { STORAGE_KEY } from "../../../components/NEUIKit/utils/constants";
import { t } from "../../../components/NEUIKit/utils/i18n";
import SettingModal from "./setting-modal.vue";

const router = useRouter();
const { proxy } = getCurrentInstance()!;
const store = proxy?.$UIKitStore;

const visible = ref(false);
const showLanguageSubmenu = ref(false);
const settingsMenuRef = ref<HTMLElement | null>(null);
const position = ref({ x: 0, y: 0 });
const settingModalVisible = ref(false);

// 动态获取当前语言显示文本
const currentLanguage = computed(() => {
  const lang = sessionStorage.getItem("switchToEnglishFlag");
  return lang === "en" ? t("enText") : t("zhText");
});

const contentStyle = computed<CSSProperties>(() => ({
  position: "fixed",
  left: `${position.value.x}px`,
  top: `${position.value.y - 70}px`,
  zIndex: 9999,
}));

const toggleMenu = (event: MouseEvent) => {
  if (visible.value) {
    hideMenu();
  } else {
    showMenu(event);
  }
};

const showMenu = (event: MouseEvent) => {
  const rect = (event.target as HTMLElement).getBoundingClientRect();
  position.value = {
    x: rect.right + 5, // 菜单显示在右侧
    y: rect.top,
  };
  visible.value = true;
  showLanguageSubmenu.value = false;
};

const hideMenu = () => {
  visible.value = false;
  showLanguageSubmenu.value = false;
};

const toggleLanguageSubmenu = () => {
  showLanguageSubmenu.value = !showLanguageSubmenu.value;
};

const switchLanguage = (lang: string) => {
  sessionStorage.setItem("switchToEnglishFlag", lang);
  // 语言变化处理逻辑
  hideMenu();
  window.location.reload();
};

const openSettings = () => {
  // 直接处理设置逻辑
  console.log("Open settings");
  // 这里可以添加打开设置页面或弹窗的逻辑
  hideMenu();
  settingModalVisible.value = true;
};

const logout = () => {
  console.log("Logout");
  // 使用modal显示确认对话框
  showModal({
    title: t("logoutConfirmText"),
    confirmText: t("confirmText") || "确定",
    cancelText: t("cancelText") || "取消",
    width: 400,
    height: 140,
    onConfirm: () => {
      sessionStorage.removeItem(STORAGE_KEY);
      store?.destroy();
      proxy?.$NIM.V2NIMLoginService.logout();
      router.push("/login");
    },
    onCancel: () => {
      console.log("取消退出登录");
    },
  });

  hideMenu();
};

// 点击外部关闭菜单
const handleClickOutside = (event: MouseEvent) => {
  if (
    settingsMenuRef.value &&
    !settingsMenuRef.value.contains(event.target as Node)
  ) {
    hideMenu();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
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
