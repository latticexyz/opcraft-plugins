// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;

import {addressToEntity, getAddressById} from "@latticexyz/solecs/src/utils.sol";
import {VoxelCoord, Coord} from "./types.sol";
import {MineSystem, ID as MineSystemID} from "./systems/MineSystem.sol";
import {TransferSystem, ID as TransferSystemID} from "./systems/TransferSystem.sol";
import {StakeSystem, ID as StakeSystemID} from "./systems/StakeSystem.sol";
import {World} from "@latticexyz/solecs/src/World.sol";
import {IUint256Component} from "@latticexyz/solecs/src/interfaces/IUint256Component.sol";

contract Multi2 {
    MineSystem public mineSystem;
    TransferSystem public transferSystem;
    StakeSystem public stakeSystem;

    constructor(address worldAddress) {
        World world = World(worldAddress);
        IUint256Component systems = world.systems();
        mineSystem = MineSystem(getAddressById(systems, MineSystemID));
        transferSystem = TransferSystem( getAddressById(systems, TransferSystemID));
        stakeSystem = StakeSystem(getAddressById(systems, StakeSystemID));
    }

    function mineAndStake(
        string calldata blockName, // like `block.Diamond`
        VoxelCoord[] calldata coords,
        Coord calldata chunk
    ) public {
        uint256 id = uint256(keccak256(abi.encodePacked(blockName)));
        for (uint256 i = 0; i < coords.length; i++) {
            try mineSystem.executeTyped(coords[i], id) returns (uint256 entityID) {
                stakeSystem.executeTyped(entityID, chunk);
            } catch {
                // ignore
            }
        }
    }
}
