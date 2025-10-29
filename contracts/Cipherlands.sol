// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Cipherlands
/// @notice Multiplayer map that assigns encrypted locations to players.
contract Cipherlands is SepoliaConfig {
    uint16 public constant MAP_WIDTH = 20;
    uint16 public constant MAP_HEIGHT = 20;
    uint16 public constant TOTAL_TILES = MAP_WIDTH * MAP_HEIGHT;

    struct PlayerData {
        euint32 position;
        bool joined;
        bool isPublic;
    }

    mapping(address => PlayerData) private _players;
    mapping(uint16 => bool) private _occupiedTiles;
    address[] private _publicPlayers;
    mapping(address => bool) private _isInPublicList;
    address[] private _playersRegistry;

    event PlayerJoined(address indexed player);
    event PositionMadePublic(address indexed player);

    /// @notice Join the game and receive an encrypted map position.
    function joinGame() external {
        PlayerData storage playerData = _players[msg.sender];
        require(!playerData.joined, "Player already joined");

        uint16 allocatedTile = _allocateTile(msg.sender);
        euint32 encryptedPosition = FHE.asEuint32(allocatedTile);

        playerData.position = encryptedPosition;
        playerData.joined = true;
        playerData.isPublic = false;

        _playersRegistry.push(msg.sender);

        FHE.allowThis(encryptedPosition);
        FHE.allow(encryptedPosition, msg.sender);

        emit PlayerJoined(msg.sender);
    }

    /// @notice Make the caller's position publicly decryptable.
    function makePositionPublic() external {
        PlayerData storage playerData = _requireExistingPlayer(msg.sender);
        require(!playerData.isPublic, "Position already public");

        euint32 updatedPosition = FHE.makePubliclyDecryptable(playerData.position);
        FHE.allow(updatedPosition, msg.sender);

        playerData.position = updatedPosition;
        playerData.isPublic = true;

        if (!_isInPublicList[msg.sender]) {
            _isInPublicList[msg.sender] = true;
            _publicPlayers.push(msg.sender);
        }

        emit PositionMadePublic(msg.sender);
    }

    /// @notice Returns the encrypted position for a player.
    function getEncryptedPosition(address player) external view returns (euint32) {
        PlayerData storage playerData = _requireExistingPlayer(player);
        return playerData.position;
    }

    /// @notice Returns whether a player already joined the game.
    function hasJoined(address player) external view returns (bool) {
        return _players[player].joined;
    }

    /// @notice Returns whether a player's position is publicly decryptable.
    function isPublic(address player) external view returns (bool) {
        return _players[player].isPublic;
    }

    /// @notice Returns the list of players who exposed their position.
    function getPublicPlayers() external view returns (address[] memory) {
        return _publicPlayers;
    }

    /// @notice Returns the encrypted positions of all public players.
    function getPublicPlayerPositions() external view returns (address[] memory players, euint32[] memory positions) {
        uint256 length = _publicPlayers.length;
        players = new address[](length);
        positions = new euint32[](length);

        for (uint256 i = 0; i < length; i++) {
            address player = _publicPlayers[i];
            players[i] = player;
            positions[i] = _players[player].position;
        }
    }

    /// @notice Returns the total number of registered players.
    function totalPlayers() external view returns (uint256) {
        return _playersRegistry.length;
    }

    /// @notice Checks whether a specific tile is already occupied.
    function tileIsOccupied(uint16 tileId) external view returns (bool) {
        require(tileId >= 1 && tileId <= TOTAL_TILES, "Tile out of bounds");
        return _occupiedTiles[tileId];
    }

    function _allocateTile(address player) internal returns (uint16) {
        require(_playersRegistry.length < TOTAL_TILES, "Map is full");

        uint256 randomSeed = uint256(
            keccak256(abi.encodePacked(player, block.prevrandao, block.timestamp, _playersRegistry.length))
        );

        for (uint256 attempt = 0; attempt < TOTAL_TILES; attempt++) {
            uint16 candidate = uint16((randomSeed + attempt) % TOTAL_TILES) + 1;
            if (!_occupiedTiles[candidate]) {
                _occupiedTiles[candidate] = true;
                return candidate;
            }
        }

        revert("No free tiles");
    }

    function _requireExistingPlayer(address player) internal view returns (PlayerData storage) {
        PlayerData storage playerData = _players[player];
        require(playerData.joined, "Player not registered");
        return playerData;
    }
}
