/* eslint-disable */
<template>
  <div class="title">
    {{ $t("服务器概括") }}
  </div>
  <div class="server-info">
    <div class="server-icon">
      <img :src="formState.icon" class="icon" v-if="formState.icon" />
      <CommonAvatar
        v-if="!formState.icon"
        :nick="formState.name"
        :width="81"
        :border="0"
        style="margin-right: 20px"
      ></CommonAvatar>
      <div class="info">
        <p>{{ $t("建议建上传使用 512x512 的图像") }}</p>
        <Upload :show-upload-list="false" :before-upload="beforeUpload">
          <Button v-if="ifCanEdit" type="primary">{{ $t("上传图像") }}</Button>
          <Button v-if="!ifCanEdit" disabled>{{ $t("上传图像") }}</Button>
        </Upload>
      </div>
    </div>
    <Form
      ref="formRef"
      class="form form--dark"
      :hideRequiredMark="true"
      :model="formState"
      layout="vertical"
      :rules="rules"
    >
      <FormItem :label="$t('服务器名称')" name="name">
        <Input
          v-if="ifCanEdit"
          v-model:value="formState.name"
          :placeholder="$t('请输入服务器名称')"
          :maxlength="50"
        ></Input>
        <Input
          v-if="!ifCanEdit"
          v-model:value="formState.name"
          :placeholder="$t('请输入服务器名称')"
          :maxlength="50"
          disabled
        ></Input>
      </FormItem>
      <FormItem :label="$t('服务器 ID')" name="serverId">
        <Input
          disabled
          v-model:value="formState.serverId"
          :placeholder="$t('服务器 ID')"
        ></Input>
      </FormItem>
      <FormItem :label="$t('服务器主题')" name="ext">
        <Textarea
          v-if="ifCanEdit"
          :rows="6"
          :maxlength="64"
          v-model:value="formState.ext"
          :placeholder="$t('请输入服务器主题')"
        ></Textarea>
        <Textarea
          v-if="!ifCanEdit"
          disabled
          :rows="6"
          :maxlength="64"
          v-model:value="formState.ext"
          :placeholder="$t('请输入服务器主题')"
        ></Textarea>
      </FormItem>
      <FormItem>
        <div class="button-wrap">
          <Button v-if="ifCanEdit" type="primary" @click="onSubmit">{{
            $t("保存")
          }}</Button>
          <Button v-if="!ifCanEdit" disabled type="primary" @click="onSubmit">{{
            $t("保存")
          }}</Button>
        </div>
        <div class="button-wrap">
          <Button v-if="ifCanEdit" class="setting__button" @click="onReset">{{
            $t("重置")
          }}</Button>
          <Button
            v-if="!ifCanEdit"
            disabled
            class="setting__button"
            @click="onReset"
            >{{ $t("重置") }}</Button
          >
        </div>
      </FormItem>
    </Form>
  </div>
</template>

<script lang="ts">
import { Form, Input, Button, Upload, message, Modal } from "ant-design-vue";
import { useStore } from "vuex";
import { watch, reactive, ref, toRaw, UnwrapRef, computed } from "vue";
import { useI18n } from "vue-i18n";
import CommonAvatar from "../../CommonAvatar.vue";
import { getCloudStorageService } from "../../../utils/v2nim";

const FormItem = Form.Item;
const Textarea = Input.TextArea;

interface FormState {
  icon: string;
  serverId: string;
  name: string;
  ext: string;
}

export default {
  name: "ServerInfo",
  components: {
    Form,
    Input,
    Button,
    FormItem,
    Textarea,
    Upload,
    CommonAvatar,
  },
  props: {
    canEdit: {
      type: Boolean,
      default: false,
    },
  },

  setup(props, context) {
    const ifCanEdit = computed(() => {
      return props.canEdit;
    });
    const { t: $t } = useI18n();
    const store = useStore();
    let curServer = store.state.server.curServer;
    // 表单元素
    const formState: UnwrapRef<FormState> = reactive({
      icon: curServer.icon,
      serverId: curServer.serverId,
      name: curServer.name,
      ext: curServer.ext,
    });
    const onReset = () => {
      formState.serverId = curServer.serverId;
      formState.name = curServer.name;
      formState.ext = curServer.ext;
      formState.icon = curServer.icon;
    };
    watch(
      () => store.state.server.curServer,
      (currServer) => {
        curServer = currServer;
        onReset();
      },
    );
    const formRef = ref();

    const beforeUpload = async (file: File) => {
      let res: { url: string } = { url: "" };
      const isJpgOrPng =
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/jpg";
      if (!isJpgOrPng) {
        message.error($t("请选择图片格式文件"));
        return Promise.reject();
      }
      const isOverSize = file.size / 1024 / 1024 < 5;
      if (!isOverSize) {
        message.error($t("请选择小于5MB的文件"));
        return Promise.reject();
      }
      try {
        console.log("开始上传图片...");
        res = await getCloudStorageService().uploadFile({
          file,
          type: "image",
        });
        console.log("图片上传成功，URL:", res.url);
        if (res.url.indexOf("_im_url=1") > 0) {
          res.url = await getCloudStorageService().getOriginUrl(res.url);
          console.log("获取原始URL:", res.url);
        }
      } catch (e) {
        console.error("图片上传失败:", e);
        message.error($t("sdk 上传失败！"));
        return Promise.reject();
      }
      formState.icon = res.url;
      console.log("头像已更新到表单，请点击保存按钮");
      message.success($t("图片上传成功，请点击保存按钮"));
      return Promise.reject();
    };

    // 表单校验规则
    const rules = {
      name: [
        {
          required: true,
          message: $t("请输入服务器名称"),
          trigger: "blur",
        },
      ],
    };
    return {
      // 表单相关
      onSubmit: () => {
        formRef.value.validate().then(() => {
          store
            .dispatch("server/updateServer", toRaw(formState))
            .then(() => {
              message.success("保存成功");
            })
            .catch((error) => {
              message.error("保存失败: " + (error.message || "操作失败"));
            });
        });
      },
      onReset,
      formRef,
      beforeUpload,
      formState,
      rules,
      curServer,
      ifCanEdit,
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.title {
  height: 80px;
  padding: 40px 0 0 30px;
  text-align: left;
  font-size: 18px;
  border-bottom: 1px solid #202126;
}
.server-info {
  padding: 30px;
  .server-icon {
    display: flex;
    margin-bottom: 30px;
    .icon {
      width: 81px;
      height: 81px;
      border-radius: 50%;
      margin-right: 20px;
    }
    .info {
      p {
        color: #a3a4a9;
      }
    }
  }
}
.create-form {
  .bottom-button {
    margin: 0 -24px;
    padding: 16px 20px 0;
    border-top: 1px solid #474a52;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
  .tip {
    margin-bottom: 8px;
    font-size: 12px;
    color: #6e6f74;
  }
}
.button-wrap {
  display: inline-block;
  vertical-align: top;
  margin-right: 16px;
  &:last-child {
    margin-right: 0;
  }
}
</style>
