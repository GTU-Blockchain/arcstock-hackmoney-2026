// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../src/EquityRegistry.sol";
import "../src/EquityToken.sol";

contract EquityRegistryTest is Test {
    EquityRegistry registry;
    address owner = address(0x1);
    address agent = address(0x2);
    address companyWallet = address(0x3);
    address investor = address(0x4);

    function setUp() public {
        vm.prank(owner);
        registry = new EquityRegistry();
    }

    function test_RegisterCompany() public {
        vm.prank(owner);
        (uint256 companyId, address equityToken) = registry.registerCompany(
            "Acme Corp",
            "ACME",
            "ipfs://acme-metadata",
            companyWallet
        );

        assertEq(companyId, 1);
        assertTrue(equityToken != address(0));

        (uint256 id, string memory name, string memory symbol,, address token,, bool active) =
            registry.companies(companyId);
        assertEq(id, 1);
        assertEq(name, "Acme Corp");
        assertEq(symbol, "ACME");
        assertEq(token, equityToken);
        assertTrue(active);

        assertEq(registry.tokenToCompany(equityToken), 1);
        assertEq(EquityToken(equityToken).totalSupply(), 0);
    }

    function test_MintShares() public {
        vm.prank(owner);
        (uint256 companyId, address equityToken) = registry.registerCompany(
            "Acme",
            "ACME",
            "",
            companyWallet
        );

        vm.prank(owner);
        registry.mintShares(companyId, investor, 500e18);

        assertEq(EquityToken(equityToken).balanceOf(investor), 500e18);
        assertEq(registry.getTotalSupply(companyId), 500e18);
    }

    function test_MintSharesViaAuthorizedMinter() public {
        vm.prank(owner);
        (uint256 companyId, address equityToken) = registry.registerCompany(
            "Acme",
            "ACME",
            "",
            companyWallet
        );

        vm.prank(owner);
        registry.setAuthorizedMinter(agent, true);

        vm.prank(agent);
        registry.mintShares(companyId, investor, 100e18);

        assertEq(EquityToken(equityToken).balanceOf(investor), 100e18);
    }

    function test_CancelShares() public {
        vm.prank(owner);
        (uint256 companyId, address equityToken) = registry.registerCompany(
            "Acme",
            "ACME",
            "",
            companyWallet
        );

        vm.prank(owner);
        registry.mintShares(companyId, investor, 1000e18);

        vm.prank(owner);
        registry.cancelShares(companyId, investor, 300e18);

        assertEq(EquityToken(equityToken).balanceOf(investor), 700e18);
        assertEq(registry.getTotalSupply(companyId), 700e18);
    }

    function test_RevertWhenUnauthorizedMint() public {
        vm.prank(owner);
        (uint256 companyId,) = registry.registerCompany("Acme", "ACME", "", companyWallet);

        vm.prank(investor);
        vm.expectRevert(EquityRegistry.Unauthorized.selector);
        registry.mintShares(companyId, investor, 100e18);
    }
}
