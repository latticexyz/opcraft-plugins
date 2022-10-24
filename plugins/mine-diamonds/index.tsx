import { render } from "preact";
import { useState } from "preact/hooks";

const ID = "mine-diamond-root";

const {
  noa: {
    noa: { inputs },
  },
  network: {
    api: { mine, getBlockAtPosition },
  },
} = window.layers;

function findAndMineDiamonds(x: number, z: number) {
  let diamondsFound = 0;
  const baseCoords = { x, y: -20, z };
  for (let x = 0; x < 50; x++) {
    for (let y = 0; y < 40; y++) {
      for (let z = 0; z < 50; z++) {
        const position = {
          x: baseCoords.x + x,
          y: baseCoords.y - y,
          z: baseCoords.z + z,
        };

        const terrain = getBlockAtPosition(position);
        if (terrain === "0x07ada0086470563550001d9d522de93345af1f24d3f49468f1474ef163c5f959") {
          mine(position);
          diamondsFound++;
        }
      }
    }
  }

  return diamondsFound;
}

const Container = () => {
  const [value, setValue] = useState("");
  const [hover, setHover] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <div style={Wrapper}>
      <div style={Inner}>
        <p>Find and Mine Diamonds starting at this position. Checks a 50x50 area.</p>
        <br />
        <br />
        <input
          value={value}
          onInput={(e) => setValue((e.target as HTMLInputElement).value)}
          placeholder={"x,z"}
          style={Input}
          onFocus={() => (inputs.disabled = true)}
          onBlur={() => (inputs.disabled = false)}
        />
        <br />
        <p>{message}</p>
        <br />
        <div
          onClick={() => {
            const [x, z] = value.split(",");
            let diamondsFound = 0;
            try {
              diamondsFound = findAndMineDiamonds(parseInt(x), parseInt(z));
            } finally {
              setMessage(`${diamondsFound} diamonds mined!`);
            }
          }}
          style={Button(hover)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          holla holla get dolla
        </div>
      </div>
    </div>
  );
};

const Wrapper = `
  position: relative;
  width: 256px;
  top: 100px;
  left: 36px;
`;

const Inner = `
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 3px;
  font-size: 15px;
  box-shadow: 0 0 0 3px #555, 0 0 0 5px #000;
  pointer-events: all;
  z-index: 100;
  padding: 16px;
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
}

// Create a new react root to mount this element
cleanup();
const root = document.createElement("div");
root.id = ID;
root.setAttribute("style", `
  height: 100vh;
`);
document.body.appendChild(root);
render(<Container />, root);
