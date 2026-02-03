// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../src/Treasury.sol";
import "../src/MockUSDC.sol";

contract TreasuryTest is Test {
    Treasury treasury;
    MockUSDC usdc;

    address owner = address(0x1);
    address depositor = address(0x2);
    address recipient = address(0x3);

    function setUp() public {
        usdc = new MockUSDC();
        usdc.mint(depositor, 1_000_000e6);

        vm.prank(owner);
        treasury = new Treasury(address(0x99), address(usdc));
    }

    function test_Deposit() public {
        vm.prank(depositor);
        usdc.approve(address(treasury), 1000e6);

        vm.prank(depositor);
        treasury.deposit(1, 1000e6);

        assertEq(treasury.getBalance(1), 1000e6);
        assertEq(usdc.balanceOf(address(treasury)), 1000e6);
    }

    function test_Withdraw() public {
        vm.prank(depositor);
        usdc.approve(address(treasury), 1000e6);
        vm.prank(depositor);
        treasury.deposit(1, 1000e6);

        vm.prank(owner);
        treasury.withdraw(1, recipient, 500e6);

        assertEq(treasury.getBalance(1), 500e6);
        assertEq(usdc.balanceOf(recipient), 500e6);
    }

    function test_WithdrawRevertsWhenNotOwner() public {
        vm.prank(depositor);
        usdc.approve(address(treasury), 1000e6);
        vm.prank(depositor);
        treasury.deposit(1, 1000e6);

        vm.prank(depositor);
        vm.expectRevert(Treasury.Unauthorized.selector);
        treasury.withdraw(1, recipient, 500e6);
    }
}
