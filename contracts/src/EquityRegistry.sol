// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./EquityToken.sol";

/**
 * @title EquityRegistry
 * @notice Registers companies and deploys EquityToken contracts. Canonical source for RWA metadata.
 */
contract EquityRegistry {
    struct Company {
        uint256 id;
        string name;
        string symbol;
        string metadataUri;
        address equityToken;
        address companyWallet;
        bool active;
    }

    uint256 public nextCompanyId = 1;
    mapping(uint256 => Company) public companies;
    mapping(address => uint256) public tokenToCompany;

    address public owner;
    mapping(address => bool) public authorizedMinters;

    event CompanyRegistered(
        uint256 indexed companyId,
        string name,
        string symbol,
        address equityToken,
        address companyWallet
    );
    event AuthorizedMinterSet(address indexed account, bool authorized);

    error Unauthorized();
    error InvalidAddress();
    error CompanyNotFound();
    error CompanyInactive();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyAuthorized() {
        if (!authorizedMinters[msg.sender] && msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Register a new company and deploy its EquityToken
     */
    function registerCompany(
        string calldata name_,
        string calldata symbol_,
        string calldata metadataUri_,
        address companyWallet_
    ) external onlyOwner returns (uint256 companyId, address equityToken) {
        if (companyWallet_ == address(0)) revert InvalidAddress();

        companyId = nextCompanyId++;
        equityToken = address(
            new EquityToken(name_, symbol_, companyId, address(this))
        );

        companies[companyId] = Company({
            id: companyId,
            name: name_,
            symbol: symbol_,
            metadataUri: metadataUri_,
            equityToken: equityToken,
            companyWallet: companyWallet_,
            active: true
        });

        tokenToCompany[equityToken] = companyId;

        emit CompanyRegistered(companyId, name_, symbol_, equityToken, companyWallet_);
    }

    /**
     * @notice Mint shares for a company. Called by agent/company for issuance.
     */
    function mintShares(uint256 companyId_, address to, uint256 amount) external onlyAuthorized {
        Company storage c = companies[companyId_];
        if (c.id == 0) revert CompanyNotFound();
        if (!c.active) revert CompanyInactive();

        EquityToken(c.equityToken).mint(to, amount);
    }

    /**
     * @notice Transfer shares from company wallet to investor. Used when selling from company pool.
     * Company wallet must have approved this registry via EquityToken.approve(registry, amount).
     */
    function transferFromCompany(uint256 companyId_, address to, uint256 amount) external onlyAuthorized {
        Company storage c = companies[companyId_];
        if (c.id == 0) revert CompanyNotFound();
        if (!c.active) revert CompanyInactive();

        EquityToken(c.equityToken).transferFrom(c.companyWallet, to, amount);
    }

    /**
     * @notice Cancel shares (buyback). Called by agent when executing board-approved buyback.
     */
    function cancelShares(uint256 companyId_, address from, uint256 amount) external onlyAuthorized {
        Company storage c = companies[companyId_];
        if (c.id == 0) revert CompanyNotFound();
        if (!c.active) revert CompanyInactive();

        EquityToken(c.equityToken).cancel(from, amount);
    }

    /**
     * @notice Get total supply for a company (for agent to query)
     */
    function getTotalSupply(uint256 companyId_) external view returns (uint256) {
        Company storage c = companies[companyId_];
        if (c.id == 0) revert CompanyNotFound();
        return EquityToken(c.equityToken).totalSupply();
    }

    function setAuthorizedMinter(address account, bool authorized) external onlyOwner {
        authorizedMinters[account] = authorized;
        emit AuthorizedMinterSet(account, authorized);
    }

    function setOwner(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidAddress();
        owner = newOwner;
    }
}
