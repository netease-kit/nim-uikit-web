<template>
  <ChatContent
    v-if="hasCurrentChannel"
    :msgs="msgs"
    :channelName="channelName"
    :myAccid="myAccid"
    :myAvatar="myAvatar"
    :topic="topic"
    :isNoMore="isNoMore"
    :imgUploading="imgUploading"
    :fileUploading="fileUploading"
    :onSendText="onSendText"
    :onSendFile="onSendFile"
    :onSendImg="onSendImg"
    :onResendText="onResendText"
    :onResendImg="onResendImg"
    :onResendFile="onResendFile"
    :onLoadMore="onLoadMore"
    :sendDisabled="sendDisabled"
  />
  <div v-else>当前服务器下没有频道~</div>
</template>

<script lang="ts">
import ChatContent from "./ChatContent.vue";
import { useStore } from "vuex";
import { watch, ref, computed } from "vue";
import { QChatMessage } from "../../types/v2-compat";
import { getV2NIMInstance } from "../../utils/v2nim";

const HISTORY_LIMIT = 100;

export default {
  components: {
    ChatContent,
  },

  setup() {
    const store = useStore();

    const imgUploading = ref<boolean>(false);
    const fileUploading = ref<boolean>(false);
    const isNoMore = ref<boolean>(false);
    const hasCurrentChannel = ref<boolean>(false);
    const sendDisabled = ref<boolean>(false);

    watch(
      () => store.state.channel.currentChannel,
      async (currentChannel) => {
        sendDisabled.value = false;
        // 重置 isNoMore 状态，因为切换频道后需要重新判断
        isNoMore.value = false;

        if (currentChannel) {
          hasCurrentChannel.value = true;
          const msgs = await store.dispatch("channel/getChannelHistoryMsgs", {
            limit: HISTORY_LIMIT,
          });
          store.commit("channel/setCurChannelMsgs", msgs);

          // 如果初始加载的消息数量小于限制，说明没有更多消息了
          if (msgs.length < HISTORY_LIMIT) {
            isNoMore.value = true;
          }
        } else {
          hasCurrentChannel.value = false;
        }
      },
    );

    const sendMessage = (type: string, file, mentionAccids?: string[]) => {
      if (type === "textMsg") {
        store.dispatch("channel/sendTextMsg", { body: file, mentionAccids });
        return;
      }
      if (type === "SendImg") {
        store.dispatch("channel/sendImageMsg", {
          file,
          onUploadStart: () => {
            imgUploading.value = true;
          },
          onUploadDone: () => {
            imgUploading.value = false;
          },
        });
        return;
      }
      if (type === "SendFile") {
        store.dispatch("channel/sendFileMsg", {
          file,
          onUploadStart: () => {
            fileUploading.value = true;
          },
          onUploadDone: () => {
            fileUploading.value = false;
          },
        });
        return;
      }
    };

    const checkSendAuth = (type: string, file, mentionAccids?: string[]) => {
      sendDisabled.value = false;
      if (
        store.state.server.curServer.owner ===
        store.state.user.userProfile.account
      ) {
        sendDisabled.value = false;
        sendMessage(type, file, mentionAccids);
      } else {
        store
          .dispatch("server/checkPermissionMessage", {
            serverId: store.state.server.curServer.serverId,
            channelId: store.state.channel.currentChannel.channelId,
            auth: "sendMsg",
          })
          .then((resp) => {
            if (resp) {
              sendDisabled.value = false;
              sendMessage(type, file, mentionAccids);
            }
          });
      }
    };
    return {
      sendDisabled,
      checkSendAuth,
      msgs: computed(() => store.state.channel.currentChannelMsgs),
      channelName: computed(() => store.state.channel.currentChannel?.name),
      topic: computed(() => store.state.channel.currentChannel?.topic),
      isNoMore,
      myAccid: computed(() => {
        try {
          const nim = getV2NIMInstance();
          return nim?.loginService?.getLoginUser()?.accountId;
        } catch (e) {
          return "";
        }
      }),
      myAvatar: computed(() => store.state.user.userProfile?.avatar),
      imgUploading,
      fileUploading,
      hasCurrentChannel,
      onSendText: (text: string, mentionAccids?: string[]) => {
        checkSendAuth("textMsg", text, mentionAccids);
      },
      onSendImg: (file: File) => {
        checkSendAuth("SendImg", file);
      },
      onSendFile: (file: File) => {
        checkSendAuth("SendFile", file);
      },
      onResendText: (res: QChatMessage) => {
        store.dispatch("channel/resendTextMsg", res);
      },
      onResendImg: (res: QChatMessage) => {
        store.dispatch("channel/resendImageMsg", res);
      },
      onResendFile: (res: QChatMessage) => {
        store.dispatch("channel/resendFileMsg", res);
      },
      onLoadMore: async (lastTime: number) => {
        const msgs = await store.dispatch("channel/loadMoreHistoryMsgs", {
          lastTime,
          limit: HISTORY_LIMIT,
        });
        if (msgs.length < HISTORY_LIMIT) {
          isNoMore.value = true;
        }
      },
    };
  },
};
</script>

<style scoped lang="less"></style>
