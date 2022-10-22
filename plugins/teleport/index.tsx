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

  useEffect(() => {
    // Bind "T" to open teleport UI
    inputs.bind("teleport", "T");
    inputs.down.on("teleport", () => {
      if (!container.hasPointerLock) return;
      setVisible((v) => {
        container.setPointerLock(v);
        return !v;
      });
    });
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
      <div style={Inner}>
        <input
          value={value}
          onInput={(e) => setValue((e.target as HTMLInputElement).value)}
          placeholder={"x,y,z"}
          style={Input}
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
  z-index: 100;
  pointer-events: none;
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
