export interface MergeForwardAbstract {
  senderNick?: string;
  nick?: string;
  fromNick?: string;
  userAccId?: string;
  from?: string;
  content?: string;
  body?: string;
  text?: string;
}

export interface MergeForwardData {
  abstracts?: MergeForwardAbstract[];
  items?: MergeForwardAbstract[];
  depth?: number;
  md5?: string;
  name?: string;
  sessionId?: string;
  sessionName?: string;
  to?: string;
  url?: string;
}

const CHAT_HISTORY_ABSTRACT_CONTENTS = new Set([
  "[Chat History]",
  "[Chat history]",
  "[聊天记录]",
]);

export const normalizeMergeForwardAbstractContent = (
  content: unknown,
  chatHistoryText: string,
): string => {
  if (content === undefined || content === null) {
    return "";
  }

  const text = typeof content === "string" ? content : String(content);

  if (CHAT_HISTORY_ABSTRACT_CONTENTS.has(text.trim())) {
    return `[${chatHistoryText}]`;
  }

  return text;
};

const parseJson = (value: unknown): unknown => {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const normalizePayload = (value: unknown): unknown => {
  const parsed = parseJson(value);

  if (!parsed || typeof parsed !== "object") {
    return parsed;
  }

  const candidate = parsed as Record<string, unknown>;
  if (candidate.raw) {
    return normalizePayload(candidate.raw);
  }

  return candidate;
};

const getPayloadData = (value: unknown): MergeForwardData | undefined => {
  const payload = normalizePayload(value);

  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const candidate = payload as Record<string, unknown>;
  if (candidate.type !== 101) {
    return undefined;
  }

  return ((candidate.data || candidate) as MergeForwardData) || undefined;
};

export const extractMergeForwardData = (msg?: {
  attachment?: unknown;
  content?: unknown;
  text?: unknown;
}): MergeForwardData => {
  if (!msg) {
    return {};
  }

  return (
    getPayloadData(msg.attachment) ||
    getPayloadData(msg.content) ||
    getPayloadData(msg.text) ||
    {}
  );
};

export const getMergeForwardUrl = (msg?: {
  attachment?: unknown;
  content?: unknown;
  text?: unknown;
}): string => {
  return extractMergeForwardData(msg).url || "";
};
