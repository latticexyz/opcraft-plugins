// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;

import {addressToEntity, getAddressById} from "@latticexyz/solecs/src/utils.sol";
import {VoxelCoord, Coord} from "./types.sol";
import {MineSystem, ID as MineSystemID} from "./systems/MineSystem.sol";
import {TransferSystem, ID as TransferSystemID} from "./systems/TransferSystem.sol";
import {StakeSystem, ID as StakeSystemID} from "./systems/StakeSystem.sol";
import {ClaimSystem, ID as ClaimSystemID} from "./systems/ClaimSystem.sol";
import {World} from "@latticexyz/solecs/src/World.sol";
import {IUint256Component} from "@latticexyz/solecs/src/interfaces/IUint256Component.sol";

// https://blockscout.com/optimism/opcraft/tx/0xc58c69d568732de026966c5fae3bebd27625293a5919b05805f1108a8b4b3379
// 0x8d95d8c1b238d9f9627b3a86cd0ea68a3caa058a

contract Multi {
    MineSystem public mineSystem;
    TransferSystem public transferSystem;
    StakeSystem public stakeSystem;
    ClaimSystem public claimSystem;

    constructor(address worldAddress) {
        World world = World(worldAddress);
        IUint256Component systems = world.systems();
        mineSystem = MineSystem(getAddressById(systems, MineSystemID));
        transferSystem = TransferSystem( getAddressById(systems, TransferSystemID));
        stakeSystem = StakeSystem(getAddressById(systems, StakeSystemID));
        claimSystem = ClaimSystem(getAddressById(systems, ClaimSystemID));
    }

    function mine(
        string calldata blockName, // like `block.Diamond`
        VoxelCoord[] calldata coords
    ) public {
        uint256 id = uint256(keccak256(abi.encodePacked(blockName)));
        for (uint256 i = 0; i < coords.length; i++) {
            try mineSystem.executeTyped(coords[i], id) {
                // do nothing
            } catch {
                // ignore
            }
        }
    }

    function mineTo(
        address to,
        string calldata blockName, // like `block.Diamond`
        VoxelCoord[] calldata coords
    ) public {
        uint256 id = uint256(keccak256(abi.encodePacked(blockName)));
        for (uint256 i = 0; i < coords.length; i++) {
            try mineSystem.executeTyped(coords[i], id) returns (uint256 entityID) {
                transferSystem.executeTyped(entityID, addressToEntity(to));
            } catch {
                // ignore
            }
        }
    }

    // must be called by entity owner (because msg.sender is checked in stake system)
    function stake(Coord calldata chunk, uint256[] calldata entities) public {
        for (uint256 i = 0; i < entities.length; i++) {
            try stakeSystem.executeTyped(entities[i], chunk) {
              // do nothing
            } catch {
              // ignore
            }
        }
        claimSystem.executeTyped(chunk);
    }

    function mineToAndStake(
        address to,
        string calldata blockName, // like `block.Diamond`
        VoxelCoord[] calldata coords,
        Coord calldata chunk
    ) public {
        uint256 id = uint256(keccak256(abi.encodePacked(blockName)));
        for (uint256 i = 0; i < coords.length; i++) {
            try mineSystem.executeTyped(coords[i], id) returns (uint256 entityID) {
                transferSystem.executeTyped(entityID, addressToEntity(to));
                stakeSystem.executeTyped(entityID, chunk);
            } catch {
                // ignore
            }
        }
        claimSystem.executeTyped(chunk);
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
        claimSystem.executeTyped(chunk);
    }
}
