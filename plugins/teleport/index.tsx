import { render } from "preact";
import { useState, useEffect } from "preact/hooks";

const ID = "teleport-plugin-root";

const {
  noa: {
    noa: { inputs, container },
    api: { teleport },
  },
} = window.layers;

// Create React UI
const Container = () => {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");
  const [hover, setHover] = useState(false);

  function toggleUI() {
    setVisible((v) => {
      if (!container.hasPointerLock && !v) return v;
      container.setPointerLock(v);
      return !v;
    });
  }

  useEffect(() => {
    // Bind "T" to open teleport UI
    inputs.bind("teleport", "T");
    inputs.down.on("teleport", toggleUI);
  }, []);

  function executeTeleport() {
    if (!value) return;
    const coords = value.split(",").map((e) => parseInt(e));
    if (coords.length !== 3) return;
    const [x, y, z] = coords;
    teleport({ x, y, z });
    setValue("");
    setVisible(false);
    setHover(false);
  }

  return visible ? (
    <div style={Wrapper}>
      <div style={Background} onClick={toggleUI} />
      <div style={Inner}>
        <input
          value={value}
          onInput={(e) => setValue((e.target as HTMLInputElement).value)}
          placeholder={"x,y,z"}
          style={Input}
          onFocus={() => (inputs.disabled = true)}
          onBlur={() => (inputs.disabled = false)}
        />
        <div
          onClick={executeTeleport}
          style={Button(hover)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          teleport
        </div>
      </div>
    </div>
  ) : null;
};

const Wrapper = `
  position: absolute;
  width: 100vw;
  height: 100vh;
  display: grid;
  align-content: center;
  justify-content: center;
  pointer-events: none;
`;

const Background = `
  position: absolute;
  pointer-events: all;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.2);
`;

const Inner = `
  display: grid;
  align-content: center;
  justify-content: center;
  border-radius: 3px;
  font-size: 15px;
  box-shadow: 0 0 0 3px #555, 0 0 0 5px #000;
  grid-auto-flow: column;
  pointer-events: all;
  z-index: 100;
`;

const Input = `
  padding: 10px;
  border: none;
  border-radius: 3px;
  font-family: "Lattice Pixel", sans-serif;
  background-cp
  font-size: 15px;
`;

const Button = (hover: boolean) => `
  cursor: pointer;
  background-color: ${hover ? "#777" : "#333"};
  display: grid;
  justify-content: center;
  align-items: center;
  padding: 10px;
  transition: all 100ms ease;
`;

// Cleanup function to call when plugin gets reloaded
function cleanup() {
  document.getElementById(ID)?.remove();
  inputs.unbind("teleport");
}

// Create a new react root to mount this element
cleanup();
const root = document.createElement("div");
root.id = "teleport-plugin-root";
document.body.appendChild(root);
render(<Container />, root);
