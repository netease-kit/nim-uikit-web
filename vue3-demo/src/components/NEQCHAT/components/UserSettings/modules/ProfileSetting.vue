<template>
  <div class="setting-content-wrap">
    <div class="title">{{ $t("个人资料") }}</div>
    <div class="setting-content">
      <Form
        ref="formRef"
        class="form form--dark"
        :hideRequiredMark="true"
        :model="formState"
        layout="vertical"
        :rules="rules"
      >
        <FormItem>
          <Upload
            accept=".jpg,.png,.jpeg"
            :show-upload-list="false"
            :before-upload="beforeUpload"
          >
            <div class="upload-wrap">
              <Avatar :size="80" :src="formState.avatar" />
              <div class="upload-options">
                <p class="upload-desc">
                  {{ $t("建议建上传使用 512x512 的图像") }}
                </p>
                <div class="upload-btn">{{ $t("上传头像") }}</div>
              </div>
            </div>
          </Upload>
        </FormItem>
        <FormItem :label="$t('昵称')" name="nick">
          <Input
            v-model:value="formState.nick"
            :allowClear="true"
            :placeholder="$t('请输入昵称')"
            :maxlength="30"
          ></Input>
        </FormItem>
        <FormItem :label="$t('账号')" name="account">
          <Input v-model:value="formState.account" :disabled="true"></Input>
        </FormItem>
        <FormItem :label="$t('手机号')" name="tel">
          <Input
            v-model:value="formState.tel"
            :allowClear="true"
            :placeholder="$t('请输入手机号')"
          ></Input>
        </FormItem>
        <FormItem>
          <div class="button-wrap">
            <Button type="primary" @click="onSubmit">{{ $t("保存") }}</Button>
          </div>
          <div class="button-wrap">
            <Button class="setting__button" @click="onReset">
              {{ $t("重置") }}
            </Button>
          </div>
        </FormItem>
      </Form>
    </div>
  </div>
</template>

<script lang="ts">
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import { reactive, ref, toRaw, UnwrapRef, watch } from "vue";
import {
  Button,
  Form,
  Input,
  message,
  Upload,
  Avatar,
  Modal,
} from "ant-design-vue/lib/components";
import { UserNameCard } from "../../../types/v2-compat";
import { getCloudStorageService } from "../../../utils/v2nim";

interface FormState {
  account: string;
  tel: string;
  nick: string;
  avatar: string;
}

const FormItem = Form.Item;

export default {
  name: "ProfileSetting",
  components: {
    Form,
    Input,
    Button,
    FormItem,
    Upload,
    Avatar,
  },
  setup(props: any, context: any) {
    const { t: $t } = useI18n();
    const store = useStore();
    let userProfile = store.state.user.userProfile;
    // 表单元素
    const formState: UnwrapRef<FormState> = reactive({
      nick: userProfile.nick,
      account: userProfile.account,
      tel: userProfile.tel,
      avatar: userProfile.avatar,
    });
    const formRef = ref();
    // 表单校验规则
    const rules = {
      nick: [
        {
          required: true,
          message: $t("请输入昵称"),
          trigger: "blur",
        },
      ],
      phone: [
        {
          required: true,
          message: $t("请输入手机号"),
          trigger: "blur",
        },
      ],
    };

    const onReset = () => {
      formState.nick = userProfile.nick;
      formState.account = userProfile.account;
      formState.tel = userProfile.tel;
      formState.avatar = userProfile.avatar;
    };

    watch(
      () => store.state.user.userProfile,
      (profile: UserNameCard) => {
        userProfile = profile;
        onReset();
      },
    );

    return {
      onSubmit: () => {
        formRef.value.validate().then(async () => {
          try {
            await store.dispatch("user/updateMyNameCard", toRaw(formState));
            message.success($t("修改成功"));

            context.emit("modalClose");
          } catch (err: any) {
            message.error($t("修改失败") + err.message);
          }
        });
      },
      onReset,
      beforeUpload: async (file: File) => {
        if (file.size > 5 * 1024 * 1024) {
          message.info($t("文件大小限制5MB"));
          return;
        }
        let res: { url: string } = { url: "" };
        try {
          if (window.qchat) {
            res = await getCloudStorageService().uploadFile({
              file,
              type: "image",
            });
            if (res.url.indexOf("_im_url=1") > 0) {
              res.url = await getCloudStorageService().getOriginUrl(res.url);
            }
          }
        } catch (e) {
          message.error($t("sdk 上传失败！"));
          return Promise.reject();
        }
        formState.avatar = res.url;
        return Promise.reject();
      },
      formRef,
      formState,
      rules,
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.setting-content-wrap {
  flex: 1;
  height: 100%;
  color: #262626;
  background-color: #ffffff;
  .title {
    padding: 45px 0 16px 30px;
    font-size: 18px;
    border-bottom: 1px solid #e8e8e8;
    line-height: 100%;
    color: #262626;
  }

  .setting-content {
    padding: 30px;
  }

  .button-wrap {
    display: inline-block;
    vertical-align: top;
    margin-right: 16px;
    &:last-child {
      margin-right: 0;
    }
  }

  .upload-wrap {
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  .upload-options {
    flex: 1;
    padding-left: 36px;
  }
  .upload-desc {
    font-size: 14px;
    color: #8c8c8c;
    margin-bottom: 12px;
  }
  .upload-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 88px;
    height: 32px;
    border: 1px solid #1890ff;
    border-radius: 4px;
    color: #1890ff;
    font-size: 14px;
    transition: all 0.3s ease;

    &:hover {
      background-color: #1890ff;
      color: #ffffff;
    }
  }
}
</style>
