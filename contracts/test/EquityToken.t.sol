// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../src/EquityToken.sol";
import "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";

contract EquityTokenTest is Test {
    EquityToken token;
    address minter = address(0x1);
    address alice = address(0x2);
    address bob = address(0x3);

    function setUp() public {
        vm.prank(minter);
        token = new EquityToken("Acme Corp", "ACME", 1, minter);
    }

    function test_InitialState() public view {
        assertEq(token.name(), "Acme Corp");
        assertEq(token.symbol(), "ACME");
        assertEq(token.decimals(), 18);
        assertEq(token.totalSupply(), 0);
        assertEq(token.companyId(), 1);
        assertEq(token.minter(), minter);
    }

    function test_Mint() public {
        vm.prank(minter);
        token.mint(alice, 1000e18);

        assertEq(token.balanceOf(alice), 1000e18);
        assertEq(token.totalSupply(), 1000e18);
    }

    function test_MintRevertsWhenNotMinter() public {
        vm.prank(alice);
        vm.expectRevert(EquityToken.Unauthorized.selector);
        token.mint(alice, 1000e18);
    }

    function test_Transfer() public {
        vm.prank(minter);
        token.mint(alice, 1000e18);

        vm.prank(alice);
        token.transfer(bob, 300e18);

        assertEq(token.balanceOf(alice), 700e18);
        assertEq(token.balanceOf(bob), 300e18);
    }

    function test_Cancel() public {
        vm.prank(minter);
        token.mint(alice, 1000e18);

        vm.prank(minter);
        token.cancel(alice, 400e18);

        assertEq(token.balanceOf(alice), 600e18);
        assertEq(token.totalSupply(), 600e18);
    }

    function test_CancelRevertsWhenNotMinter() public {
        vm.prank(minter);
        token.mint(alice, 1000e18);

        vm.prank(alice);
        vm.expectRevert(EquityToken.Unauthorized.selector);
        token.cancel(alice, 100e18);
    }

    function test_CancelRevertsWhenInsufficientBalance() public {
        vm.prank(minter);
        token.mint(alice, 100e18);

        vm.prank(minter);
        vm.expectRevert(
            abi.encodeWithSelector(
                IERC20Errors.ERC20InsufficientBalance.selector,
                alice,
                100e18,
                200e18
            )
        );
        token.cancel(alice, 200e18);
    }
}
