export interface MessageStatusLike {
  errorCode?: number;
}

export interface MessageLike {
  messageStatus?: MessageStatusLike;
  sendingState?: number;
  antispamReason?: string;
}

export const ANTISPAM_MESSAGE_ERROR_CODES = [
  195001,
  195002,
];

const FAILED_MESSAGE_ERROR_CODES = [
  102426,
  104404,
  ...ANTISPAM_MESSAGE_ERROR_CODES,
];

export const getMessageErrorCode = (msg: MessageLike): number | undefined => {
  return msg.messageStatus?.errorCode;
};

const ANTISPAM_LABEL_LOCALE_KEY_MAP: Record<string, string> = {
  100: "commonAntispamPornography",
  200: "commonAntispamAdvertising",
  260: "commonAntispamAdvertisingLaw",
  300: "commonAntispamViolence",
  400: "commonAntispamProhibited",
  500: "commonAntispamPolitics",
  600: "commonAntispamAbuse",
  700: "commonAntispamSpam",
  900: "commonAntispamOther",
  1000: "commonAntispamValue",
  1100: "commonAntispamValue",
};

export const getAntispamReasonFromMessage = (msg: MessageLike): string => {
  return typeof msg.antispamReason === "string"
    ? msg.antispamReason.trim()
    : "";
};

export const isStructuredAntispamReason = (reason?: string): boolean => {
  const normalizedReason = reason?.replace(/\\/g, "").trim();

  return !!(
    normalizedReason &&
    (/^[\[{]/.test(normalizedReason) ||
      /"label"\s*:/.test(normalizedReason))
  );
};

export const getAntispamLabelLocaleKey = (reason?: string): string => {
  const normalizedReason = reason?.replace(/\\/g, "").trim();

  if (!normalizedReason) {
    return "";
  }

  try {
    const parsed = JSON.parse(normalizedReason) as unknown;
    const stack = [parsed];

    while (stack.length > 0) {
      const current = stack.shift();

      if (!current || typeof current !== "object") {
        continue;
      }

      if (Array.isArray(current)) {
        stack.push(...current);
        continue;
      }

      const objectValue = current as Record<string, unknown>;
      const label = objectValue.label;

      if (typeof label === "number" || typeof label === "string") {
        return ANTISPAM_LABEL_LOCALE_KEY_MAP[String(label)] || "";
      }

      stack.push(...Object.values(objectValue));
    }
  } catch {
    // 兼容 SDK 返回被转义过的字符串。
  }

  const labelCode = normalizedReason.match(/"label"\s*:\s*(\d+)/)?.[1];
  return labelCode ? ANTISPAM_LABEL_LOCALE_KEY_MAP[labelCode] || "" : "";
};

export const isAntispamMessage = (msg: MessageLike): boolean => {
  const errorCode = getMessageErrorCode(msg);
  return (
    !!getAntispamReasonFromMessage(msg) ||
    (errorCode !== undefined && ANTISPAM_MESSAGE_ERROR_CODES.includes(errorCode))
  );
};

const isFailedMessageErrorCode = (errorCode?: number): boolean => {
  return (
    errorCode !== undefined && FAILED_MESSAGE_ERROR_CODES.includes(errorCode)
  );
};

export const isFailedMessage = (
  msg: MessageLike,
  failedSendingState: number,
): boolean => {
  const errorCode = getMessageErrorCode(msg);
  return (
    msg.sendingState === failedSendingState ||
    isFailedMessageErrorCode(errorCode)
  );
};

export const isNormalMessage = (
  msg: MessageLike,
  succeededSendingState: number,
  sendingSendingState: number,
  unknownSendingState?: number,
): boolean => {
  return (
    !isFailedMessageErrorCode(getMessageErrorCode(msg)) &&
    (msg.sendingState === undefined ||
      msg.sendingState === unknownSendingState ||
      msg.sendingState === succeededSendingState ||
      msg.sendingState === sendingSendingState)
  );
};
