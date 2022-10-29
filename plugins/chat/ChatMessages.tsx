import { useEffect, useState } from "react";
import { ChatMessage } from "./useChatMessages";

const useCurrentTime = (tick = 1000) => {
  const [time, setTime] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), tick);
    return () => clearInterval(interval);
  }, []);
  return time;
};

type Props = {
  messages: ChatMessage[];
  active: boolean;
};

export const ChatMessages = ({ active, messages }: Props) => {
  const now = useCurrentTime();
  const visibleMessages = active ? messages.slice(-20) : messages.filter((m) => m.seenAt + 1000 * 10 > now).slice(-10);

  return (
    <div class="OPChatMessages" hidden={!messages.length}>
      {visibleMessages.map((message, i) => (
        <div key={i}>{message.message}</div>
      ))}
    </div>
  );
};
