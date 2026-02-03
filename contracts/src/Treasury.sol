// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/**
 * @title Treasury
 * @notice Holds USDC raised from investors, tracked per company. Used for dividends and corporate actions.
 * @dev USDC on Arc Testnet: 0x3600000000000000000000000000000000000000 (6 decimals)
 */
contract Treasury {
    address public immutable usdc;

    address public owner;
    address public equityRegistry;
    mapping(uint256 => uint256) public companyBalance;

    event Deposited(uint256 indexed companyId, uint256 amount);
    event Withdrawn(uint256 indexed companyId, address indexed to, uint256 amount);

    error Unauthorized();
    error InvalidAddress();
    error CompanyNotFound();
    error InsufficientBalance();
    error TransferFailed();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor(address equityRegistry_, address usdc_) {
        owner = msg.sender;
        equityRegistry = equityRegistry_;
        usdc = usdc_ == address(0) ? 0x3600000000000000000000000000000000000000 : usdc_;
    }

    /**
     * @notice Deposit USDC for a company. Called when investment settles (from Circle Gateway flow).
     */
    function deposit(uint256 companyId, uint256 amount) external {
        if (companyId == 0) revert CompanyNotFound();
        if (amount == 0) return;

        companyBalance[companyId] += amount;

        bool ok = _transferFrom(msg.sender, address(this), amount);
        if (!ok) revert TransferFailed();

        emit Deposited(companyId, amount);
    }

    /**
     * @notice Withdraw USDC (e.g. for dividend payout). Only owner or authorized.
     */
    function withdraw(uint256 companyId, address to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert InvalidAddress();
        if (companyBalance[companyId] < amount) revert InsufficientBalance();

        companyBalance[companyId] -= amount;

        bool ok = _transfer(to, amount);
        if (!ok) revert TransferFailed();

        emit Withdrawn(companyId, to, amount);
    }

    function getBalance(uint256 companyId) external view returns (uint256) {
        return companyBalance[companyId];
    }

    function setEquityRegistry(address newRegistry) external onlyOwner {
        if (newRegistry == address(0)) revert InvalidAddress();
        equityRegistry = newRegistry;
    }

    function setOwner(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidAddress();
        owner = newOwner;
    }

    function _transfer(address to, uint256 amount) internal returns (bool) {
        (bool ok,) = usdc.call(
            abi.encodeWithSignature("transfer(address,uint256)", to, amount)
        );
        return ok;
    }

    function _transferFrom(address from, address to, uint256 amount) internal returns (bool) {
        (bool ok,) = usdc.call(
            abi.encodeWithSignature("transferFrom(address,address,uint256)", from, to, amount)
        );
        return ok;
    }
}
