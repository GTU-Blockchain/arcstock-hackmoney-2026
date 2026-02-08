// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Test.sol";

/**
 * Fork test to debug transferFromCompany revert on Arc.
 * Run: forge test --match-test testTransferFromCompany --fork-url https://rpc.testnet.arc.network -vvvv
 */
contract TransferFromCompanyForkTest is Test {
    address constant REGISTRY = 0xb9d66859BFDb385584958eB340a8951a2063c129;
    address constant BACKEND = 0xa6DF8FB66EFA30623fAA26864dde38A1eA32247c;
    address constant INVESTOR = 0xA560BeF8F63abf72f5D6A9dD8EE82C34836091b1;
    uint256 constant AMOUNT = 43420609000000000000; // ~43.42 shares

    function testTransferFromCompany() external {
        // Call EquityToken.transferFrom directly as Registry - this works
        address token = 0x995e2087F04f3119FE7dDb2df93241197b210777;
        address companyWallet = 0x6B881932572c051a629C561Dc79ca4CE26A730ec;
        vm.prank(REGISTRY);
        (bool ok1,) = token.call(
            abi.encodeWithSignature("transferFrom(address,address,uint256)", companyWallet, INVESTOR, AMOUNT)
        );
        assertTrue(ok1, "token.transferFrom should succeed");
    }

    // Backend calls EquityToken.transferFrom(companyWallet, investor, amount) directly.
    // Requires companyWallet to approve backend first.
    function testDirectTransferFrom() external {
        address token = 0x995e2087F04f3119FE7dDb2df93241197b210777;
        address companyWallet = 0x6B881932572c051a629C561Dc79ca4CE26A730ec;
        // Company wallet approves backend
        vm.prank(companyWallet);
        IERC20(token).approve(BACKEND, type(uint256).max);
        // Backend transfers from pool to investor
        vm.prank(BACKEND);
        IERC20(token).transferFrom(companyWallet, INVESTOR, AMOUNT);
        assertEq(IERC20(token).balanceOf(INVESTOR), AMOUNT);
    }
}

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}
