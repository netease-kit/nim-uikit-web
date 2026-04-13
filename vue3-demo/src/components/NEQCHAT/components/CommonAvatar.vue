<template>
  <div class="common-avatar-container">
    <img
      alt=""
      v-if="avatar || matchedMember?.avatar"
      class="image"
      :src="avatar"
      :style="
        'width:' +
        widthAndHeight +
        'height:' +
        widthAndHeight +
        'border:' +
        borderStyle
      "
    />
    <div
      v-if="!avatar && !matchedMember?.avatar"
      class="text"
      :style="
        'width:' +
        widthAndHeight +
        'height:' +
        widthAndHeight +
        'border:' +
        borderStyle +
        'background:' +
        bgColor +
        'line-height:' +
        lineHeight +
        'font-size:' +
        fontSize
      "
    >
      {{ matchedName || name }}
    </div>
  </div>
</template>

<script lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";
import { MemberInfo } from "../types/v2-compat";
import { getColorByAccid } from "../utils/index.js";

export default {
  name: "CommonAvatar",
  props: {
    avatar: {
      type: String,
      default: "",
    },
    nick: {
      type: String,
      default: "",
    },
    accid: {
      type: String,
      default: "",
    },
    width: {
      type: Number,
      default: 36,
    },
    border: {
      type: Number,
      default: 4,
    },
    borderColor: {
      type: String,
      default: "#18191c",
    },
  },

  setup(props: {
    avatar?: string;
    nick?: string;
    accid?: string;
    width?: number;
    border?: number;
    borderColor?: string;
  }) {
    const store = useStore();

    return {
      matchedMember: computed(() => {
        const { accid } = props;
        const matchedMember = (
          store.state.server.serverMembers?.datas || []
        ).find((member: MemberInfo) => member.accid === accid);
        return matchedMember;
      }),
      matchedName: computed(() => {
        const { accid } = props;
        const matchedMember = (
          store.state.server.serverMembers?.datas || []
        ).find((member: MemberInfo) => member.accid === accid);
        const temp = matchedMember?.nick || matchedMember?.accid || "";
        return temp.substring(temp.length - 2);
      }),
      name: computed(() => {
        const { nick, accid } = props;
        const temp = nick || accid || "";
        return temp.substring(temp.length - 2);
      }),
      widthAndHeight: computed(() => {
        const { width = 36 } = props;
        return `${width}px;`;
      }),
      bgColor: computed(() => {
        const { accid } = props;
        return `${getColorByAccid(accid || "")};`;
      }),
      lineHeight: computed(() => {
        const { width = 36, border = 0 } = props;
        return `${width - border * 2}px;`;
      }),
      fontSize: computed(() => {
        const { width = 36, border = 0 } = props;
        return `${width / 2 - border - 6}px;`;
      }),
      borderStyle: computed(() => {
        const { border = 0, borderColor = "#18191c" } = props;
        return `${border}px solid ${borderColor};`;
      }),
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.common-avatar-container {
  display: inline-block;
  border-radius: 50%;

  .image {
    display: inline-block;
    object-fit: cover;
    border-radius: 50%;
  }

  .text {
    display: inline-block;
    border-radius: 50%;
    font-weight: 400;
    font-size: 12px;
    color: #ffffff;
    text-align: center;
    line-height: 70px;
  }
}
</style>
../types/v2-compat.js
