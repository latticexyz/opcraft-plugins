import { ComponentValue, EntityID, EntityIndex, getComponentEntities, getComponentValue, Has, HasValue, Not, NotValue, removeComponent, runQuery, setComponent } from "@latticexyz/recs";
import { Coord, VoxelCoord } from "@latticexyz/utils";
import { Signer } from "ethers";
import { SystemTypes } from "contracts/types/SystemTypes";
import { BehaviorSubject } from "rxjs";
type GameConfig = {
    worldAddress: string;
    privateKey: string;
    chainId: number;
    jsonRpc: string;
    wsRpc?: string;
    snapshotUrl?: string;
    streamServiceUrl?: string;
    relayServiceUrl?: string;
    faucetServiceUrl?: string;
    devMode: boolean;
    initialBlockNumber: number;
    blockTime: number;
    blockExplorer?: string;
};
type NetworkLayer = Awaited<ReturnType<typeof createNetworkLayer>>;
/**
 * The Network layer is the lowest layer in the client architecture.
 * Its purpose is to synchronize the client components with the contract components.
 */
declare function createNetworkLayer(config: GameConfig): Promise<{
    world: {
        entities: EntityID[];
        entityToIndex: Map<EntityID, EntityIndex>;
        registerEntity: ({ id, idSuffix }?: {
            id?: EntityID | undefined;
            idSuffix?: string | undefined;
        } | undefined) => EntityIndex;
        components: import("@latticexyz/recs").Component<import("@latticexyz/recs").Schema, import("@latticexyz/recs").Metadata, undefined>[];
        registerComponent: (component: import("@latticexyz/recs").Component<import("@latticexyz/recs").Schema, import("@latticexyz/recs").Metadata, undefined>) => void;
        dispose: (namespace?: string | undefined) => void;
        registerDisposer: (disposer: () => void, namespace?: string | undefined) => void;
        getEntityIndexStrict: (entity: EntityID) => EntityIndex;
        hasEntity: (entity: EntityID) => boolean;
    };
    components: {
        Position: import("@latticexyz/recs").Component<{
            x: import("@latticexyz/recs").Type.Number;
            y: import("@latticexyz/recs").Type.Number;
            z: import("@latticexyz/recs").Type.Number;
        }, {
            contractId: string;
        }, undefined>;
        ItemPrototype: import("@latticexyz/recs").Component<{
            value: import("@latticexyz/recs").Type.Boolean;
        }, {
            contractId: string;
        }, undefined>;
        Item: import("@latticexyz/recs").Component<{
            value: import("@latticexyz/recs").Type.String;
        }, {
            contractId: string;
        }, undefined>;
        Name: import("@latticexyz/recs").Component<{
            value: import("@latticexyz/recs").Type.String;
        }, {
            contractId: string;
        }, undefined>;
        OwnedBy: import("@latticexyz/recs").Component<{
            value: import("@latticexyz/recs").Type.String;
        }, {
            contractId: string;
        }, undefined>;
        GameConfig: import("@latticexyz/recs").Component<{
            creativeMode: import("@latticexyz/recs").Type.Boolean;
        }, {
            contractId: string;
        }, undefined>;
        Recipe: import("@latticexyz/recs").Component<{
            value: import("@latticexyz/recs").Type.String;
        }, {
            contractId: string;
        }, undefined>;
        LoadingState: import("@latticexyz/recs").Component<{
            state: import("@latticexyz/recs").Type.Number;
            msg: import("@latticexyz/recs").Type.String;
            percentage: import("@latticexyz/recs").Type.Number;
        }, {
            contractId: string;
        }, undefined>;
        Occurrence: import("@latticexyz/recs").Component<{
            contr: import("@latticexyz/recs").Type.String;
            func: import("@latticexyz/recs").Type.String;
        }, {
            contractId: string;
        }, undefined>;
        Stake: import("@latticexyz/recs").Component<{
            value: import("@latticexyz/recs").Type.Number;
        }, {
            contractId: string;
        }, undefined>;
        Claim: import("@latticexyz/recs").Component<{
            stake: import("@latticexyz/recs").Type.Number;
            claimer: import("@latticexyz/recs").Type.Entity;
        }, {
            contractId: string;
        }, undefined>;
        Plugin: import("@latticexyz/recs").Component<{
            host: import("@latticexyz/recs").Type.String;
            source: import("@latticexyz/recs").Type.String;
            path: import("@latticexyz/recs").Type.String;
            active: import("@latticexyz/recs").Type.Boolean;
        }, {
            contractId: string;
        }, undefined>;
        PluginRegistry: import("@latticexyz/recs").Component<{
            value: import("@latticexyz/recs").Type.String;
        }, {
            contractId: string;
        }, undefined>;
    };
    txQueue: import("@latticexyz/network").TxQueue<{
        World: import("@latticexyz/solecs/types/ethers-contracts/World").World;
    }>;
    systems: import("@latticexyz/network").TxQueue<SystemTypes>;
    txReduced$: import("rxjs").Observable<string>;
    startSync: () => void;
    network: {
        providers: import("mobx").IComputedValue<{
            json: any;
            /**
             * The Network layer is the lowest layer in the client architecture.
             * Its purpose is to synchronize the client components with the contract components.
             */
            ws: import("@ethersproject/providers").WebSocketProvider | undefined;
        }>;
        signer: import("mobx").IComputedValue<Signer | undefined>;
        connected: import("mobx").IComputedValue<import("@latticexyz/network").ConnectionState>;
        blockNumber$: import("rxjs").Observable<number>;
        dispose: () => void;
        clock: import("@latticexyz/network").Clock;
        config: import("@latticexyz/network").NetworkConfig;
        connectedAddress: import("mobx").IComputedValue<string | undefined>;
        connectedAddressChecksummed: import("mobx").IComputedValue<string | undefined>;
    };
    actions: {
        add: <C extends import("@latticexyz/recs").Components, T>(actionRequest: import("@latticexyz/std-client/dist/systems/ActionSystem/types").ActionRequest<C, T, {
            actionType: string;
            coord?: VoxelCoord | undefined;
            blockType?: "Bedrock" | "BlackFlower" | "BlueFlower" | "Clay" | "Coal" | "CyanFlower" | "Diamond" | "Dirt" | "Grass" | "GrassPlant" | "GrayFlower" | "GreenFlower" | "Kelp" | "Leaves" | "LightBlueFlower" | "LightGrayFlower" | "LimeFlower" | "Log" | "MagentaFlower" | "OrangeFlower" | "PinkFlower" | "PurpleFlower" | "RedFlower" | "Sand" | "Snow" | "Stone" | "Water" | "Wool" | "Air" | "Glass" | "Cobblestone" | "MossyCobblestone" | "Crafting" | "Iron" | "Gold" | "Planks" | "OrangeWool" | "MagentaWool" | "LightBlueWool" | "YellowWool" | "LimeWool" | "PinkWool" | "GrayWool" | "LightGrayWool" | "CyanWool" | "PurpleWool" | "BlueWool" | "BrownWool" | "GreenWool" | "RedWool" | "BlackWool" | "Sponge" | "Bricks" | undefined;
        }>) => EntityIndex;
        cancel: (actionId: EntityID) => boolean;
        withOptimisticUpdates: <S extends import("@latticexyz/recs").Schema, M_1 extends import("@latticexyz/recs").Metadata, T_1>(component: import("@latticexyz/recs").Component<S, M_1, T_1>) => import("@latticexyz/recs").OverridableComponent<S, M_1, T_1>;
        Action: import("@latticexyz/recs").Component<{
            state: import("@latticexyz/recs").Type.Number;
            on: import("@latticexyz/recs").Type.OptionalEntity;
            metadata: import("@latticexyz/recs").Type.OptionalT;
            overrides: import("@latticexyz/recs").Type.OptionalStringArray;
            txHash: import("@latticexyz/recs").Type.OptionalString;
        }, import("@latticexyz/recs").Metadata, {
            actionType: string;
            coord?: VoxelCoord | undefined;
            blockType?: "Bedrock" | "BlackFlower" | "BlueFlower" | "Clay" | "Coal" | "CyanFlower" | "Diamond" | "Dirt" | "Grass" | "GrassPlant" | "GrayFlower" | "GreenFlower" | "Kelp" | "Leaves" | "LightBlueFlower" | "LightGrayFlower" | "LimeFlower" | "Log" | "MagentaFlower" | "OrangeFlower" | "PinkFlower" | "PurpleFlower" | "RedFlower" | "Sand" | "Snow" | "Stone" | "Water" | "Wool" | "Air" | "Glass" | "Cobblestone" | "MossyCobblestone" | "Crafting" | "Iron" | "Gold" | "Planks" | "OrangeWool" | "MagentaWool" | "LightBlueWool" | "YellowWool" | "LimeWool" | "PinkWool" | "GrayWool" | "LightGrayWool" | "CyanWool" | "PurpleWool" | "BlueWool" | "BrownWool" | "GreenWool" | "RedWool" | "BlackWool" | "Sponge" | "Bricks" | undefined;
        }>;
    };
    api: {
        build: (entity: EntityID, coord: VoxelCoord) => void;
        mine: (coord: VoxelCoord) => Promise<void>;
        craft: (ingredients: EntityID[][], result: EntityID) => Promise<void>;
        stake: (chunkCoord: Coord) => void;
        claim: (chunkCoord: Coord) => void;
        transfer: (entity: EntityID, receiver: string) => void;
        getBlockAtPosition: (position: VoxelCoord) => EntityID;
        getECSBlockAtPosition: (position: VoxelCoord) => EntityID | undefined;
        getTerrainBlockAtPosition: (position: VoxelCoord) => EntityID;
        getEntityAtPosition: (position: VoxelCoord) => EntityIndex;
        getName: (address: EntityID) => string | undefined;
        addPlugin: (value: ComponentValue<{
            host: import("@latticexyz/recs").Type.String;
            source: import("@latticexyz/recs").Type.String;
            path: import("@latticexyz/recs").Type.String;
            active: import("@latticexyz/recs").Type.Boolean;
        }, undefined>) => void;
        reloadPlugin: (entity: EntityIndex) => void;
        togglePlugin: (entity: EntityIndex, active?: boolean) => void;
        addPluginRegistry: (url: string) => void;
        removePluginRegistry: (url: string) => void;
        reloadPluginRegistry: (entity: EntityIndex) => void;
        reloadPluginRegistryUrl: (url: string) => void;
        registerComponent: (key: string, component: import("@latticexyz/std-client/dist/setup/setupMUDNetwork").ContractComponent) => void;
        registerSystem: (system: {
            id: string;
            contract: import("ethers").Contract;
        }) => Promise<void>;
    };
    dev: {
        setContractComponentValue: <T_2 extends import("@latticexyz/recs").Schema>(entity: EntityIndex, component: import("@latticexyz/recs").Component<T_2, {
            contractId: string;
        }, undefined>, newValue: ComponentValue<T_2, undefined>) => Promise<void>;
        DevHighlightComponent: import("@latticexyz/recs").Component<{
            value: import("@latticexyz/recs").Type.OptionalNumber;
        }, import("@latticexyz/recs").Metadata, undefined>;
        HoverHighlightComponent: import("@latticexyz/recs").Component<{
            x: import("@latticexyz/recs").Type.OptionalNumber;
            y: import("@latticexyz/recs").Type.OptionalNumber;
        }, import("@latticexyz/recs").Metadata, undefined>;
    };
    streams: {
        connectedClients$: import("rxjs").Observable<number>;
        balanceGwei$: BehaviorSubject<number>;
    };
    config: GameConfig;
    relay: {
        event$: import("rxjs").Observable<{
            message: import("@latticexyz/services/protobuf/ts/ecs-relay/ecs-relay").Message;
            address: any;
        }>;
        dispose: () => void;
        subscribe: (label: string) => void;
        unsubscribe: (label: string) => void;
        push: (label: string, data: Uint8Array) => Promise<void>;
        countConnected: () => Promise<number>;
        ping: () => Promise<import("@latticexyz/services/protobuf/ts/ecs-relay/ecs-relay").Identity>;
    } | undefined;
    worldAddress: string;
    ecsEvent$: import("rxjs").Observable<import("@latticexyz/network").NetworkEvent<{
        Position: import("@latticexyz/recs").Component<{
            x: import("@latticexyz/recs").Type.Number;
            y: import("@latticexyz/recs").Type.Number;
            z: import("@latticexyz/recs").Type.Number;
        }, {
            contractId: string;
        }, undefined>;
        ItemPrototype: import("@latticexyz/recs").Component<{
            value: import("@latticexyz/recs").Type.Boolean;
        }, {
            contractId: string;
        }, undefined>;
        Item: import("@latticexyz/recs").Component<{
            value: import("@latticexyz/recs").Type.String;
        }, {
            contractId: string;
        }, undefined>;
        Name: import("@latticexyz/recs").Component<{
            value: import("@latticexyz/recs").Type.String;
        }, {
            contractId: string;
        }, undefined>;
        OwnedBy: import("@latticexyz/recs").Component<{
            value: import("@latticexyz/recs").Type.String;
        }, {
            contractId: string;
        }, undefined>;
        GameConfig: import("@latticexyz/recs").Component<{
            creativeMode: import("@latticexyz/recs").Type.Boolean;
        }, {
            contractId: string;
        }, undefined>;
        Recipe: import("@latticexyz/recs").Component<{
            value: import("@latticexyz/recs").Type.String;
        }, {
            contractId: string;
        }, undefined>;
        LoadingState: import("@latticexyz/recs").Component<{
            state: import("@latticexyz/recs").Type.Number;
            msg: import("@latticexyz/recs").Type.String;
            percentage: import("@latticexyz/recs").Type.Number;
        }, {
            contractId: string;
        }, undefined>;
        Occurrence: import("@latticexyz/recs").Component<{
            contr: import("@latticexyz/recs").Type.String;
            func: import("@latticexyz/recs").Type.String;
        }, {
            contractId: string;
        }, undefined>;
        Stake: import("@latticexyz/recs").Component<{
            value: import("@latticexyz/recs").Type.Number;
        }, {
            contractId: string;
        }, undefined>;
        Claim: import("@latticexyz/recs").Component<{
            stake: import("@latticexyz/recs").Type.Number;
            claimer: import("@latticexyz/recs").Type.Entity;
        }, {
            contractId: string;
        }, undefined>;
        Plugin: import("@latticexyz/recs").Component<{
            host: import("@latticexyz/recs").Type.String;
            source: import("@latticexyz/recs").Type.String;
            path: import("@latticexyz/recs").Type.String;
            active: import("@latticexyz/recs").Type.Boolean;
        }, {
            contractId: string;
        }, undefined>;
        PluginRegistry: import("@latticexyz/recs").Component<{
            value: import("@latticexyz/recs").Type.String;
        }, {
            contractId: string;
        }, undefined>;
    }>>;
    mappings: import("@latticexyz/network").Mappings<{
        Position: import("@latticexyz/recs").Component<{
            x: import("@latticexyz/recs").Type.Number;
            y: import("@latticexyz/recs").Type.Number;
            z: import("@latticexyz/recs").Type.Number;
        }, {
            contractId: string;
        }, undefined>;
        ItemPrototype: import("@latticexyz/recs").Component<{
            value: import("@latticexyz/recs").Type.Boolean;
        }, {
            contractId: string;
        }, undefined>;
        Item: import("@latticexyz/recs").Component<{
            value: import("@latticexyz/recs").Type.String;
        }, {
            contractId: string;
        }, undefined>;
        Name: import("@latticexyz/recs").Component<{
            value: import("@latticexyz/recs").Type.String;
        }, {
            contractId: string;
        }, undefined>;
        OwnedBy: import("@latticexyz/recs").Component<{
            value: import("@latticexyz/recs").Type.String;
        }, {
            contractId: string;
        }, undefined>;
        GameConfig: import("@latticexyz/recs").Component<{
            creativeMode: import("@latticexyz/recs").Type.Boolean;
        }, {
            contractId: string;
        }, undefined>;
        Recipe: import("@latticexyz/recs").Component<{
            value: import("@latticexyz/recs").Type.String;
        }, {
            contractId: string;
        }, undefined>;
        LoadingState: import("@latticexyz/recs").Component<{
            state: import("@latticexyz/recs").Type.Number;
            msg: import("@latticexyz/recs").Type.String;
            percentage: import("@latticexyz/recs").Type.Number;
        }, {
            contractId: string;
        }, undefined>;
        Occurrence: import("@latticexyz/recs").Component<{
            contr: import("@latticexyz/recs").Type.String;
            func: import("@latticexyz/recs").Type.String;
        }, {
            contractId: string;
        }, undefined>;
        Stake: import("@latticexyz/recs").Component<{
            value: import("@latticexyz/recs").Type.Number;
        }, {
            contractId: string;
        }, undefined>;
        Claim: import("@latticexyz/recs").Component<{
            stake: import("@latticexyz/recs").Type.Number;
            claimer: import("@latticexyz/recs").Type.Entity;
        }, {
            contractId: string;
        }, undefined>;
        Plugin: import("@latticexyz/recs").Component<{
            host: import("@latticexyz/recs").Type.String;
            source: import("@latticexyz/recs").Type.String;
            path: import("@latticexyz/recs").Type.String;
            active: import("@latticexyz/recs").Type.Boolean;
        }, {
            contractId: string;
        }, undefined>;
        PluginRegistry: import("@latticexyz/recs").Component<{
            value: import("@latticexyz/recs").Type.String;
        }, {
            contractId: string;
        }, undefined>;
    }>;
    faucet: import("nice-grpc-web").RawClient<import("nice-grpc-web/lib/service-definitions/ts-proto").FromTsProtoServiceDefinition<{
        readonly name: "FaucetService";
        readonly fullName: "faucet.FaucetService";
        readonly methods: {
            readonly drip: {
                readonly name: "Drip";
                readonly requestType: {
                    encode(message: import("@latticexyz/services/protobuf/ts/faucet/faucet").DripRequest, writer?: import("protobufjs").Writer | undefined): import("protobufjs").Writer;
                    decode(input: Uint8Array | import("protobufjs").Reader, length?: number | undefined): import("@latticexyz/services/protobuf/ts/faucet/faucet").DripRequest;
                    fromPartial(object: {
                        username?: string | undefined;
                        address?: string | undefined;
                    }): import("@latticexyz/services/protobuf/ts/faucet/faucet").DripRequest;
                };
                readonly requestStream: false;
                readonly responseType: {
                    encode(message: import("@latticexyz/services/protobuf/ts/faucet/faucet").DripResponse, writer?: import("protobufjs").Writer | undefined): import("protobufjs").Writer;
                    decode(input: Uint8Array | import("protobufjs").Reader, length?: number | undefined): import("@latticexyz/services/protobuf/ts/faucet/faucet").DripResponse;
                    fromPartial(object: {
                        dripTxHash?: string | undefined;
                        ecsTxHash?: string | undefined;
                    }): import("@latticexyz/services/protobuf/ts/faucet/faucet").DripResponse;
                };
                readonly responseStream: false;
                readonly options: {};
            };
            readonly dripDev: {
                readonly name: "DripDev";
                readonly requestType: {
                    encode(message: import("@latticexyz/services/protobuf/ts/faucet/faucet").DripDevRequest, writer?: import("protobufjs").Writer | undefined): import("protobufjs").Writer;
                    decode(input: Uint8Array | import("protobufjs").Reader, length?: number | undefined): import("@latticexyz/services/protobuf/ts/faucet/faucet").DripDevRequest;
                    fromPartial(object: {
                        address?: string | undefined;
                    }): import("@latticexyz/services/protobuf/ts/faucet/faucet").DripDevRequest;
                };
                readonly requestStream: false;
                readonly responseType: {
                    encode(message: import("@latticexyz/services/protobuf/ts/faucet/faucet").DripResponse, writer?: import("protobufjs").Writer | undefined): import("protobufjs").Writer;
                    decode(input: Uint8Array | import("protobufjs").Reader, length?: number | undefined): import("@latticexyz/services/protobuf/ts/faucet/faucet").DripResponse;
                    fromPartial(object: {
                        dripTxHash?: string | undefined;
                        ecsTxHash?: string | undefined;
                    }): import("@latticexyz/services/protobuf/ts/faucet/faucet").DripResponse;
                };
                readonly responseStream: false;
                readonly options: {};
            };
            readonly dripVerifyTweet: {
                readonly name: "DripVerifyTweet";
                readonly requestType: {
                    encode(message: import("@latticexyz/services/protobuf/ts/faucet/faucet").DripVerifyTweetRequest, writer?: import("protobufjs").Writer | undefined): import("protobufjs").Writer;
                    decode(input: Uint8Array | import("protobufjs").Reader, length?: number | undefined): import("@latticexyz/services/protobuf/ts/faucet/faucet").DripVerifyTweetRequest;
                    fromPartial(object: {
                        username?: string | undefined;
                        address?: string | undefined;
                    }): import("@latticexyz/services/protobuf/ts/faucet/faucet").DripVerifyTweetRequest;
                };
                readonly requestStream: false;
                readonly responseType: {
                    encode(message: import("@latticexyz/services/protobuf/ts/faucet/faucet").DripResponse, writer?: import("protobufjs").Writer | undefined): import("protobufjs").Writer;
                    decode(input: Uint8Array | import("protobufjs").Reader, length?: number | undefined): import("@latticexyz/services/protobuf/ts/faucet/faucet").DripResponse;
                    fromPartial(object: {
                        dripTxHash?: string | undefined;
                        ecsTxHash?: string | undefined;
                    }): import("@latticexyz/services/protobuf/ts/faucet/faucet").DripResponse;
                };
                readonly responseStream: false;
                readonly options: {};
            };
            readonly timeUntilDrip: {
                readonly name: "TimeUntilDrip";
                readonly requestType: {
                    encode(message: import("@latticexyz/services/protobuf/ts/faucet/faucet").DripRequest, writer?: import("protobufjs").Writer | undefined): import("protobufjs").Writer;
                    decode(input: Uint8Array | import("protobufjs").Reader, length?: number | undefined): import("@latticexyz/services/protobuf/ts/faucet/faucet").DripRequest;
                    fromPartial(object: {
                        username?: string | undefined;
                        address?: string | undefined;
                    }): import("@latticexyz/services/protobuf/ts/faucet/faucet").DripRequest;
                };
                readonly requestStream: false;
                readonly responseType: {
                    encode(message: import("@latticexyz/services/protobuf/ts/faucet/faucet").TimeUntilDripResponse, writer?: import("protobufjs").Writer | undefined): import("protobufjs").Writer;
                    decode(input: Uint8Array | import("protobufjs").Reader, length?: number | undefined): import("@latticexyz/services/protobuf/ts/faucet/faucet").TimeUntilDripResponse;
                    fromPartial(object: {
                        timeUntilDripMinutes?: number | undefined;
                        timeUntilDripSeconds?: number | undefined;
                    }): import("@latticexyz/services/protobuf/ts/faucet/faucet").TimeUntilDripResponse;
                };
                readonly responseStream: false;
                readonly options: {};
            };
            readonly getLinkedTwitters: {
                readonly name: "GetLinkedTwitters";
                readonly requestType: {
                    encode(_: import("@latticexyz/services/protobuf/ts/faucet/faucet").GetLinkedTwittersRequest, writer?: import("protobufjs").Writer | undefined): import("protobufjs").Writer;
                    decode(input: Uint8Array | import("protobufjs").Reader, length?: number | undefined): import("@latticexyz/services/protobuf/ts/faucet/faucet").GetLinkedTwittersRequest;
                    fromPartial(_: {}): import("@latticexyz/services/protobuf/ts/faucet/faucet").GetLinkedTwittersRequest;
                };
                readonly requestStream: false;
                readonly responseType: {
                    encode(message: import("@latticexyz/services/protobuf/ts/faucet/faucet").GetLinkedTwittersResponse, writer?: import("protobufjs").Writer | undefined): import("protobufjs").Writer;
                    decode(input: Uint8Array | import("protobufjs").Reader, length?: number | undefined): import("@latticexyz/services/protobuf/ts/faucet/faucet").GetLinkedTwittersResponse;
                    fromPartial(object: {
                        linkedTwitters?: {
                            username?: string | undefined;
                            address?: string | undefined;
                        }[] | undefined;
                    }): import("@latticexyz/services/protobuf/ts/faucet/faucet").GetLinkedTwittersResponse;
                };
                readonly responseStream: false;
                readonly options: {};
            };
            readonly getLinkedTwitterForAddress: {
                readonly name: "GetLinkedTwitterForAddress";
                readonly requestType: {
                    encode(message: import("@latticexyz/services/protobuf/ts/faucet/faucet").LinkedTwitterForAddressRequest, writer?: import("protobufjs").Writer | undefined): import("protobufjs").Writer;
                    decode(input: Uint8Array | import("protobufjs").Reader, length?: number | undefined): import("@latticexyz/services/protobuf/ts/faucet/faucet").LinkedTwitterForAddressRequest;
                    fromPartial(object: {
                        address?: string | undefined;
                    }): import("@latticexyz/services/protobuf/ts/faucet/faucet").LinkedTwitterForAddressRequest;
                };
                readonly requestStream: false;
                readonly responseType: {
                    encode(message: import("@latticexyz/services/protobuf/ts/faucet/faucet").LinkedTwitterForAddressResponse, writer?: import("protobufjs").Writer | undefined): import("protobufjs").Writer;
                    decode(input: Uint8Array | import("protobufjs").Reader, length?: number | undefined): import("@latticexyz/services/protobuf/ts/faucet/faucet").LinkedTwitterForAddressResponse;
                    fromPartial(object: {
                        username?: string | undefined;
                    }): import("@latticexyz/services/protobuf/ts/faucet/faucet").LinkedTwitterForAddressResponse;
                };
                readonly responseStream: false;
                readonly options: {};
            };
            readonly getLinkedAddressForTwitter: {
                readonly name: "GetLinkedAddressForTwitter";
                readonly requestType: {
                    encode(message: import("@latticexyz/services/protobuf/ts/faucet/faucet").LinkedAddressForTwitterRequest, writer?: import("protobufjs").Writer | undefined): import("protobufjs").Writer;
                    decode(input: Uint8Array | import("protobufjs").Reader, length?: number | undefined): import("@latticexyz/services/protobuf/ts/faucet/faucet").LinkedAddressForTwitterRequest;
                    fromPartial(object: {
                        username?: string | undefined;
                    }): import("@latticexyz/services/protobuf/ts/faucet/faucet").LinkedAddressForTwitterRequest;
                };
                readonly requestStream: false;
                readonly responseType: {
                    encode(message: import("@latticexyz/services/protobuf/ts/faucet/faucet").LinkedAddressForTwitterResponse, writer?: import("protobufjs").Writer | undefined): import("protobufjs").Writer;
                    decode(input: Uint8Array | import("protobufjs").Reader, length?: number | undefined): import("@latticexyz/services/protobuf/ts/faucet/faucet").LinkedAddressForTwitterResponse;
                    fromPartial(object: {
                        address?: string | undefined;
                    }): import("@latticexyz/services/protobuf/ts/faucet/faucet").LinkedAddressForTwitterResponse;
                };
                readonly responseStream: false;
                readonly options: {};
            };
        };
    }>, {}> | undefined;
    uniqueWorldId: string;
    types: {
        BlockIdToKey: {
            [key: EntityID]: "Bedrock" | "BlackFlower" | "BlueFlower" | "Clay" | "Coal" | "CyanFlower" | "Diamond" | "Dirt" | "Grass" | "GrassPlant" | "GrayFlower" | "GreenFlower" | "Kelp" | "Leaves" | "LightBlueFlower" | "LightGrayFlower" | "LimeFlower" | "Log" | "MagentaFlower" | "OrangeFlower" | "PinkFlower" | "PurpleFlower" | "RedFlower" | "Sand" | "Snow" | "Stone" | "Water" | "Wool" | "Air" | "Glass" | "Cobblestone" | "MossyCobblestone" | "Crafting" | "Iron" | "Gold" | "Planks" | "OrangeWool" | "MagentaWool" | "LightBlueWool" | "YellowWool" | "LimeWool" | "PinkWool" | "GrayWool" | "LightGrayWool" | "CyanWool" | "PurpleWool" | "BlueWool" | "BrownWool" | "GreenWool" | "RedWool" | "BlackWool" | "Sponge" | "Bricks";
        };
        BlockType: {
            Air: EntityID;
            Grass: EntityID;
            Dirt: EntityID;
            Log: EntityID;
            Stone: EntityID;
            Sand: EntityID;
            Glass: EntityID;
            Water: EntityID;
            Cobblestone: EntityID;
            MossyCobblestone: EntityID;
            Coal: EntityID;
            Crafting: EntityID;
            Iron: EntityID;
            Gold: EntityID;
            Diamond: EntityID;
            Leaves: EntityID;
            Planks: EntityID;
            RedFlower: EntityID;
            GrassPlant: EntityID;
            OrangeFlower: EntityID;
            MagentaFlower: EntityID;
            LightBlueFlower: EntityID;
            LimeFlower: EntityID;
            PinkFlower: EntityID;
            GrayFlower: EntityID;
            LightGrayFlower: EntityID;
            CyanFlower: EntityID;
            PurpleFlower: EntityID;
            BlueFlower: EntityID;
            GreenFlower: EntityID;
            BlackFlower: EntityID;
            Kelp: EntityID;
            Wool: EntityID;
            OrangeWool: EntityID;
            MagentaWool: EntityID;
            LightBlueWool: EntityID;
            YellowWool: EntityID;
            LimeWool: EntityID;
            PinkWool: EntityID;
            GrayWool: EntityID;
            LightGrayWool: EntityID;
            CyanWool: EntityID;
            PurpleWool: EntityID;
            BlueWool: EntityID;
            BrownWool: EntityID;
            GreenWool: EntityID;
            RedWool: EntityID;
            BlackWool: EntityID;
            Sponge: EntityID;
            Snow: EntityID;
            Clay: EntityID;
            Bedrock: EntityID;
            Bricks: EntityID;
        };
    };
}>;
type NoaLayer = Awaited<ReturnType<typeof createNoaLayer>>;
declare function createNoaLayer(network: NetworkLayer): {
    world: {
        registerDisposer: (disposer: () => void) => void;
        dispose: () => void;
        entities: EntityID[];
        entityToIndex: Map<EntityID, EntityIndex>;
        registerEntity: ({ id, idSuffix }?: {
            id?: EntityID | undefined;
            idSuffix?: string | undefined;
        } | undefined) => EntityIndex;
        components: import("@latticexyz/recs").Component<import("@latticexyz/recs").Schema, import("@latticexyz/recs").Metadata, undefined>[];
        registerComponent: (component: import("@latticexyz/recs").Component<import("@latticexyz/recs").Schema, import("@latticexyz/recs").Metadata, undefined>) => void;
        getEntityIndexStrict: (entity: EntityID) => EntityIndex;
        hasEntity: (entity: EntityID) => boolean;
    };
    components: {
        SelectedSlot: import("@latticexyz/recs").Component<{
            value: import("@latticexyz/recs").Type.Number;
        }, import("@latticexyz/recs").Metadata, undefined>;
        CraftingTable: import("@latticexyz/recs").Component<{
            value: import("@latticexyz/recs").Type.NumberArray;
        }, import("@latticexyz/recs").Metadata, undefined>;
        PlayerPosition: import("@latticexyz/recs").Component<{
            x: import("@latticexyz/recs").Type.Number;
            y: import("@latticexyz/recs").Type.Number;
            z: import("@latticexyz/recs").Type.Number;
        }, import("@latticexyz/recs").Metadata, undefined>;
        LocalPlayerPosition: import("@latticexyz/recs").Component<{
            x: import("@latticexyz/recs").Type.Number;
            y: import("@latticexyz/recs").Type.Number;
            z: import("@latticexyz/recs").Type.Number;
        }, import("@latticexyz/recs").Metadata, undefined>;
        PlayerRelayerChunkPosition: import("@latticexyz/recs").Indexer<{
            x: import("@latticexyz/recs").Type.Number;
            y: import("@latticexyz/recs").Type.Number;
        }, import("@latticexyz/recs").Metadata, undefined>;
        PlayerDirection: import("@latticexyz/recs").Component<{
            qx: import("@latticexyz/recs").Type.Number;
            qy: import("@latticexyz/recs").Type.Number;
            qz: import("@latticexyz/recs").Type.Number;
            qw: import("@latticexyz/recs").Type.Number;
        }, import("@latticexyz/recs").Metadata, undefined>;
        PlayerLastMessage: import("@latticexyz/recs").Component<{
            value: import("@latticexyz/recs").Type.Number;
        }, import("@latticexyz/recs").Metadata, undefined>;
        PlayerMesh: import("@latticexyz/recs").Component<{
            value: import("@latticexyz/recs").Type.Boolean;
        }, import("@latticexyz/recs").Metadata, undefined>;
        UI: import("@latticexyz/recs").Component<{
            showComponentBrowser: import("@latticexyz/recs").Type.Boolean;
            showInventory: import("@latticexyz/recs").Type.Boolean;
            showCrafting: import("@latticexyz/recs").Type.Boolean;
            showPlugins: import("@latticexyz/recs").Type.Boolean;
        }, import("@latticexyz/recs").Metadata, undefined>;
        InventoryIndex: import("@latticexyz/recs").Component<{
            value: import("@latticexyz/recs").Type.Number;
        }, import("@latticexyz/recs").Metadata, undefined>;
        Tutorial: import("@latticexyz/recs").Component<{
            community: import("@latticexyz/recs").Type.Boolean;
            mine: import("@latticexyz/recs").Type.Boolean;
            build: import("@latticexyz/recs").Type.Boolean;
            craft: import("@latticexyz/recs").Type.Boolean;
            claim: import("@latticexyz/recs").Type.Boolean;
            inventory: import("@latticexyz/recs").Type.Boolean;
            moving: import("@latticexyz/recs").Type.Boolean;
            teleport: import("@latticexyz/recs").Type.Boolean;
        }, import("@latticexyz/recs").Metadata, undefined>;
        PreTeleportPosition: import("@latticexyz/recs").Component<{
            x: import("@latticexyz/recs").Type.Number;
            y: import("@latticexyz/recs").Type.Number;
            z: import("@latticexyz/recs").Type.Number;
        }, import("@latticexyz/recs").Metadata, undefined>;
        Sounds: import("@latticexyz/recs").Component<{
            themes: import("@latticexyz/recs").Type.OptionalStringArray;
            playingTheme: import("@latticexyz/recs").Type.OptionalString;
            volume: import("@latticexyz/recs").Type.OptionalNumber;
        }, import("@latticexyz/recs").Metadata, undefined>;
    };
    mudToNoaId: Map<number, number>;
    noa: import("noa-engine").Engine;
    api: {
        setBlock: (coord: number[] | VoxelCoord, block: EntityID) => void;
        setCraftingTable: (entities: EntityIndex[][]) => void;
        getCraftingTable: () => EntityIndex[][];
        clearCraftingTable: () => void;
        setCraftingTableIndex: (index: [number, number], entity: EntityIndex | undefined) => void;
        getSelectedBlockType: () => EntityID | undefined;
        getTrimmedCraftingTable: () => {
            items: EntityID[][];
            types: EntityID[][];
        };
        getCraftingResult: () => EntityID | undefined;
        teleport: (coord: VoxelCoord) => void;
        teleportRandom: () => void;
        toggleInventory: (open?: boolean, crafting?: boolean) => void;
        togglePlugins: (open?: boolean) => void;
        placeSelectedItem: (coord: VoxelCoord) => void;
        getCurrentChunk: () => Coord;
        getCurrentPlayerPosition: () => VoxelCoord;
        getStakeAndClaim: (chunk: Coord) => {
            claim: import("@latticexyz/recs").ComponentValue<{
                stake: import("@latticexyz/recs").Type.Number;
                claimer: import("@latticexyz/recs").Type.Entity;
            }, undefined> | undefined;
            stake: import("@latticexyz/recs").ComponentValue<{
                value: import("@latticexyz/recs").Type.Number;
            }, undefined> | undefined;
        };
        playRandomTheme: () => void;
        playNextTheme: () => void;
    };
    streams: {
        playerPosition$: BehaviorSubject<VoxelCoord>;
        slowPlayerPosition$: import("rxjs").Observable<VoxelCoord>;
        playerChunk$: BehaviorSubject<Coord>;
        stakeAndClaim$: BehaviorSubject<{
            claim: import("@latticexyz/recs").ComponentValue<{
                stake: import("@latticexyz/recs").Type.Number;
                claimer: import("@latticexyz/recs").Type.Entity;
            }, undefined> | undefined;
            stake: import("@latticexyz/recs").ComponentValue<{
                value: import("@latticexyz/recs").Type.Number;
            }, undefined> | undefined;
        }>;
    };
    SingletonEntity: EntityIndex;
    audioEngine: import("@babylonjs/core").Nullable<import("@babylonjs/core").IAudioEngine>;
};
declare global {
    interface String {
        mb_length(): number;
        mb_substr(from: number, length?: number): string;
        mb_split(): string[];
        has_emoji(): boolean;
        encode(): string;
        decode(): string;
    }
}
declare const ecs: {
    setComponent: typeof setComponent;
    removeComponent: typeof removeComponent;
    getComponentValue: typeof getComponentValue;
    getComponentEntities: typeof getComponentEntities;
    runQuery: typeof runQuery;
    Has: typeof Has;
    HasValue: typeof HasValue;
    Not: typeof Not;
    NotValue: typeof NotValue;
};
export type Layers = {
    network: NetworkLayer;
    noa: NoaLayer;
};
export type Window = typeof window & {
    layers: Layers;
    ecs: typeof ecs;
    remountReact: () => Promise<void>;
};

//# sourceMappingURL=index.d.ts.map
