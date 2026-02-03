// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Script.sol";
import "../src/EquityRegistry.sol";
import "../src/Treasury.sol";

contract DeployRWA is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        EquityRegistry registry = new EquityRegistry();
        Treasury treasury = new Treasury(address(registry), address(0)); // address(0) = Arc USDC

        vm.stopBroadcast();

        console.log("EquityRegistry:", address(registry));
        console.log("Treasury:", address(treasury));
    }
}
