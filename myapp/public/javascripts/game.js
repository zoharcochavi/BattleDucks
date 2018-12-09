// ---- BEGIN FUNCTIONS ----

// Check equality of arrays
function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

// Continue to the next game state
function readyState() {
    if(validBoard() || $("#forceReady").is(":checked")) {
        let used_tiles = returnBoard();
        insertDucks(used_tiles);
        generateGrid("opponent_board", "opponent_grid", grid_size, 0);
        
        $("#duckies").css({"visibility": "hidden", display: "none"});
        $("#opponent_board").css({"visibility": "visible", display: "block"});
            
        $("#opponent_grid > div").click(function(){
            $("#results").html($(this).attr("id"));
        });
        
    } else {
        $("#placeholder").html("Hey, you forgot me!").css({"transition": "ease-out"});
    }
}


// Generate a grid consisting of divs
function generateGrid(parent_id, grid_id, size, tile_status) {
    let element = document.createElement("div");
    element.setAttribute("class", "grid");
    element.setAttribute("id", grid_id);

    document.getElementById(parent_id).appendChild(element);

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            element = document.createElement("div");
            element.setAttribute("class", "tile_"+tile_status);
            element.setAttribute("id", "("+j+","+i+")");

            document.getElementById(grid_id).appendChild(element);
        }
    }
}

// Calculate the coordinate of a ship cell within the player_grid
function getUnitCoordinate(cell) {
    let grid_position = $("#player_grid").offset();
    

    let position_top = cell.offset().top - grid_position.top;
    let position_left = cell.offset().left - grid_position.left;

    let tile = getComputedStyle(document.querySelector(".tile_snappable"));

    let grid_x = Math.round(position_left/tile.width.slice(0,2));
    let grid_y = Math.round(position_top/tile.height.slice(0,2));

    return [grid_x, grid_y];
}

// Return all the coordinates of the cells of a ship in a 2D array
function getShipCoordinate(ship) {
    let cells = ship.children();
    let cell_coordinates = [];

    for(let i=0; i<cells.length; i++) {
        cell_coordinates.push(getUnitCoordinate($(cells[i]), $("#player_grid")));
    }
    return cell_coordinates;
}

// Check if ship postition is valid (e.g. within the boarders of the grid), and if not return to the last valid position
function validPosition(this_ship) {
    let cell_positions = getShipCoordinate(this_ship, $("#player_grid"));
    for(let i=0; i<cell_positions.length; i++){
        let this_cell = cell_positions[i];

        if(this_cell[0] >= grid_size || this_cell[0] < 0 || this_cell[1] >= grid_size || this_cell[1] < 0) {
            return false;
        }
    }
    return true;
}

// Check if ships aren't overlapping with each other
function noOverlap() {
    let used_tiles = [];
    let ships = document.getElementsByClassName("ship");

    for(let i=0; i<ships.length; i++) {
        let current_ship_coord = getShipCoordinate($(ships[i]), $("#player_grid"));

        for(let j = 0; j < used_tiles.length; j++) {
            for(let k = 0; k < current_ship_coord.length; k++) {
                if (arraysEqual(current_ship_coord[k], used_tiles[j])) {
                    return false;
                }
            }
        }
        for(let j = 0; j < current_ship_coord.length; j++){
            used_tiles.push(current_ship_coord[j]);
        }
    }
    return true;
}

// Check if all ships are in the board, and if they don't overlap
function validBoard() {
    let ships = document.getElementsByClassName("ship");

    if(noOverlap()) {
        for(let i=0; i<ships.length; i++) {
            if(!validPosition($(ships[i]))) {
                return false;
            }
        }
        return true;
    }
    return false;
}

// Return the coordinates of all ship tiles
function returnBoard() {
    let used_tiles = [];
    let ships = document.getElementsByClassName("ship");

    for(let i=0; i<ships.length; i++) {
        let current_ship_coord = getShipCoordinate($(ships[i]), $("#player_grid"));

        for(let j = 0; j < current_ship_coord.length; j++){
            used_tiles.push(current_ship_coord[j]);
        }
    }
    return used_tiles;
}

// Rotate children of a parent -90 dergrees
function rotateChildren(parent) {
    children = parent.children();
    for(let i=0; i<children.length; i++) {
        $(children[i]).toggleClass("rotate_-90");
    }
}

// Move all children of a class to another class
function moveChildrenFromTo(parent1, parent2) {
    let children = parent1.children();
    
    for(let i=0; i<children.length; i++) {
        $(children[i]).appendTo($(parent2));    
    }
}

// Update a tile given a status and coordinate
function updateTile(coordinate, status) {
    $("#\\("+coordinate[0]+"\\,"+coordinate[1]+"\\)").attr("class", "tile_"+status);
}

// Insert all ducks into the player board permanently
function insertDucks(used_tiles) {
    for(let i=0; i<used_tiles.length; i++) {
        updateTile(used_tiles[i], 2)
    }
}

// ---- END FUNCTIONS ----

// Globals
let grid_size = 10;

let prev_left;
let prev_top;

// Generate required HTML elements
generateGrid("player_board", "player_grid", grid_size, "snappable");

// UI Functionality...
// TODO: Add return button to make all ducks go to their original position

$(function(){
    $(".ship").draggable({
        snap: ".tile_snappable", snapTolerance : "40", snapMode: "inner",

        start: function() {
            prev_left = $(this).css("left");
            prev_top = $(this).css("top");
        },
        
        stop: function() {
            if(!(validPosition($(this)) && noOverlap())) {
                $(this).css({left:prev_left, top:prev_top});
            } else {
                prev_left = $(this).css("left");
                prev_top = $(this).css("top");
            }
        }

    }).click(function() {
        prev_left = $(this).css("left");
        prev_top = $(this).css("top");

        $(this).toggleClass("rotate_90");
        rotateChildren($(this));
        
        if(!(validPosition($(this)) && noOverlap())) {
            $(this).css({left:prev_left, top:prev_top});
            $(this).toggleClass("rotate_90");
            rotateChildren($(this));

            $("#placeholder").html("QUACK! I cannot rotate here!").css({"transition": "ease-out"});
        }

    });

    $("#player_ready").click(function(){
        readyState();
    }); 
});


