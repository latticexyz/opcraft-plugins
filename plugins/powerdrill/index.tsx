import { Coord } from "@latticexyz/utils";
import { render } from "preact";
import { useState, useEffect } from "preact/hooks";
import { Contract, Wallet, providers } from "ethers";
import { abi } from "./abi.json";
import { diamonds } from "./entities.json";
import { Subscription } from "rxjs";

const ID = "powerdrill-plugin-root";

const {
  noa: {
    noa: { inputs, container },
    streams: { playerChunk$ },
  },
} = window.layers;

// Create React UI
const Container = () => {
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState(false);
  const [subscription, setSubscription] = useState<Subscription>();
  const [playerChunk, setPlayerChunk] = useState<Coord>();

  function toggleUI() {
    setVisible((v) => {
      if (!container.hasPointerLock && !v) return v;
      container.setPointerLock(v);
      return !v;
    });
  }

  useEffect(() => {
    // subscribe to chunk updates
    if (subscription) subscription.unsubscribe();

    setSubscription(
      playerChunk$.subscribe((value) => {
        if (!playerChunk || value.x != playerChunk.x || value.y != playerChunk.y) {
          setPlayerChunk(value);
        }
      })
    );
  }, [playerChunk]);

  useEffect(() => {
    // Bind "J" to open powerdrill UI
    inputs.bind("powerdrill", "J");
    inputs.down.on("powerdrill", toggleUI);
  }, []);

  async function mineAndStake() {
    if (!playerChunk) return;

    const pk = localStorage.getItem("burnerWallet");
    if (!pk) return;

    const p = new providers.JsonRpcProvider("https://opcraft-3-replica-0.bedrock-goerli.optimism.io");
    const s = new Wallet(pk, p);
    const c = new Contract("0x8690B94D0873E2D0f58c0A51ff2Bf1d55e7dCb97", abi, s);

    let randomDiamonds = [];
    for (let i = 0; i < 1; i++) {
      randomDiamonds.push(diamonds[Math.floor(Math.random() * diamonds.length)]);
    }

	console.log("randomDiamonds", randomDiamonds)
	console.log("playerChunk", playerChunk.x, playerChunk.y)
    const tx = await c.mineAndStake("block.Diamond", randomDiamonds, { x: playerChunk.x, y: playerChunk.y }, {gasPrice: 2000000});
	console.log(tx.hash)

    setVisible(false);
    setHover(false);
  }

  return visible ? (
    <div style={Wrapper}>
      <div style={Background} onClick={toggleUI} />
      <div style={Inner}>
        <div
          onClick={mineAndStake}
          style={Button(hover)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
         Bulk mine and stake 10 diamonds 
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
  inputs.unbind("powerdrill");
}

// Create a new react root to mount this element
cleanup();
const root = document.createElement("div");
root.id = "powerdrill-plugin-root";
document.body.appendChild(root);
render(<Container />, root);
