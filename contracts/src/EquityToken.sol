// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title EquityToken
 * @notice ERC20 token representing company shares. Equity lives only on Arc.
 * @dev Uses "cancel" for supply reduction (board-approved buybacks), not "burn".
 */
contract EquityToken is ERC20 {
    uint256 public immutable companyId;
    address public minter;

    event Minted(address indexed to, uint256 amount);
    event Cancelled(address indexed from, uint256 amount);

    error Unauthorized();
    error InvalidAddress();

    modifier onlyMinter() {
        if (msg.sender != minter) revert Unauthorized();
        _;
    }

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 companyId_,
        address minter_
    ) ERC20(name_, symbol_) {
        if (companyId_ == 0 || minter_ == address(0)) revert InvalidAddress();
        companyId = companyId_;
        minter = minter_;
    }

    /**
     * @notice Mint new shares (issuance). Only minter (company/agent) can call.
     */
    function mint(address to, uint256 amount) external onlyMinter {
        if (to == address(0)) revert InvalidAddress();
        if (amount == 0) return;

        _mint(to, amount);
        emit Minted(to, amount);
    }

    /**
     * @notice Cancel shares (board-approved buyback). Reduces supply.
     */
    function cancel(address from, uint256 amount) external onlyMinter {
        if (from == address(0)) revert InvalidAddress();
        if (amount == 0) return;

        _burn(from, amount);
        emit Cancelled(from, amount);
    }

    function setMinter(address newMinter) external onlyMinter {
        if (newMinter == address(0)) revert InvalidAddress();
        minter = newMinter;
    }
}
