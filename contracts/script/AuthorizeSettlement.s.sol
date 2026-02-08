// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Script.sol";
import "../src/EquityRegistry.sol";

/**
 * Authorize the settlement backend to call transferFromCompany.
 * Run as registry owner: forge script script/AuthorizeSettlement.s.sol --rpc-url $ARC_RPC --broadcast
 * Env: PRIVATE_KEY (owner), EQUITY_REGISTRY, SETTLEMENT_BACKEND (address to authorize)
 */
contract AuthorizeSettlement is Script {
    function run() external {
        address registryAddr = vm.envAddress("EQUITY_REGISTRY");
        address backend = vm.envAddress("SETTLEMENT_BACKEND");
        uint256 ownerKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(ownerKey);
        EquityRegistry registry = EquityRegistry(registryAddr);
        registry.setAuthorizedMinter(backend, true);
        vm.stopBroadcast();

        console.log("Authorized", backend, "as minter on EquityRegistry", registryAddr);
    }
}
