import { render } from "preact";
import { useEffect, useState } from "preact/hooks";
import {
  Component,
  defineComponent,
  EntityID,
  getComponentValue,
  Has,
  hasComponent,
  HasValue,
  runQuery,
  Type,
} from "@latticexyz/recs";
import {
  ComradeActions,
  createGovernmentContractArguments,
  getGovernmentContractAddress,
  loadPlugin,
} from "./government-api";

const ID = "apro-plugin-root";

const { network } = window.layers;

const {
  api: { registerComponent },
  world,
  components,
  systems,
} = network;

const ComradeComponent =
  ((network.components as any).Comrade as typeof components.Stake) ??
  defineComponent(
    world,
    {
      value: Type.Number,
    },
    { id: "Comrade", metadata: { contractId: "apro.component.Comrade.12" } }
  );
(window.layers.network.components as any)["Comrade"] = ComradeComponent;
registerComponent("Comrade", (network.components as any).Comrade);

const ComradeCreditComponent =
  ((network.components as any).ComradeCredit as Component<{
    mined: Type.Number;
    built: Type.Number;
  }>) ??
  defineComponent(
    world,
    {
      mined: Type.Number,
      built: Type.Number,
    },
    { id: "ComradeCredit", metadata: { contractId: "apro.component.ComradeCredit.12" } }
  );
(window.layers.network.components as any)["ComradeCredit"] = ComradeCreditComponent;
registerComponent("ComradeCredit", (network.components as any).ComradeCredit);

const PeoplesClaimComponent =
  ((network.components as any).PeoplesClaim as Component<{
    stake: Type.Number;
    comrades: Type.StringArray;
  }>) ??
  defineComponent(
    world,
    {
      stake: Type.Number,
      comrades: Type.StringArray,
    },
    { id: "PeoplesClaim", metadata: { contractId: "apro.component.PeoplesClaim.12" } }
  );
(window.layers.network.components as any)["PeoplesClaim"] = PeoplesClaimComponent;
registerComponent("PeoplesClaim", (network.components as any).PeoplesClaim);

function isComrade(address: string) {
  const entityIndex = world.entityToIndex.get(address.toLowerCase() as EntityID);
  return entityIndex != undefined && hasComponent(ComradeComponent, entityIndex);
}

function getComradeCredit(address: string) {
  const playerIndex = world.entityToIndex.get(address.toLowerCase() as EntityID);
  if (playerIndex == undefined) return undefined;

  return getComponentValue(ComradeCreditComponent, playerIndex);
}

function getComradeRank(address: string) {
  const comradeCredit = getComradeCredit(address);
  if (!comradeCredit) return 0;

  return Math.floor((comradeCredit.built + comradeCredit.mined) / 500);
}

function getComradeKarma(address: string) {
  const comradeCredit = getComradeCredit(address);
  if (!comradeCredit) return 0;

  return Math.floor((comradeCredit.mined - comradeCredit.built) / 100);
}

async function joinGovernment() {
  console.log("joining government");
  await (systems as any)["Government"].execute(createGovernmentContractArguments({ _type: ComradeActions.Join }), {
    gasLimit: 2_000_000,
  });
}

async function transferPrivateProperty() {
  const govtContractAddress = getGovernmentContractAddress();
  console.log("transferring private property");
  const individualAddress = network.network.connectedAddressChecksummed.get()?.toLowerCase() || "0x00";
  const privatelyOwnedItems = [...runQuery([HasValue(components.OwnedBy, { value: individualAddress })])].map(
    (item) => world.entities[item]
  );
  if (privatelyOwnedItems.length < 100) return;

  const chunkSize = 50;
  const numChunks = Math.floor(privatelyOwnedItems.length / chunkSize);
  const remainder = privatelyOwnedItems.length % chunkSize;

  // Transfer items in chunks
  for (let i = 0; i < numChunks; i++) {
    await systems["system.BulkTransfer"].executeTyped(
      privatelyOwnedItems.slice(i * chunkSize, (i + 1) * chunkSize),
      govtContractAddress,
      { gasLimit: chunkSize * 80_000 }
    );
  }

  // Transfer last partial chunk
  await systems["system.BulkTransfer"].executeTyped(
    privatelyOwnedItems.slice(numChunks * chunkSize, numChunks * chunkSize + remainder),
    govtContractAddress,
    { gasLimit: remainder * 80_000 }
  );
}

async function giveUpPrivatePropertyAndJoinRepublic() {
  transferPrivateProperty().catch((reason) => console.error(reason));

  try {
    await joinGovernment();
  } catch (e) {
    console.warn(e);
  }

  loadPlugin(getGovernmentContractAddress());
}

// Setup UI
const ContainerWrapper = `
  position: absolute;
  width: 300px;
  height: 300px;
  left: 36px;
  top: 200px;
`;

const P = `
  line-height: 16px;
`;

const H1 = `
  line-height: 24px;
`;

const Container = () => {
  const allComrades = [...runQuery([Has(ComradeComponent)])];
  const playerAddress = network.network.connectedAddressChecksummed.get()!.toLowerCase();

  const [joining, setJoining] = useState(false);
  const [comrade, setComrade] = useState(false);

  const comradeCredit = getComradeCredit(playerAddress);

  useEffect(() => {
    if (isComrade(playerAddress)) {
      setComrade(true);
    } else {
      ComradeComponent.update$.subscribe((e) => {
        if (e.entity === world.entityToIndex.get(playerAddress as EntityID)) {
          setComrade(true);
        }
      });
    }
  }, []);

  // Load plugin if already a Comrade
  useEffect(() => {
    if (comrade) {
      const govtContractAddress = getGovernmentContractAddress();
      console.log(govtContractAddress);
      loadPlugin(govtContractAddress);
    }
  }, [comrade]);

  async function handleJoin() {
    if (isComrade(playerAddress)) {
      setComrade(true);
      return;
    }

    setJoining(true);
    await giveUpPrivatePropertyAndJoinRepublic();
    setJoining(false);
  }

  return comrade ? (
    <div style={ContainerWrapper}>
      <h1 style={H1}>Welcome, comrade.</h1>
      <br />
      <p style={P}>You are a rank {getComradeRank(playerAddress)} Comrade.</p>
      <br />
      <p style={P}>You have {getComradeKarma(playerAddress)} Comrade Karma.</p>
      <br />
      <p style={P}>
        You have contributed {comradeCredit?.built} blocks built and {comradeCredit?.mined} blocks mined. You must mine
        more than you build!
      </p>
      <br />
      <div>
        <h1 style={H1}>All Comrades</h1>
        {allComrades.map((c) => {
          return (
            <p style={P}>
              {getComponentValue(components.Name, c)?.value}: Rank {getComradeRank(world.entities[c])}
            </p>
          );
        })}
      </div>
    </div>
  ) : (
    <div style={ContainerWrapper}>
      <h1 style={H1}>The Autonomous People's Republic of OPCraft</h1>
      <br />
      <p style={P}>
        I hereby renounce all private property to The Autonomous People's Republic of OPCraft. All of my blocks, lands
        claims, and future children will be be made available for use by our lord and savior, The Supreme Leader OP. I
        will serve no master other than the vision of The Autonomous People's Utopia.
      </p>
      <br />
      <button onClick={handleJoin}>{joining ? "Joining..." : "I pledge my allegiance."}</button>
    </div>
  );
};

function cleanup() {
  document.getElementById(ID)?.remove();
}

// Create a new react root to mount this element
cleanup();
const root = document.createElement("div");
root.id = ID;
document.body.appendChild(root);
render(<Container />, root);
