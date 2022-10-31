import { Coord, VoxelCoord } from "@latticexyz/utils";
import { render } from "preact";
import { useState, useEffect } from "preact/hooks";
import { Subscription } from "rxjs";

const ID = "drill-plugin-root";
const DIAMOND_ID = '0x07ada0086470563550001d9d522de93345af1f24d3f49468f1474ef163c5f959';

const {
  network: {
    api: { mine, getBlockAtPosition }
  },
  noa: {
    noa: { inputs, container },
    streams: { playerChunk$ },
  },
} = window.layers;

// Create React UI
const Container = () => {
  const [disabled, setDisabled] = useState(true);
  const [visible, setVisible] = useState(false);
  const [subscription, setSubscription] = useState<Subscription>();
  const [playerChunk, setPlayerChunk] = useState<Coord>();
  const [localDiamonds, setLocalDiamonds] = useState<VoxelCoord[]>([]);
  const [hover, setHover] = useState(false);

  function toggleUI() {
    setVisible((v) => {
      if (!container.hasPointerLock && !v) return v;
      container.setPointerLock(v);
      return !v;
    });
  }

  useEffect(() => {
    // subscribe to chunk updates
    if(subscription) subscription.unsubscribe();
    
    setSubscription(playerChunk$.subscribe((value) => {
      if (!playerChunk || value.x != playerChunk.x || value.y != playerChunk.y) {
        setPlayerChunk(value);
      }
    }));
    
  }, [playerChunk])

  useEffect(() => {
    if (!playerChunk) return;

    // when position changes find diamonds on their chunk
    let diamondCoords = [];
    for (let y = -20; y <= 50; y++) {
      for (let x = 0; x < 16; x++) {
        for (let z = 0; z < 16; z++) {
          const thisCoord = {
            x: playerChunk.x * 16 + x,
            y,
            z: playerChunk.y * 16 + z
          };

          const terrainId = getBlockAtPosition(thisCoord)
          if (terrainId === DIAMOND_ID) {
            diamondCoords.push(thisCoord)
          }
        }
      }
    }
    setLocalDiamonds(diamondCoords);
    setDisabled(diamondCoords.length === 0);
  }, [playerChunk, setLocalDiamonds, setDisabled, getBlockAtPosition]);

  function executeDrill() {
    // check if there are no diamonds
    if (localDiamonds.length === 0) return;

    // loop through diamonds and drill
    localDiamonds.forEach((diamondCoord, ind) => {
      setTimeout(() => {
        mine(diamondCoord);
      }, 100*ind)
    })

    // reset local diamonds
    setLocalDiamonds([]);
    setHover(false);
  }

  useEffect(() => {
    // Bind "T" to open teleport UI
    inputs.bind("drill", "G");
    inputs.down.on("drill", toggleUI);
  }, []);

  return (
    visible ? <>
      <div style={DrillContainer}>
        <div>
          {localDiamonds.length} Diamond{localDiamonds.length !== 1 ? 's' : ''} available
        </div>
        <div
          onClick={executeDrill}
          style={Button(hover, disabled)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          Drill
        </div>
      </div>
    </> : null
  )
};

const Button = (hover: boolean, disabled: boolean) => `
  box-shadow: 0 0 0 3px #555;
  background-color: #333;
  padding: 4px;
  margin-top: 1vh;
  border-radius: 3px;
  transition: all 100ms ease;
  user-select: none;
  text-align: center;

  ${
  disabled ? `
    opacity: 0.5;
  ` :  
  hover ? `
    box-shadow: 0 0 0 3px #555, 0 0 0 5px #000;
    background-color: #777;
    cursor: pointer;
  ` : ``}
`;

const DrillContainer = `
  position: absolute;
  width: 15vw;
  box-shadow: 0 0 0 3px #555, 0 0 0 5px #000;
  background: #222;
  border-radius: 3px;
  padding: 8px;
  user-select: none;
  min-width: 200px;
  margin-top: 6vh;
  margin-left: 1vw;
`;

// Cleanup function to call when plugin gets reloaded
function cleanup() {
  document.getElementById(ID)?.remove();
  inputs.unbind("drill");
}

// Create a new react root to mount this element
cleanup();
const root = document.createElement("div");
root.id = "drill-plugin-root";
document.body.appendChild(root);
render(<Container />, root);
