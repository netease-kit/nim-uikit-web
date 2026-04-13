<template>
  <div class="setting-content-wrap">
    <div class="title">{{ $t("频道概况") }}</div>
    <div class="setting-content">
      <Form
        ref="formRef"
        class="form form--light"
        :hideRequiredMark="true"
        :model="formState"
        layout="vertical"
        :rules="rules"
      >
        <FormItem :label="$t('频道名称')" name="name">
          <Input
            v-if="ifCanEdit"
            v-model:value="formState.name"
            :placeholder="$t('请输入频道名称')"
            class="channel-name"
            :allowClear="true"
            :maxlength="50"
          ></Input>
          <Input
            v-if="!ifCanEdit"
            disabled
            class="channel-name-disabled"
            :style="{ backgroundColor: '#f5f5f5' }"
            v-model:value="formState.name"
            :placeholder="$t('请输入频道名称')"
            :allowClear="true"
            :maxlength="50"
          ></Input>
        </FormItem>
        <FormItem :label="$t('频道主题')" name="topic">
          <Textarea
            :rows="3"
            v-if="ifCanEdit"
            v-model:value="formState.topic"
            :placeholder="$t('请输入频道主题')"
            :allowClear="true"
            :maxlength="64"
          ></Textarea>
          <Textarea
            :rows="3"
            v-if="!ifCanEdit"
            disabled
            v-model:value="formState.topic"
            :placeholder="$t('请输入频道主题')"
            :allowClear="true"
            :maxlength="64"
          ></Textarea>
        </FormItem>
        <FormItem>
          <div class="button-wrap">
            <Button v-if="ifCanEdit" type="primary" @click="onSubmit">{{
              $t("保存")
            }}</Button>
            <Button v-if="!ifCanEdit" disabled>{{ $t("保存") }}</Button>
          </div>
          <div class="button-wrap">
            <Button v-if="ifCanEdit" class="setting__button" @click="onReset">
              {{ $t("重置") }}
            </Button>
            <Button v-if="!ifCanEdit" class="setting__button" disabled>
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
import { computed, reactive, ref, toRaw, UnwrapRef, watch } from "vue";
import {
  Button,
  Form,
  Input,
  message,
  Modal,
} from "ant-design-vue/lib/components";
import { ChannelInfo } from "../../../types/v2-compat";

interface FormState {
  channelId: string;
  serverId: string;
  name: string;
  type: string;
  topic: string;
  ext?: string;
}

const FormItem = Form.Item;
const Textarea = Input.TextArea;

export default {
  name: "GeneralSituation",
  components: {
    Form,
    Input,
    Button,
    FormItem,
    Textarea,
  },
  props: {
    canEdit: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const { t: $t } = useI18n();
    const store = useStore();
    const ifCanEdit = computed(() => {
      return props.canEdit;
    });
    let currentChannel = store.state.channel.currentChannel;
    // 表单元素
    const formState: UnwrapRef<FormState> = reactive({
      serverId: currentChannel.serverId,
      channelId: currentChannel.channelId,
      name: currentChannel.name,
      topic: currentChannel.topic,
      type: currentChannel.type,
      ext: currentChannel.ext,
    });
    const formRef = ref();
    // 表单校验规则
    const rules = {
      name: [
        {
          required: true,
          message: $t("请输入频道名称"),
          trigger: "blur",
        },
      ],
      // topic: [
      //   {
      //     required: true,
      //     message: $t("请输入频道主题"),
      //     trigger: "blur",
      //   },
      // ],
    };

    const onReset = () => {
      formState.serverId = currentChannel.serverId;
      formState.channelId = currentChannel.channelId;
      formState.name = currentChannel.name;
      formState.topic = currentChannel.topic;
      formState.type = currentChannel.type;
      formState.ext = currentChannel.ext;
    };

    watch(
      () => store.state.channel.currentChannel,
      (currChannel: ChannelInfo) => {
        currentChannel = currChannel;
        onReset();
      },
    );

    return {
      onSubmit: () => {
        formRef.value
          .validate()
          .then(async () => {
            try {
              // 只传递可以修改的字段，不包括 type（频道类型在创建时确定，不可修改）
              const updateParams = {
                serverId: formState.serverId,
                channelId: formState.channelId,
                name: formState.name,
                topic: formState.topic,
                custom: formState.ext, // SDK 使用 custom 字段，不是 ext
              };
              await store.dispatch("channel/updateChannel", updateParams);
              // 使用 message 显示成功消息
              message.success($t("保存成功"));
            } catch (err: any) {
              console.error("更新频道失败:", err);
              // 使用 message 显示错误
              message.error(
                $t("保存失败") + ": " + (err.message || $t("无权限操作")),
              );
              return;
            }
          })
          .catch((err: any) => {
            console.error("表单验证失败:", err);
            message.error($t("请检查输入内容"));
          });
      },
      onReset,
      formRef,
      formState,
      rules,
      ifCanEdit,
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.setting-content-wrap {
  flex: 1;
  height: 650px;
  color: #262626;
  .title {
    padding: 45px 0 16px 30px;
    font-size: 22px;
    border-bottom: 1px solid #f0f0f0;
    line-height: 100%;
  }

  .setting-content {
    padding: 20px 30px;
    height: calc(100% - 80px);
    overflow-y: auto;
  }

  .button-wrap {
    display: inline-block;
    vertical-align: top;
    margin-right: 16px;
    &:last-child {
      margin-right: 0;
    }
  }
}

.channel-name-disabled :deep(.ant-input[disabled]) {
  border: none !important;
}

.channel-name :deep(.ant-input) {
  border: none !important;
}
</style>
