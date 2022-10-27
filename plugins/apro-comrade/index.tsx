import { GodID } from "@latticexyz/network";
import { EntityID, EntityIndex, getComponentValue, HasValue, runQuery, setComponent } from "@latticexyz/recs";
import { Coord, VoxelCoord } from "@latticexyz/utils";
import { BigNumber } from "ethers";
import { Window } from "../../types";

const ID = "apro-plugin-root";
const GovernmentContractAddress = "0x00";

const { network } = window.layers;

const {
  api: { getECSBlockAtPosition, getTerrainBlockAtPosition, getEntityAtPosition },
  types: { BlockIdToKey, BlockType },
  world,
  actions,
  components,
  systems,
} = network;

console.log("Hello, comrade");

// Patch system calls
network.api.mine = async (coord: VoxelCoord) => {
  console.log("comrade trying to mine ", coord);

  const ecsBlock = getECSBlockAtPosition(coord);
  const blockId = ecsBlock ?? getTerrainBlockAtPosition(coord);

  if (blockId == null) throw new Error("entity has no block type");
  const blockType = BlockIdToKey[blockId];
  const blockEntity = getEntityAtPosition(coord);
  const airEntity = world.registerEntity();

  actions.add({
    id: `mine+${coord.x}/${coord.y}/${coord.z}` as EntityID,
    metadata: { actionType: "mine", coord, blockType },
    requirement: () => true,
    components: { Position: components.Position, OwnedBy: components.OwnedBy, Item: components.Item },
    execute: () => systems["system.Mine"].executeTyped(coord, blockId, { gasLimit: ecsBlock ? 400_000 : 1_000_000 }),
    updates: () => [
      {
        component: "Position",
        entity: airEntity,
        value: coord,
      },
      {
        component: "Item",
        entity: airEntity,
        value: { value: BlockType.Air },
      },
      {
        component: "Position",
        entity: blockEntity || (Number.MAX_SAFE_INTEGER as EntityIndex),
        value: null,
      },
    ],
  });
};

network.api.build = async (entity: EntityID, coord: VoxelCoord) => {
  console.log("comrade trying to build", entity, coord);
  const entityIndex = world.entityToIndex.get(entity);
  if (entityIndex == null) return console.warn("trying to place unknown entity", entity);
  const blockId = getComponentValue(components.Item, entityIndex)?.value;
  const blockType = blockId != null ? BlockIdToKey[blockId as EntityID] : undefined;
  const godIndex = world.entityToIndex.get(GodID);
  const creativeMode = godIndex != null && getComponentValue(components.GameConfig, godIndex)?.creativeMode;

  actions.add({
    id: `build+${coord.x}/${coord.y}/${coord.z}` as EntityID,
    metadata: { actionType: "build", coord, blockType },
    requirement: () => true,
    components: { Position: components.Position, Item: components.Item, OwnedBy: components.OwnedBy },
    execute: () =>
      systems[creativeMode ? "system.CreativeBuild" : "system.Build"].executeTyped(BigNumber.from(entity), coord, {
        gasLimit: 500_000,
      }),
    updates: () => [
      {
        component: "OwnedBy",
        entity: entityIndex,
        value: { value: GodID },
      },
      {
        component: "Position",
        entity: entityIndex,
        value: coord,
      },
    ],
  });
};

network.api.stake = (chunkCoord: Coord) => {
  console.log("comrade trying to stake", chunkCoord);
  const diamondEntityIndex = [
    ...runQuery([
      HasValue(components.OwnedBy, { value: network.network.connectedAddress.get() }),
      HasValue(components.Item, { value: BlockType.Diamond }),
    ]),
  ][0];

  if (diamondEntityIndex == null) return console.warn("No owned diamonds to stake");
  const diamondEntity = world.entities[diamondEntityIndex];

  actions.add({
    id: `stake+${chunkCoord.x}/${chunkCoord.y}` as EntityID,
    metadata: { actionType: "stake", blockType: "Diamond" },
    requirement: () => true,
    components: { OwnedBy: components.OwnedBy },
    execute: () => systems["system.Stake"].executeTyped(diamondEntity, chunkCoord, { gasLimit: 400_000 }),
    updates: () => [
      {
        component: "OwnedBy",
        entity: diamondEntityIndex,
        value: { value: GodID },
      },
    ],
  });
};

network.api.claim = (chunkCoord: Coord) => {
  console.log("comrade trying to stake", chunkCoord);
  actions.add({
    id: `stake+${chunkCoord.x}/${chunkCoord.y}` as EntityID,
    metadata: { actionType: "claim", blockType: "Diamond" },
    requirement: () => true,
    components: {},
    execute: () => systems["system.Claim"].executeTyped(chunkCoord, { gasLimit: 400_000 }),
    updates: () => [],
  });
};

// Patch inventory UI
(network.network.connectedAddress as any).value_ = GovernmentContractAddress;
(network.network.connectedAddress as any).derivation = () => GovernmentContractAddress;

// Update greeting
const governmentID = world.registerEntity({ id: GovernmentContractAddress as EntityID });
setComponent(components.Name, governmentID, { value: "Comrade" });

// Reload react UI
(window as Window).remountReact();
