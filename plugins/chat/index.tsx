import { render } from "preact";
import { useState, useEffect, useRef } from "preact/hooks";
import { useChatMessages } from "./useChatMessages";
import { useDisplayName } from "./useDisplayName";

const useCurrentTime = (tick = 1000) => {
  const [time, setTime] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), tick);
    return () => clearInterval(interval);
  }, []);
  return time;
};

const Root = () => {
  const [active, setActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { displayName } = useDisplayName();
  const { messages, postMessage } = useChatMessages();
  const now = useCurrentTime();

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        event.key === "Enter" &&
        target instanceof HTMLElement &&
        !target.matches("input, textarea, select, [contenteditable]")
      ) {
        event.preventDefault();
        event.stopPropagation();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, []);

  const visibleMessages = active ? messages.slice(-20) : messages.filter((m) => m.seenAt + 1000 * 10 > now).slice(-10);

  return (
    <>
      <div class={`OPChat ${active ? "OPChat--active" : ""}`}>
        <div class="OPChat-messages" hidden={!messages.length}>
          {visibleMessages.map((message, i) => (
            <div key={i}>{message.message}</div>
          ))}
        </div>
        <form
          onSubmit={(event) => {
            console.log("submitted");
            event.preventDefault();
            const input = inputRef.current;
            if (input?.value) {
              postMessage(input.value);
              input.value = "";
            }
            input?.blur();
          }}
        >
          <label>
            &lt;{displayName}&gt;&nbsp;
            <input
              id="OPChat-input"
              ref={inputRef}
              type="text"
              onFocus={() => setActive(true)}
              onBlur={() => setActive(false)}
              onKeyDown={(event) => {
                event.stopPropagation();
                if (event.key === "Escape") {
                  event.preventDefault();
                  event.currentTarget.value = "";
                  event.currentTarget.blur();
                }
              }}
            />
          </label>
        </form>
      </div>
      <style>{`
        .OPChat {
          position: absolute;
          bottom: 122px;
          left: 50px;
          right: 50px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-size: 18px;
          line-height: 1;
        }
        .OPChat-messages {
          padding: 10px;
        }
        .OPChat--active .OPChat-messages {
          background: rgba(0, 0, 0, 0.4);
        }
        .OPChat label {
          padding: 10px;
          font-size: inherit;
          line-height: inherit;
          color: inherit;
          font-family: inherit;
          text-shadow: inherit;
          display: flex;
          cursor: text;
          background: rgba(0, 0, 0, 0.4);
          opacity: 0;
        }
        .OPChat--active label {
          opacity: 1;
        }
        .OPChat input {
          flex: 1;
          outline: none;
          border: 0;
          background: transparent;
          font-size: inherit;
          line-height: inherit;
          color: inherit;
          font-family: inherit;
          text-shadow: inherit;
        }
      `}</style>
    </>
  );
};

// Cleanup function to call when plugin gets reloaded
function cleanup() {
  document.getElementById("chat-plugin-root")?.remove();
}

// Create a new react root to mount this element
cleanup();
const root = document.createElement("div");
root.id = "chat-plugin-root";
document.body.appendChild(root);
render(<Root />, root);
