import { GodID } from "@latticexyz/network";
import {
  EntityID,
  EntityIndex,
  getComponentValue,
  getComponentValueStrict,
  HasValue,
  runQuery,
  setComponent,
} from "@latticexyz/recs";
import { Coord, keccak256, random, sleep, VoxelCoord } from "@latticexyz/utils";
import { Contract, utils } from "ethers";
const abiEncoder = utils.defaultAbiCoder;
import { Window } from "../../types";
import { abi as UpgradableSystemABI } from "./UpgradableSystem.json";

const { network } = window.layers;

const {
  api: { getECSBlockAtPosition, getTerrainBlockAtPosition, getEntityAtPosition, registerComponent, registerSystem },
  types: { BlockIdToKey, BlockType },
  world,
  actions,
  components,
  systems,
  network: { signer },
} = network;

export enum ComradeActions {
  Join,
  Stake,
  Claim,
  Mine,
  Build,
  Excommunicate,
}

export const SPAWN_CHUNK = { x: -97, y: -51 };

export function getGovernmentContractAddress() {
  const govtIndex = [
    ...runQuery([
      HasValue((components as any).SystemsRegistry, {
        value: keccak256("apro.system.Upgradable.12"), // UPGRADABLE
        // value: "0xb02c60b053f1d2e83aec926a2a07f3e7efae32775c9b40dea22dd1829cb45fe4", // GOVERNMENT
      }),
    ]),
  ][0];
  const GovernmentContractAddress = world.entities[govtIndex];

  return GovernmentContractAddress;
}

const existingGovtContract = getGovernmentContractAddress();

if (existingGovtContract) {
  const govtContract = new Contract(getGovernmentContractAddress(), UpgradableSystemABI, signer.get());
  registerSystem({ id: "Government", contract: govtContract });
} else {
  ((components as any).SystemsRegistry as typeof components.Item).update$.subscribe((update) => {
    const val = update.value[0];
    if (!val) return;

    if (val.value === keccak256("apro.system.Upgradable.12")) {
      const govtContract = new Contract(getGovernmentContractAddress(), UpgradableSystemABI, signer.get());
      registerSystem({ id: "Government", contract: govtContract });
    }
  });
}

export async function waitForAction(id: EntityID) {
  const actionIndex = world.getEntityIndexStrict(id);

  let status = getComponentValueStrict(actions.Action, actionIndex);
  while (![3, 4].includes(status.state)) {
    await sleep(500);
    status = getComponentValueStrict(actions.Action, actionIndex);
  }

  return true;
}

// args to Government contract
// ComradeActions _type, Coord memory chunk, uint256 blockEntity, VoxelCoord memory coord, uint256 blockType
export function createGovernmentContractArguments(args: {
  _type: ComradeActions;
  chunk?: Coord;
  blockEntity?: EntityID;
  coord?: VoxelCoord;
  blockType?: EntityID;
}) {
  const actionType = args._type;
  const chunk = args.chunk || { x: 0, y: 0 };
  const blockEntity = args.blockEntity || "0x0";
  const coord = args.coord || { x: 0, y: 0, z: 0 };
  const blockType = args.blockType || "0x0";

  return abiEncoder.encode(
    ["uint8", "int32", "int32", "uint256", "int32", "int32", "int32", "uint256"],
    [actionType, chunk.x, chunk.y, blockEntity, coord.x, coord.y, coord.z, blockType]
  );
}

export function loadPlugin(governmentContractAddress: string) {
  console.log(`Loading government ${governmentContractAddress}`);

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
      execute: () => {
        // systems["system.Mine"].executeTyped(coord, blockId, { gasLimit: ecsBlock ? 400_000 : 1_000_000 })
        return (systems as any)["Government"].execute(
          createGovernmentContractArguments({ _type: ComradeActions.Mine, coord, blockType: blockId }),
          { gasLimit: 2_000_000 }
        );
      },
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

  // TODO pick a random block of same type
  network.api.build = async (entity: EntityID, coord: VoxelCoord) => {
    console.log("comrade trying to build", entity, coord);
    const entityIndex = world.entityToIndex.get(entity);
    if (entityIndex == null) return console.warn("trying to place unknown entity", entity);
    const blockId = getComponentValue(components.Item, entityIndex)?.value;
    const blockType = blockId != null ? BlockIdToKey[blockId as EntityID] : undefined;

    if (!blockId) return;

    // If we do not randomize, government members may try to build with the same blocks
    const governmentBlocksOfType = [
      ...runQuery([
        HasValue(components.OwnedBy, { value: getGovernmentContractAddress() }),
        HasValue(components.Item, { value: blockId }),
      ]),
    ];
    const randomBlock = governmentBlocksOfType[random(governmentBlocksOfType.length - 1, 0)];
    const newEntityId = world.entities[randomBlock];

    console.log(`block entity id: ${newEntityId}`);

    actions.add({
      id: `build+${coord.x}/${coord.y}/${coord.z}` as EntityID,
      metadata: { actionType: "build", coord, blockType },
      requirement: () => true,
      components: { Position: components.Position, Item: components.Item, OwnedBy: components.OwnedBy },
      execute: () =>
        (systems as any)["Government"].execute(
          createGovernmentContractArguments({ _type: ComradeActions.Build, coord, blockEntity: newEntityId })
        ),
      updates: () => [
        {
          component: "OwnedBy",
          entity: randomBlock,
          value: { value: GodID },
        },
        {
          component: "Position",
          entity: randomBlock,
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
  (network.network.connectedAddress as any).value_ = governmentContractAddress;
  (network.network.connectedAddress as any).derivation = () => governmentContractAddress;
  [...(network.network.connectedAddress as any).observers_].forEach((reaction) => reaction.onInvalidate_());

  // Update greeting
  const governmentID = world.registerEntity({ id: governmentContractAddress as EntityID });
  setComponent(components.Name, governmentID, { value: "Autonomous People's Republic of OPCraft" });

  // Reload react UI
  (window as Window).remountReact();
}
