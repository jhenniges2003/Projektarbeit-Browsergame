CREATE TABLE scenes (
  id VARCHAR(50) PRIMARY KEY,
  text TEXT NOT NULL
);

CREATE TABLE choices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  scene_id VARCHAR(50),
  text VARCHAR(255),
  next_scene_id VARCHAR(50),
  FOREIGN KEY (scene_id) REFERENCES scenes(id)
);

CREATE TABLE stories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    lobby_id INT,
    start_story_node_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lobby_id) REFERENCES lobbies(id),
    FOREIGN KEY (start_story_node_id) REFERENCES story_nodes(id)
);

CREATE TABLE skins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    personality varchar(255) NOT NULL,
    description TEXT NOT NULL,
    resource_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    is_alive BOOLEAN DEFAULT TRUE,
    lobby_id INT,
    skin_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lobby_id) REFERENCES lobbies(id),
    FOREIGN KEY (skin_id) REFERENCES skins(id)
);

CREATE TABLE histories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lobby_id INT,
    decision_going_to_ids json,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lobby_id) REFERENCES lobbies(id)
);