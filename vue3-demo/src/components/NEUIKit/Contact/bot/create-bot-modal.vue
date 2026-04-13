<template>
  <!-- 创建机器人弹窗：只负责采集表单并发起创建，请求成功后的页面跳转交给父组件 -->
  <Modal
    :visible="visible"
    :title="t('createRobotText')"
    :width="420"
    :height="300"
    :show-default-footer="false"
    @close="handleClose"
  >
    <div class="create-bot-form">
      <!-- 头像选择 -->
      <div class="form-item horizontal">
        <label class="form-label">{{ t("robotAvatarText") }}</label>
        <div class="form-control">
          <div class="avatar-upload-area">
            <!-- 已选择头像时显示预览 -->
            <div
              v-if="formData.avatar"
              class="avatar-preview"
              @click="handleAvatarClick"
            >
              <img :src="formData.avatar" class="avatar-img" alt="avatar" />
            </div>
            <!-- 未选择头像时显示上传按钮 -->
            <button v-else class="upload-btn" @click="handleAvatarClick">
              {{ t("uploadImageText") }}
            </button>
          </div>
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleFileChange"
          />
          <!-- 使用原生文件选择能力，界面入口统一交给上面的按钮/预览区触发 -->
        </div>
      </div>

      <!-- 昵称输入。当前只要求必填，不做额外字符规则限制 -->
      <div class="form-item horizontal">
        <label class="form-label">{{ t("robotNameText") }}</label>
        <div class="form-control">
          <Input
            v-model="formData.name"
            :placeholder="t('robotNamePlaceholder')"
            :maxlength="ROBOT_NAME_MAX_LENGTH"
            @input="handleNameInput"
          />
          <div v-if="nameError" class="error-tip">{{ nameError }}</div>
        </div>
      </div>
    </div>

    <!-- 使用自定义 footer，和项目内其他弹窗的底部操作保持一致 -->
    <template #footer>
      <div class="modal-footer">
        <Button type="default" @click="handleClose">
          {{ t("cancelText") }}
        </Button>
        <Button type="primary" :loading="loading" @click="handleSubmit">
          {{ t("confirmText") }}
        </Button>
      </div>
    </template>
  </Modal>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import Modal from "../../CommonComponents/Modal.vue";
import Input from "../../CommonComponents/Input.vue";
import Button from "../../CommonComponents/Button.vue";
import { t } from "../../utils/i18n";
import { nim, store } from "../../utils/init";
import { showToast, toast } from "../../utils/toast";
import type { V2NIMUserAIBot } from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMAIService";

interface Props {
  visible: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  // 成功后把最小可用机器人信息抛给父组件，便于立即更新列表或打开名片
  success: [bot: V2NIMUserAIBot];
}>();
const ROBOT_NAME_MAX_LENGTH = 15;

// 表单数据。avatar 在选择文件后先存预览值，提交前再替换成远端 URL
const formData = ref({
  name: "",
  avatar: "",
});

// 错误提示
const nameError = ref("");
const loading = ref(false);
const uploadingAvatar = ref(false);
// 隐藏的文件 input，通过 click() 主动唤起系统文件选择器
const fileInputRef = ref<HTMLInputElement>();
// 头像预览走本地 base64，真正提交时仍以上传后的 URL 为准
const selectedFile = ref<File | null>(null);

// 关闭或创建完成后统一清理本地表单态，避免下次打开沿用上次输入
const resetForm = () => {
  formData.value = {
    name: "",
    avatar: "",
  };
  nameError.value = "";
  selectedFile.value = null;
};

// 用户继续输入时，立即移除上一次校验错误
const handleNameInput = () => {
  nameError.value = "";
};

// 统一从这里打开系统文件选择器，避免模板里散落 click 逻辑
const handleAvatarClick = () => {
  fileInputRef.value?.click();
};

// 文件选择后先做前端校验，再生成本地预览，提升表单反馈速度
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      showToast(t("selectImageText"));
      return;
    }

    // 保存文件对象,用于后续上传
    selectedFile.value = file;

    // 先回填本地预览，避免等上传完成后用户才看到头像变化
    const reader = new FileReader();
    reader.onload = (e) => {
      formData.value.avatar = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

// 创建接口需要的是可访问的头像 URL，而不是本地 File 对象
const uploadAvatar = async (fileObj: File): Promise<string> => {
  try {
    uploadingAvatar.value = true;
    const task = nim?.V2NIMStorageService?.createUploadFileTask({
      fileObj,
    });
    const avatarUrl = await nim?.V2NIMStorageService?.uploadFile(task, () => {
      // 上传进度回调
    });
    return avatarUrl || "";
  } catch (error) {
    console.error("上传头像失败:", error);
    throw error;
  } finally {
    uploadingAvatar.value = false;
  }
};

// 当前表单校验只包含昵称必填，后续扩展时可继续收敛到这里
const validateForm = () => {
  let isValid = true;
  const trimmedName = formData.value.name.trim();

  // 验证昵称
  if (!trimmedName) {
    nameError.value = t("robotNameRequiredText");
    isValid = false;
  }

  return isValid;
};

// 提交入口统一串起: 校验 -> 上传头像 -> 创建机器人 -> 通知父组件
const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  loading.value = true;

  try {
    let avatarUrl = formData.value.avatar;

    // 页面里看到的可能是本地 base64，真正提交前要替换成上传后的远端地址
    // 如果用户重新选择了头像，这里先上传文件，再把 CDN URL 传给创建接口
    if (selectedFile.value) {
      avatarUrl = await uploadAvatar(selectedFile.value);
    }

    // 账号规则: Bot_ + UUID(去掉连字符后截断), 总长度不超过 32
    // 这里在前端生成一个临时唯一 accid，避免用户手填并减少命名冲突
    const randomAccid = `Bot_${crypto.randomUUID().replace(/-/g, "").slice(0, 28)}`;
    await store.aiUserStore?.createUserAIBotActive({
      accid: randomAccid,
      name: formData.value.name.trim(),
      icon: avatarUrl,
    });
    toast.success(t("createRobotSuccessText"));

    // 回传新机器人的基础信息，列表页可直接打开该机器人的名片
    emit("success", {
      accid: randomAccid,
      name: formData.value.name.trim(),
      icon: avatarUrl,
    });
  } catch (error) {
    console.error("操作失败:", error);
    toast.error(t("createRobotFailedText"));
  } finally {
    // 无论成功失败都结束提交态，避免按钮一直处于 loading
    loading.value = false;
  }
};

// 关闭时先重置本地状态，再通知父组件收起弹窗
const handleClose = () => {
  resetForm();
  emit("close");
};
</script>

<style scoped>
.create-bot-form {
  padding: 10px 0;
  height: 170px;
  box-sizing: border-box;
}

.form-item {
  margin-bottom: 10px;
  height: 60px;
  box-sizing: border-box;
}

.form-item.horizontal {
  display: flex;
  align-items: center;
  gap: 16px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  min-width: 80px;
}

.form-control {
  flex: 1;
}

.avatar-upload-area {
  display: flex;
  align-items: center;
}

.avatar-preview {
  cursor: pointer;
  transition: all 0.2s ease;
}

.avatar-preview:hover {
  opacity: 0.8;
}

.avatar-img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.upload-btn {
  padding: 6px 16px;
  font-size: 14px;
  line-height: 1.2;
  color: #333;
  background-color: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.upload-btn:hover {
  color: #537ff4;
  border-color: #537ff4;
  background-color: #f8f9ff;
}

.error-tip {
  margin-top: 4px;
  font-size: 12px;
  color: #ff4d4f;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e9eff5;
}
</style>
