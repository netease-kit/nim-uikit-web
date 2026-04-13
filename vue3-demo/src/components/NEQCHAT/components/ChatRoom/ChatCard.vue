<template>
  <div class="chatCardWrapper">
    <div class="chatCardAvatar">
      <CommonAvatar
        :avatar="myAvatar"
        :nick="msg.fromNick"
        :accid="msg.fromAccount"
        :width="32"
        :border="0"
      />
    </div>
    <div class="chatCardContent">
      <div>
        <div class="chatCardInfo">
          <span style="margin-right: 10px">{{ msg.fromNick }}</span>
          <span>{{ time }}</span>
        </div>
        <div v-if="msg.type === 'text'">
          <div
            v-if="msg.fromAccount === myAccid"
            class="textMsg myMsg"
            v-html="textMsgBody"
          />
          <div v-else class="textMsg otherMsg" v-html="textMsgBody" />
        </div>
        <div v-else-if="msg.type === 'file'">
          <a class="fileMsg" target="_blank" :href="msg.attach.url">
            <IconFont
              type="icon-PDF"
              style="font-size: 40px"
              v-if="ext === 'pdf'"
            />
            <IconFont
              type="icon-Word"
              style="font-size: 40px"
              v-else-if="ext === 'word'"
            />
            <IconFont
              type="icon-Excel"
              style="font-size: 40px"
              v-else-if="ext === 'excel'"
            />
            <IconFont
              type="icon-PPT"
              style="font-size: 40px"
              v-else-if="ext === 'ppt'"
            />
            <IconFont
              type="icon-RAR1"
              style="font-size: 40px"
              v-else-if="ext === 'zip'"
            />
            <IconFont
              type="icon-shipin"
              style="font-size: 40px"
              v-else-if="ext === 'video'"
            />
            <IconFont
              type="icon-yinle"
              style="font-size: 40px"
              v-else-if="ext === 'audio'"
            />
            <IconFont
              type="icon-tupian2"
              style="font-size: 40px"
              v-else-if="ext === 'img'"
            />
            <IconFont
              type="icon-qita"
              style="font-size: 40px"
              v-else-if="ext === 'txt'"
            />
            <IconFont
              type="icon-weizhiwenjian"
              style="font-size: 40px"
              v-else
            />
            <div class="fileMsgContent">
              <div class="fileMsgName">{{ msg.attach.name }}</div>
              <div class="fileMsgSize">{{ size }}</div>
            </div>
          </a>
        </div>
        <div v-else-if="msg.type === 'image'">
          <Image class="imgMsg" :src="msg.attach.url" />
        </div>
        <div v-else>
          <div v-if="msg.fromAccount === myAccid" class="textMsg myMsg">
            {{ $t("暂不支持该消息") }}
          </div>
          <div v-else class="textMsg otherMsg">{{ $t("暂不支持该消息") }}</div>
        </div>
      </div>
      <div class="chatCardStatus">
        <Button
          v-if="msg.deliveryStatus === 'failed'"
          type="text"
          danger
          @click="resendHandler"
        >
          <template #icon>
            <ExclamationCircleFilled />
          </template>
        </Button>
        <LoadingOutlined v-else-if="msg.deliveryStatus === 'sending'" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { QChatMessage } from "../../types/v2-compat";
import { Image, Button } from "ant-design-vue";
import {
  ExclamationCircleFilled,
  LoadingOutlined,
} from "@ant-design/icons-vue";
import { emptyFunc, parseFileSize, matchExt } from "../../utils/index";
import { computed } from "vue";
import CommonAvatar from "../CommonAvatar.vue";
import moment from "moment";
import IconFont from "../IconFont";
import { useStore } from "vuex";

export default {
  name: "ChatCard",
  components: {
    Image,
    Button,
    ExclamationCircleFilled,
    LoadingOutlined,
    CommonAvatar,
    IconFont,
  },
  props: {
    msg: {
      type: Object,
      default: {} as QChatMessage,
    },
    myAccid: {
      type: String,
      default: "",
    },
    onResendText: {
      type: Function,
      default: emptyFunc,
    },
    onResendImg: {
      type: Function,
      default: emptyFunc,
    },
    onResendFile: {
      type: Function,
      default: emptyFunc,
    },
  },
  setup(props: any) {
    const store = useStore();
    return {
      myAvatar: computed(() => {
        if (
          store.state.server.serverMembers &&
          store.state.server.serverMembers.datas &&
          store.state.server.serverMembers.datas.length > 0
        ) {
          return store.state.server.serverMembers.datas.filter(
            (item) => item.accid === props.msg.fromAccount,
          )[0]?.avatar;
        }
        return null;
      }),
      time: computed(() => {
        const _d = moment(props.msg.time);
        const isCurrentDay = _d.isSame(moment(), "day");
        const isCurrentYear = _d.isSame(moment(), "year");
        return _d.format(
          isCurrentDay
            ? "HH:mm:ss"
            : isCurrentYear
              ? "MM-DD HH:mm:ss"
              : "YYYY-MM-DD HH:mm:ss",
        );
      }),
      size: computed(() => parseFileSize(props.msg.attach.size)),
      ext: computed(() => matchExt(props.msg.attach.ext)),
      textMsgBody: computed(() =>
        props.msg.body.replace(
          // eslint-disable-next-line no-useless-escape
          /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi,
          '<a style="color:#fff;text-decoration:underline;" href="$1" target="_blank">$1</a>',
        ),
      ),
      resendHandler: () => {
        switch (props.msg.type) {
          case "text":
            props.onResendText(props.msg);
            break;
          case "image":
            props.onResendImg(props.msg);
            break;
          case "file":
            props.onResendFile(props.msg);
            break;
          default:
            break;
        }
      },
    };
  },
};
</script>

<style scoped lang="less">
.chatCardWrapper {
  width: 100%;
  display: flex;
  align-items: flex-start;
  &:not(:first-child) {
    margin-top: 10px;
  }

  .chatCardContent {
    flex: 1;
    margin-left: 12px;
    display: flex;
    align-items: center;
  }

  .chatCardInfo {
    font-size: 12px;
    color: #8c8c8c;
    text-align: left;
    margin-bottom: 3px;
  }

  .chatCardStatus {
    margin-left: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: auto;
    min-height: 1em;
  }

  .textMsg {
    font-size: 14px;
    padding: 12px 16px;
    word-break: break-all;
    white-space: pre-wrap;
    text-align: left;
    border-radius: 0 10px 10px 10px;
    max-width: 100%;
    width: fit-content;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    &.myMsg {
      background-color: #1890ff;
      color: #ffffff;
    }

    &.otherMsg {
      background-color: #f5f5f5;
      color: #262626;
      border: 1px solid #e8e8e8;
    }
  }

  .fileMsg {
    width: fit-content;
    background-color: #f5f5f5;
    border: 1px solid #e8e8e8;
    display: flex;
    align-items: center;
    padding: 10px 20px;
    border-radius: 0 10px 10px 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    .fileMsgContent {
      min-width: 175px;
      margin-left: 20px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: space-between;
    }
    .fileMsgName {
      color: #262626;
    }
    .fileMsgSize {
      color: #8c8c8c;
    }
  }
}
</style>
../IconFont.js
