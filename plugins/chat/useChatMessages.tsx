import { useState, useEffect, useCallback } from "preact/hooks";
import { useDisplayName } from "./useDisplayName";

const {
  network: { relay },
} = window.layers;

const chatMessagePrefix = "gchat:";
const chatApiEndpoint = "https://opchat.vercel.app/api/discord";

export const useChatMessages = () => {
  const { displayName } = useDisplayName();
  const [messages, setMessages] = useState<string[]>([]);

  // fetch message history
  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch(`${chatApiEndpoint}/messages`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages.map((message: any) => message.content));
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
        setMessages((messages) => [...messages, message]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  });

  const postMessage = useCallback(async (input: string) => {
    if (!relay) throw new Error("No relay");

    const message = `<${displayName}> ${input}`;

    const textEncoder = new TextEncoder();
    // add prefix until label is exposed as part of the message object
    const encodedMessage = textEncoder.encode(`${chatMessagePrefix}${message}`);
    setMessages((messages) => [...messages, message]);
    console.log("pushing message to relay", encodedMessage);
    await relay.push("gchat", encodedMessage);
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
  }, []);

  return {
    messages,
    postMessage,
  };
};
