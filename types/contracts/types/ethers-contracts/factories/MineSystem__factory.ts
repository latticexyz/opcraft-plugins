/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { MineSystem, MineSystemInterface } from "../MineSystem";

const _abi = [
  {
    inputs: [
      {
        internalType: "contract IWorld",
        name: "_world",
        type: "address",
      },
      {
        internalType: "address",
        name: "_components",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "arguments",
        type: "bytes",
      },
    ],
    name: "execute",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "int32",
            name: "x",
            type: "int32",
          },
          {
            internalType: "int32",
            name: "y",
            type: "int32",
          },
          {
            internalType: "int32",
            name: "z",
            type: "int32",
          },
        ],
        internalType: "struct VoxelCoord",
        name: "coord",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "blockType",
        type: "uint256",
      },
    ],
    name: "executeTyped",
    outputs: [
      {
        internalType: "uint256",
        name: "minedEntity",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export class MineSystem__factory {
  static readonly abi = _abi;
  static createInterface(): MineSystemInterface {
    return new utils.Interface(_abi) as MineSystemInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MineSystem {
    return new Contract(address, _abi, signerOrProvider) as MineSystem;
  }
}
