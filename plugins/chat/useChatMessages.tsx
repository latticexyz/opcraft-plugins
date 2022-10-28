import { useState, useEffect, useCallback } from "preact/hooks";
import { useDisplayName } from "./useDisplayName";

export type ChatMessage = {
  seenAt: number;
  message: string;
};

const {
  network: { relay },
} = window.layers;

const chatMessagePrefix = "gchat:";
const chatApiEndpoint = "https://opchat.vercel.app/api/discord";

export const useChatMessages = () => {
  const { displayName } = useDisplayName();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // fetch message history
  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch(`${chatApiEndpoint}/messages`);
      const data = await res.json();
      if (data.messages) {
        setMessages(
          data.messages.map(
            (message: any): ChatMessage => ({
              seenAt: Date.now(),
              message: message.content,
            })
          )
        );
      }
    };
    fetchMessages();
  }, []);

  // listen for messages from other players via relay
  useEffect(() => {
    if (!relay) throw new Error("No relay");

    const subscription = relay.event$.subscribe((event) => {
      const decoder = new TextDecoder();
      const decodedMessage = decoder.decode(event.message.data);
      if (decodedMessage.startsWith(chatMessagePrefix)) {
        const message = decodedMessage.slice(chatMessagePrefix.length);
        setMessages((messages) => [
          ...messages,
          {
            seenAt: Date.now(),
            message,
          },
        ]);
      }
    });

    return () => subscription.unsubscribe();
  });

  const postMessage = useCallback(
    async (input: string) => {
      if (!relay) throw new Error("No relay");

      const message = `<${displayName}> ${input}`;

      const textEncoder = new TextEncoder();
      // add prefix until label is exposed as part of the message object
      const encodedMessage = textEncoder.encode(`${chatMessagePrefix}${message}`);
      // TODO: remove this once we can listen to our own relay messages
      setMessages((messages) => [
        ...messages,
        {
          seenAt: Date.now(),
          message,
        },
      ]);

      console.log("pushing message to relay", encodedMessage);
      await relay.push("gchat", encodedMessage);

      console.log("posting message to discord");
      await fetch(`${chatApiEndpoint}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
        }),
      });
      // TODO: roll back message if push fails?
    },
    [displayName]
  );

  return {
    messages,
    postMessage,
  };
};
