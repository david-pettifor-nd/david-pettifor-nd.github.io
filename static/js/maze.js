/*******************************************************************************
 * File: "maze.js"
 * Date: November 21, 2011
 * Author: David Pettifor
 * Description:
 *  This javascript file contains 3 main sections:
 *  1) HTML page loading - this section simply generates the HTML elements found
 *  in the GUI, and contains functions that act as error checkers and manipulation
 *  functions (changes globals).  This section is not really needed for the
 *  generation of the maze - simply allows the user to make changes to the maze
 *  and access the HTML code generated after completion.
 *
 *  2) Maze generation -
 *  This section generates the maze itself.  A maze can be thought of as a grid
 *  of "cells", much like the small squares on a piece of graphing paper.  Each
 *  cell has 4 walls: a top, right, bottom, and left wall.  When a maze is
 *  created, certain walls get knocked down to form a path.  If a cell has
 *  already been used, we say it has been "visisted".  This is why we use an
 *  array to represent each cell:
 *      array[1, 1, 1, 1, false]
 *  Where:
 *      array[0] = top wall
 *      array[1] = right wall
 *      array[2] = bottom wall
 *      array[3] = left wall
 *      array[4] = visited
 *  A "1" means that wall is still up, and a "0" would mean it has been knocked
 *  down.  If the cell has been visited, "array[4]" would be "true".
 *
 *  To generate the maze, we first create a 2-dimensional array full of these
 *  cells, all initialized as above: all 4 walls are up, and none of the cells
 *  have been visisted.
 *
 *  We then start the maze by starting at the end.  This is represented by the
 *  variables "STARTING_X" and "STARTING_Y" where "_X" is the width, and "_Y"
 *  is the height: keep in mind that width increases as you go right, and height
 *  increases as you go DOWN.  So (0,0) would be in the top-left corner.
 *
 *  Say we start here, (so our exiting point will be at cell [0,0]).  We follow
 *  the following steps, recursively:
 *  1) Mark the current cell as being visited.
 *  2) Now get a list of neighboring cells - this is defined as cells to the
 *      top, right, bottom, or left of our current cell.
 *  3) Randomize that list of neighbors (if any).
 *  4) For each neighbor in this list, do the following:
 *      5) Check to see if that neighbor has been used.
 *      6) If not, knock the walls between our current cell, and that neighbor
 *      7) Then pass in this new neighboring cell to the recursive function,
 *          and start at step 1.
 *      8) If the neighbor has been used, move on to the next neighbor in the
 *          list, until the list is all used up.
 *
 *  What will result in the end is a maze!  The last thing that needs to be done
 *  is to generate HTML code to represent this data.  This is done using DIV
 *  tags.  They are setup much like an HTML table: rows and columns.  Each
 *  DIV is set a specific height and width, and is given a top, right, bottom,
 *  and left border based on the array representing that cell.  If there is no
 *  wall for a particular side (represented by a 0), the wall becomes
 *  transparent, and the width/height is adjusted accordingly (this keeps all
 *  of our DIV's lined up properly).  We also knock down the enterance and exit
 *  walls so our users know which way to go in/out (which two corners to
 *  connect).
 *
 *  3) The last section is the maze solver.  Because the maze is generated at
 *  random, I, the computer, nor anyone else knows exactly what the path is
 *  without solving it.  So I wrote a recursive function much like the one used
 *  to generate it, to solve it.  It first starts at the starting point defined
 *  by "ENTRANCE_X" and "ENTERANCE_Y".  It then runs through the "Maze" array
 *  and for each cell, finds neighboring cells it has access to (where the wall
 *  is defined as 0 in the array) AND where that neighbor has not yet been
 *  visited (this prevents it from getting stuck infinitely between two cells).
 *  It then calls ahead to say "hey neighbor, check your neighbors and let me
 *  know if any of them can make it to the end".  And each of their neighbors
 *  do the same (because of the recursion).  Eventually, one neighbor will say
 *  "Yes, I am the end cell you're looking for!" and a "yes" (or "true") will
 *  return all the way back through the chain of neighbors.  And every time a
 *  cell gets a "yes" from it's neighbor, it adds itself to a list of cells that
 *  are part of the solution.  In the end, we have this list of coordinates that
 *  correspond to cells on the right path - and when colored in the maze, reveal
 *  the proper path from start to finish.
 *
 ******************************************************************************/

// Cell "class" represented by an array:
// cell = {1, 1, 1, 1, false}
//
// Each element is:
//  [0] = Top wall
//  [1] = Right wall
//  [2] = Bottom wall
//  [3] = Left wall
//  [4] = visited

// Default width and height - set by user after GUI loads
var WIDTH = 40;
var HEIGHT = 40;

// Default starting position (where the Maze exit will be)
var STARTING_X = WIDTH - 1;
var STARTING_Y = HEIGHT - 1;

var ENTRANCE_X = 0;
var ENTRANCE_Y = 0;

// Size of each cell (must be a square)
var CELL_SIZE = 20;     // pixels

// Border width (keep in mind this is PER CELL - the actual border
// between cells will be twice this value)
var BORDER_WIDTH = 1;   // pixels

// Color of the borders between cells
var BORDER_COLOR = "#000000";

// Color of the borders that "don't exist"
var BORDER_NO_COLOR = "transparent";

// Style of the border (PLEASE DON'T CHANGE)
var BORDER_STYLE = "solid";

// Entrance [0 = top, 1 = right, 2 = bottom, 3 = left] with respect to starting cell
var ENTER = 3;

// Exit [0 = top, 1 = right, 2 = bottom, 3 = left] with respect to exiting cell
var EXIT = 1;

// HTML that holds the generated Maze
var Maze_HTML;

// HTML that holds the solution of the Maze
var Maze_HTML_Answer;

// Maze is a two-dimension array of cells
var Maze = new Array(WIDTH);


// Number of steps it takes to solve the maze
var Steps_to_Solve = 0;

/******************************************************************************/
//                    HTML PAGE GENERATION                                    //
//                      (Maze code below)                                     //
/******************************************************************************/
//***************** MAIN PAGE HTML CODE ************************/
// holds information about the generator
var HTML_INFO_TITLE = '<h2 class="step">Directions</h2>'
var HTML_INFO = '<h2 class="tab">Welcome to my online maze puzzle generator!  This generator is written completely in JavaScript, and the source can be found <a href="maze.js" target="_blank">here</a>!<br>I hope you enjoy using this generator - but to get you started, you can <a href="example.png" target="_blank">look at this example</a> to see what everything does!<br>To help get you started, here is a short description of how it works:<br>\
                The maze generated is made of a bunch of small "cells".  These cells are simply squares that have 4 walls around them: top, right, bottom, and left walls.  When the maze is first generated, all of these walls are up (so it looks like a grid).  The generator starts at a defined corner of the maze and begins a recursive process:<br>\
                <ol><li>Mark the current cell as being "visited"</li><li>Get a list of the cell\'s neighbors that haven\'t been visited (neighbors being cells to the top, right, bottom, or left)</li><li>Randomize that list of neighbors</li><li>Pick one and knock the wall down between our currnet cell and that neighbor</li><li>Go back to step one, only using this random neighbor that we just picked as the new "current cell".</li></ol><br><br>\
                This process continues until every cell has been visited, and the result is a random maze!<br><br>\
                A few things to note when defining the attributes of a maze:<br>\
                <ul><li>The cell size will determine how wide your paths are</li><li>The border size is in pixels, and is actually doubled in the HTML generation - this is how thick your walls are</li><li>The width and height of your maze is based on the number of cells, so if your cell size is 10px, and your dimensions of your maze are 50x50, your maze will be 500x500 pixels (plus the addition of the border sizes)</li></ul>';


// holds printing instructions
var HTML_PRINT = '<h2 class="step">Printing</h2>\
                 <h2 class="tab">The way the mazes are drawn are by creating miniature DIV spaces with defined borders.  Because of this, some "Print Previews" may look awful.  However, most printers print just fine.  My suggestion would be to try printing first, and if it doesn\'t come out right, you can take a screenshot and try printing it that way.</h2>';

// holds interactive instructions
var HTML_INTERACTIVE = '<br><br><h2 class="step">Solve the Maze*</h2>\
                       <h2 class="tab">You can solve the maze directly in your browser by clicking on the "Play!" button after generation.  The instructions are fairly simple.  You start in the corner defined, and move with the following keys:<ul><li>Up: W</li><li>Down: S</li><li>Left: A</li><li>Right: D</li></ul>You can also jump to a location in the maze you have previously visited by clicking on that path in the maze.<br><br>You also have other options that you can enable:<ul><li>Show Visited Path: This highlights the path you have already visited to show you where you\'ve been and where you can jump to.</li><li>Show Split Offs: This highlights the locations on your visited path where you had to make a decision to go one way or another.</li><li>Show Current Stats: This shows a table that displays your current move count and jump count.</li></ul><br><br>Once you finish the maze, you will be alerted and a table of ending statistics will be shown, including the total move count, the minimum number of moves that was required, a percentage of accuracy (number of minimum moves / your total move count), your jump count, and the option to show the answer path or play an animation showing the path.<br><br>*NOTE: Compatability testing shows that only Firefox (3.0+), Safari (most), Opera (11.6+), and Google Chrome (15+) are able to use the interactive solver.  My apologies to Internet Explorer users - please use a different browser.</h2>'


// holds the "Dimensions" input
var HTML_DIM_TITLE = '<br><br><h2 class="step">Dimensions (How Many Cells)</h2>';
var HTML_DIM_HEIGHT = '<table class="tab"><tr><td>Height: </td><td><input type="text" id="dim_height" value="40" size="2" style="text-align: center" onkeyup="CheckValue(this);" onChange="UpdateDims();" title="How many cells high should the puzzle be?"></td>';
var HTML_DIM_WIDTH = '<td>&nbsp;&nbsp;&nbsp;</td><td>Width: </td><td><input type="text" id="dim_width" value="40" size="2" style="text-align: center" onkeyup="CheckValue(this);" onChange="UpdateDims();" title="How many cells wide should the puzzle be?"></td></tr></table>';

// holds the cell size
var HTML_CELL_TITLE = '<br><br><h2 class="step">Path Width (Cell Size)</h2>';
var HTML_CELL_INPUT = '<table class="tab"><tr><td>Cell Size: </td><td><input type="text" id="cell_size" value="10" size="2" style="text-align: center" onkeyup="CheckValue(this);" title="How wide should the paths be?">  pixels</td></tr></table>';

// holds the "border input
var HTML_BORDER_TITLE = '<br><br><h2 class="step">Border (Wall Thickness)</h2>';
var HTML_BORDER_INPUT = '<table class="tab"><tr><td>Border Width: </td><td><input type="text" id="border_thickness" value="1" size="2" style="text-align: center" onkeyup="CheckValue(this);" title="How thick should your walls be?"> pixel(s)</td></table>';

// holds the entrance and exit inputs
var HTML_ENTRANCE_EXIT_TITLE = '<br><br><h2 class="step">Entrance and Exit</h2>';
var HTML_ENTRANCE_INPUT = '<table class="tab"><tr><td>Entrance Location: </td><td><SELECT id="entrance" onchange="UpdateEntrance(this.value);"><OPTION value="tl">Top-Left Corner</OPTION><OPTION value="tr">Top-Right Corner</OPTION><OPTION value="br">Bottom-Right Corner</OPTION><OPTION value="bl">Bottom-Left Corner</OPTION></SELECT></td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td>Wall Entrance: </td><td><SELECT id="wall_entrance" onclick="UpdateEWall();"><OPTION value="3">Left Wall</OPTION><OPTION value="0">Top Wall</OPTION></SELECT></td></tr>';
var HTML_EXIT_INPUT = '<tr><td>Exit Location: </td><td><SELECT id="exit" onchange="UpdateExit(this.value);"><OPTION value="br">Bottom-Right Corner</OPTION><OPTION value="bl">Bottom-Left Corner</OPTION><OPTION value="tr">Top-Right Corner</OPTION><OPTION value="Tl">Top-Left Corner</OPTION></SELECT></td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td>Wall Exit: </td><td><SELECT id="wall_exit" onclick="UpdateEWall();"><OPTION value="1">Right Wall</OPTION><OPTION value="3">Bottom Wall</OPTION></SELECT></td></tr>';


// holds the HTML code for the "Generate" button
var HTML_GENERATE = '<br><br><table class="tab"><tr><td><button type="button" onclick="LoadMaze();" title="Generate the word search!">Generate!</button></td>'

// holds the links to new html pages to appear
var HTML_LINKS = '<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td id="links"></td></tr></table>'


// holds settings options for the solver
var SOLVER_SETTINGS = '<br><br><div style="border: solid 1px #FFF; margin-left: auto; margin-right: auto; text-align: center;"><span><input type="checkbox" id="showpath" onchange="TogglePath(this.checked);"> Show Visited Path</input></span>\
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span><input type="checkbox" id="showsplits" onchange="ToggleSplits(this.checked);"> Show Split Offs</input></span>\
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span><input type="checkbox" id="showstats" onchange="ToggleCurrentStats(this.checked);"> Show Current Stats</input></span></div>';
// holds instructions to solve the maze in the child window created when the "View Puzzle" button is clicked
var INSTRUCTIONS = '<br><br><div style="margin-left: auto; margin-right: auto; text-align: center;"><img src="static/images/directions.png" width="200px" style="vertical-align: middle;" title="Movement: Up: W, Down: S, Left: A, Right: D">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img src="static/images/click.png" width="100px" style="vertical-align: middle;" title="Click on maze to jump to previously visited location"></div>';

// holds the current stats
var STATS = '<br><br><div id="livestats" style="margin-left: auto; margin-right: auto; text-align: center;"></div>'


// Main function called when page loads - generates code on front page that
// enables the user to adjust settings for the maze.
// Main section for HTML code to be placed into is called "input_area"
function LoadBody()
{
    // HTML variable to hold the generated HTML code
    var HTML = '';
    
    // Load the title and information
    HTML += HTML_INFO_TITLE + HTML_INFO;
    
    HTML += HTML_PRINT + HTML_INTERACTIVE;
    
    // Load puzzle information
    HTML += HTML_DIM_TITLE;
    HTML += HTML_DIM_HEIGHT + HTML_DIM_WIDTH;
    
    HTML += HTML_CELL_TITLE + HTML_CELL_INPUT;
    
    HTML += HTML_BORDER_TITLE + HTML_BORDER_INPUT;
    
    HTML += HTML_ENTRANCE_EXIT_TITLE + HTML_ENTRANCE_INPUT + HTML_EXIT_INPUT;
    
    // Generation button
    HTML += HTML_GENERATE;
    
    // location for links
    HTML += HTML_LINKS;
    
    document.getElementById('input_area').innerHTML = HTML;

    document.onkeydown = keyDown;
}

// This function is called every time a key is pressed in the "Height"
// or "Width" text boxes in the dimensions area
// It checks if a valid key was entered and if not, erases that character
function CheckValue(element)
{
    // valid characters
    var Valid = "0123456789";
    
    
    for(var i = 0; i < element.value.length; i++)
    {
        if(Valid.indexOf(element.value[i]) < 0)
            element.value = element.value.replace(element.value[i], '');
    }
}


// This function updates the entrance value and the wall options for the drop-down menus
// Value being passed in can be:
//  tl - top-left
//  tr - top-right
//  br - bottom-right
//  bl - bottom-left
function UpdateEntrance(location)
{
    document.getElementById('wall_entrance').options.length = 0;

    // if the location is top-left, our entrance will be 0,0
    if(location == 'tl')
    {
        ENTRANCE_X = 0;
        ENTRANCE_Y = 0;
        
        document.getElementById('wall_entrance').options[0] = new Option("Left Wall", 3, true);
        document.getElementById('wall_entrance').options[1] = new Option("Top Wall", 0, false);
    }
    
    // if the location is top-right, our entrance will be WIDTH, 0
    if(location == 'tr')
    {
        ENTRANCE_X = WIDTH - 1;
        ENTRANCE_Y = 0;
        
        document.getElementById('wall_entrance').options[0] = new Option("Right Wall", 1, true);
        document.getElementById('wall_entrance').options[1] = new Option("Top Wall", 0, false);
    }
    
    // if the location is bottom-right, our entrance will be WIDTH, HEIGHT
    if(location == 'br')
    {
        ENTRANCE_X = WIDTH - 1;
        ENTRANCE_Y = HEIGHT - 1;
        
        document.getElementById('wall_entrance').options[0] = new Option("Right Wall", 1, true);
        document.getElementById('wall_entrance').options[1] = new Option("Bottom Wall", 2, false);
    }
    
    // lastly, if our location is bottom-left, our entrance will be 0, HEIGHT
    if(location == 'bl')
    {
        ENTRANCE_X = 0;
        ENTRANCE_Y = HEIGHT - 1;
        
        document.getElementById('wall_entrance').options[0] = new Option("Left Wall", 3, true);
        document.getElementById('wall_entrance').options[1] = new Option("Bottom Wall", 2, false);
    }
}

// This function updates the exit value and the wall options for the drop-down menus
// Value being passed in can be:
//  tl - top-left
//  tr - top-right
//  br - bottom-right
//  bl - bottom-left
function UpdateExit(location)
{
    document.getElementById('wall_exit').options.length = 0;

    // if the location is top-left, our entrance will be 0,0
    if(location == 'tl')
    {
        STARTING_X = 0;
        STARTING_Y = 0;
        
        document.getElementById('wall_exit').options[0] = new Option("Left Wall", 3, true);
        document.getElementById('wall_exit').options[1] = new Option("Top Wall", 0, false);
    }
    
    // if the location is top-right, our entrance will be WIDTH, 0
    if(location == 'tr')
    {
        STARTING_X = WIDTH - 1;
        STARTING_Y = 0;
        
        document.getElementById('wall_exit').options[0] = new Option("Right Wall", 1, true);
        document.getElementById('wall_exit').options[1] = new Option("Top Wall", 0, false);
    }
    
    // if the location is bottom-right, our entrance will be WIDTH, HEIGHT
    if(location == 'br')
    {
        STARTING_X = WIDTH - 1;
        STARTING_Y = HEIGHT - 1;
        
        document.getElementById('wall_exit').options[0] = new Option("Right Wall", 1, true);
        document.getElementById('wall_exit').options[1] = new Option("Bottom Wall", 2, false);
    }
    
    // lastly, if our location is bottom-left, our entrance will be 0, HEIGHT
    if(location == 'bl')
    {
        STARTING_X = 0;
        STARTING_Y = HEIGHT - 1;
        
        document.getElementById('wall_exit').options[0] = new Option("Left Wall", 3, true);
        document.getElementById('wall_exit').options[1] = new Option("Bottom Wall", 2, false);
    }
}

function GetExit()
{
    var location = document.getElementById('exit').value;
    
    // if the location is top-left, our entrance will be 0,0
    if(location == 'tl')
    {
        STARTING_X = 0;
        STARTING_Y = 0;
    }
    
    // if the location is top-right, our entrance will be WIDTH, 0
    if(location == 'tr')
    {
        STARTING_X = WIDTH - 1;
        STARTING_Y = 0;
    }
    
    // if the location is bottom-right, our entrance will be WIDTH, HEIGHT
    if(location == 'br')
    {
        STARTING_X = WIDTH - 1;
        STARTING_Y = HEIGHT - 1;
    }
    
    // lastly, if our location is bottom-left, our entrance will be 0, HEIGHT
    if(location == 'bl')
    {
        STARTING_X = 0;
        STARTING_Y = HEIGHT - 1;
    }
}

function GetEntrance()
{
    var location = document.getElementById('entrance').value;
    
    // if the location is top-left, our entrance will be 0,0
    if(location == 'tl')
    {
        ENTRANCE_X = 0;
        ENTRANCE_Y = 0;
    }
    
    // if the location is top-right, our entrance will be WIDTH, 0
    if(location == 'tr')
    {
        ENTRANCE_X = WIDTH - 1;
        ENTRANCE_Y = 0;
    }
    
    // if the location is bottom-right, our entrance will be WIDTH, HEIGHT
    if(location == 'br')
    {
        ENTRANCE_X = WIDTH - 1;
        ENTRANCE_Y = HEIGHT - 1;
    }
    
    // lastly, if our location is bottom-left, our entrance will be 0, HEIGHT
    if(location == 'bl')
    {
        ENTRANCE_X = 0;
        ENTRANCE_Y = HEIGHT - 1;
    }
}

// This function updates the Enterance/Exit walls when changed from the drop-down menu
function UpdateEWall()
{
    ENTER = document.getElementById('wall_entrance').value;
    EXIT = document.getElementById('wall_exit').value;
}

function UpdateDims()
{
    WIDTH = parseInt(document.getElementById('dim_width').value);
    HEIGHT = parseInt(document.getElementById('dim_height').value);
}

/******************************************************************************/
//                          MAZE GENERATION                                   //
/******************************************************************************/
function ResetValues()
{
    Maze_HTML = '';
    Maze_HTML_Answer = '';
    Maze = new Array(WIDTH);
    Solution_List = new Array();
    Steps_to_Solve = 0;
}

// Initialize the maze as WIDTHxHEIGHT, setting all cells to have NOT been visited
// and all four walls turned on (put up)
function LoadMaze()
{
    ResetValues();
    GetEntrance();
    GetExit();
    UpdateEWall();
    
    HEIGHT = parseInt(document.getElementById('dim_height').value);
    WIDTH = parseInt(document.getElementById('dim_width').value);
    //BORDER_WIDTH = parseInt(document.getElementById('border_thickness').value);
    CELL_SIZE = parseInt(document.getElementById('cell_size').value);
    
    // do some error checking
    if(ICanHazErrors())
        return;
    
    // start by creating a 10x10 maze
    for(var i = 0; i < WIDTH; i++)
    {
        Maze[i] = new Array(HEIGHT);
        for(var j = 0; j < HEIGHT; j++)
        {
            Maze[i][j] = new Array(5);
            Maze[i][j][0] = 1;
            Maze[i][j][1] = 1;
            Maze[i][j][2] = 1;
            Maze[i][j][3] = 1;
            Maze[i][j][4] = false;
        }
    }

    // start the maze at exit points
    GenerateMaze(STARTING_X,STARTING_Y);

    // setup the enterance and exit points
    InstallDoors();

    // After the maze is generated, create a table - each with cells containing
    // borders that match each cell in the maze (draw the maze: HTML-style baby!)
    Maze_HTML = DrawMaze();
    
    // Solve the maze, if requested (most likely)
    SolveMaze();
    
    // show the links
    document.getElementById('links').innerHTML = '<button type="button" class="btn btn-success" style="margin-left: 20px;" onclick="PlayPuzzle()">Play!</button><button type="button" class="btn btn-success" style="margin-left: 20px;" onclick="ShowPuzzle()">View Printer-Friendly Version</button><button type="button" class="btn btn-success" style="margin-left: 20px;" onclick="ShowAnswer()">View Answer</button>';
    
    // notify the user!
    alert('New Maze Generated!');
    
}

// This function is called when the (dynamically) generated "View Puzzle" button
// is clicked.  It opens a new tab/window and writes the contents of "Puzzle_HTML"
// into the new window.
function ShowPuzzle()
{
    new_window = open();
    new_window.document.open();
    
    // write maze information
    new_window.document.write(Maze_HTML);
    
    new_window.document.close();
}

// This function is called when the (dynamically) generated "View Puzzle" button
// is clicked.  It opens a new tab/window and writes the contents of "Puzzle_HTML"
// into the new window.
function PlayPuzzle()
{
    var new_window = window.open('', 'Maze Puzzle');
    
    //new_window.document.getElementsByTagName("head")[0].innerHTML = '<script language="JavaScript" type="text/javascript" src="solver.js"></script>';
    
    // create a general "DIV" which will capture keystrokes
    new_window.document.write('\n<body><h2 align="center">Maze Puzzle</h2><br>');
    
    // write maze information
    new_window.document.write(Maze_HTML);
    
    // add instructions
    new_window.document.write('\n'+SOLVER_SETTINGS+'\n'+STATS+'\n'+INSTRUCTIONS);
    
    // include the "solver.js" file - which allows for interactive solving!
    new_window.document.write('<script language="JavaScript" type="text/javascript" src="static/js/solver.js"></script>');
    
    new_window.document.close();
}

// This function is called when the (dynamically) generated "View Puzzle" button
// is clicked.  It opens a new tab/window and writes the contents of "Puzzle_HTML"
// into the new window.
function ShowAnswer()
{
    new_window = open()
    new_window.document.open()    
    new_window.document.write(Maze_HTML_Answer)
    new_window.document.close()
}

// Checks to make sure there are no errors in the GUI (silly pplz)
function ICanHazErrors()
{
    // check to make sure entrance and exits aren't the same
    if(STARTING_X == ENTRANCE_X && STARTING_Y == ENTRANCE_Y)
    {
        alert("You cannot have the same cell be both the entrance and exit!");
        return true;
    }
    
    // make sure height, width is all good
    if(HEIGHT <= 0 || WIDTH <= 0)
    {
        alert("Error with dimensions...please check to make sure height and width are above zero!");
        return true;
    }
    
    // make sure border is ok
    if(BORDER_WIDTH <= 0)
    {
        alert("No border will result in a white box.  Please make sure your border is at least 1.");
        return true;
    }
    
    if(BORDER_WIDTH >= CELL_SIZE)
    {
        alert("Your border is the size of your cells - this is really ugly and probably won't work...please fix this!");
        return true;
    }
    
    if(CELL_SIZE < 4)
    {
        alert("The cell size is awfully small - please make it bigger?");
        return true;
    }
    
    return false;
}

// Recursive function, passing in the "current cell"
function GenerateMaze(w, h)
{
    //alert("Marking ["+w+","+h+"] as Visited");
    // Mark the current cell as "visited"
    Maze[w][h][4] = true;
    
    // Get a list of neighbors
    var neighbors_unshuffled = GetNeighbors(w,h);
    
    // Randomly shuffle our neighbors
    var neighbors = ShuffleNeighbors(neighbors_unshuffled);
    
    // loop through our neighbors list...
    for(var i = 0; i < neighbors.length; i++)
    {
        // check if this neighbor has been visited
        //alert("Checking if Neighbor: ["+neighbors[i][0]+","+neighbors[i][1]+"] as been visited: "+Maze[neighbors[i][0]][neighbors[i][1]][4]);
        
        if(Maze[neighbors[i][0]][neighbors[i][1]][4] == false)
        {
            //alert("Removing wall between ["+w+","+h+"] and ["+neighbors[i][0]+","+neighbors[i][1]+"]");
            // remove the wall between this cell, and the current neighbor
            RemoveWall(w,h,neighbors[i]);
            
            //alert("Calling function with new neighbor: ["+neighbors[i][0]+","+neighbors[i][1]+"]");
            // Recursively call GenerateMaze, passing in this new neighbor
            GenerateMaze(neighbors[i][0], neighbors[i][1]);
        }
    }
}

// Examines the enterance and exit locations and makes the proper adjustment based
// on the ENTER and EXIT values
function InstallDoors()
{
    // Install Entrance opening
    // [0 = top, 1 = right, 2 = bottom, 3 = left] with respect to starting cell
    if (ENTER == 0)
        Maze[ENTRANCE_X][ENTRANCE_Y][0] = 0;
    if (ENTER == 1)
        Maze[ENTRANCE_X][ENTRANCE_Y][1] = 0;
    if (ENTER == 2)
        Maze[ENTRANCE_X][ENTRANCE_Y][2] = 0;
    if (ENTER == 3)
        Maze[ENTRANCE_X][ENTRANCE_Y][3] = 0;
        
    // Install Exit opening
    // [0 = top, 1 = right, 2 = bottom, 3 = left] with respect to ending cell
    if (EXIT == 0)
        Maze[STARTING_X][STARTING_Y][0] = 0;
    if (EXIT == 1)
        Maze[STARTING_X][STARTING_Y][1] = 0;
    if (EXIT == 2)
        Maze[STARTING_X][STARTING_Y][2] = 0;
    if (EXIT == 3)
        Maze[STARTING_X][STARTING_Y][3] = 0;
}

// Returns a list of arrays (w,h) that are above, below, left, and right of
// the cell that is passed in.
// Be careful: we need to check where our boundaries are so we don't end up with
// a neighbor location beyond the edges of our 2D array (maze)
function GetNeighbors(w,h)
{
    // list of neighbors
    var neighbors = new Array();
    
    // keep track of the number of neighbors we're at
    var current_neighbor = 0;
    
    // first add the neighbor above
    if(h != 0)
    {
        neighbors[current_neighbor] = new Array(w, h-1);
        current_neighbor++;
    }
    
    // add the neighbor to the right
    if(w < WIDTH - 1)
    {
        neighbors[current_neighbor] = new Array(w+1, h);
        current_neighbor++;
    }
    
    // add the neighbor below
    if(h < HEIGHT - 1)
    {
        neighbors[current_neighbor] = new Array(w, h+1);
        current_neighbor++;
    }
    
    // add the neighbor to the left
    if(w != 0)
        neighbors[current_neighbor] = new Array(w-1, h);
    
    return neighbors;
}


// This function does a fair shuffle on the list passed in
function ShuffleNeighbors(neighbors)
{
    // loop through the neighbors, finding a random place for the current one
    for(var i = 0; i < neighbors.length; i++)
    {
        // get a random number based on the length of our list
        random_index = Math.floor(Math.random()*neighbors.length);
        
        // swap the two arrays at 'i' and 'random_index' (deep copy)
        var temp_array = new Array(2);
        temp_array[0] = neighbors[i][0];
        temp_array[1] = neighbors[i][1];
        
        neighbors[i][0] = neighbors[random_index][0];
        neighbors[i][1] = neighbors[random_index][1];
        
        neighbors[random_index][0] = temp_array[0];
        neighbors[random_index][1] = temp_array[1];
    }
    
    return neighbors;
}


// This function removes the wall between the cell at "w,h" and
// the cell represented by the array "neighbor[w,h]".
// The "wall" is represented by a "1" (or "0" for absence) in the
// "Maze" array.
function RemoveWall(w, h, neighbor)
{
    // if the neighbor is above us
    if(neighbor[1] < h)
    {
        // remove the wall above us [0] and the neighbor's bottom wall [2]
        Maze[w][h][0] = 0;
        Maze[neighbor[0]][neighbor[1]][2] = 0;
        return;
    }
    
    // if the neighbor is below us
    if(neighbor[1] > h)
    {
        // remove the wall below us [2] and the neighbor's top wall [0]
        Maze[w][h][2] = 0;
        Maze[neighbor[0]][neighbor[1]][0] = 0;
        return;
    }
    
    // if the neighbor is to the right of us
    if(neighbor[0] > w)
    {
        // remove the wall to the right of us [1] and the neighbor's left wall [3]
        Maze[w][h][1] = 0;
        Maze[neighbor[0]][neighbor[1]][3] = 0;
        return;
    }
    
    // if the neighbor is to the left of us
    if(neighbor[0] < w)
    {
        // remove the wall to the left of us [3] and the neighbor's right wall [1]
        Maze[w][h][3] = 0;
        Maze[neighbor[0]][neighbor[1]][1] = 0;
        return;
    }
}

// This function loops through the "Maze" and for each cell, draws a DIV cell
// with borders that match the "walls" of that cell...
function DrawMaze()
{
    // HTML variable to hold our code
    var HTML = '\n<div style="margin-left: auto; margin-right: auto; display: table; border-collapse:collapse; ">';
    
    // for each row in our maze...
    for(var j = 0; j < HEIGHT; j++)
    {
        HTML += '\n  <div style="display: table-row;">';
        
        // now run through each "cell"
        for(var i = 0; i < WIDTH; i++)
        {
            // create a new cell
            HTML += '    <div id="'+i+'_'+j+'" style="display: table-cell; border-width:' + BORDER_WIDTH + '; border-style:' + BORDER_STYLE + '; float: left; ';
            
            // get our border information
            HTML += GetBorderStyles(i, j);
            HTML += '" onclick="JumpHere(this.id);">';
            
            // since we don't have anything left for this cell, just close it off (with the DIV)
            HTML += '</div>\n';
        }
        HTML += '  </div>\n';
    }

    HTML += '</div>\n';

    return HTML;
}

// This function looks at the attributes in Maze[w][h] and generates
// appropriate CSS border styles to match the wall values for that cell
function GetBorderStyles(w, h)
{
    // CSS Style code
    var CSS = ' ';
    
    var additional_width = CELL_SIZE;
    var additional_height = CELL_SIZE;
    
    // if we have a top wall
    if(Maze[w][h][0] == 1)
        CSS += ' border-top-color:' + BORDER_COLOR + ';';
    else
    {
        CSS += ' border-top-style: hidden;';
        additional_height += BORDER_WIDTH;
    }
        
    // if we have a right wall
    if(Maze[w][h][1] == 1)
        CSS += ' border-right-color:' + BORDER_COLOR + ';';
    else
    {
        CSS += ' border-right-style: hidden; ';
        additional_width += BORDER_WIDTH;
    }
        
    // if we have a bottom wall
    if(Maze[w][h][2] == 1)
        CSS += ' border-bottom-color:' + BORDER_COLOR + ';';
    else
    {
        CSS += ' border-bottom-style: hidden;';
        additional_height += BORDER_WIDTH;
    }
        
    // if we have a left wall
    if(Maze[w][h][3] == 1)
        CSS += ' border-left-color:' + BORDER_COLOR + ';';
    else
    {
        CSS += ' border-left-style: hidden;';
        additional_width += BORDER_WIDTH;
    }
    
    
    // if we have a cell on the top edge of the maze...
    if(h == 0)
    {
        // set the top border width to twice what it should be
        // this keeps the look of the borders constant, since all other walls
        // in the maze will be double the thickness
        CSS += ' border-top-width: ' + (BORDER_WIDTH * 2) + '; ';
    }
    
    // if we have a cell on the bottom edge of the maze...
    if(h == (HEIGHT - 1))
    {
        // set the top border width to twice what it should be
        // this keeps the look of the borders constant, since all other walls
        // in the maze will be double the thickness
        CSS += ' border-bottom-width: ' + (BORDER_WIDTH * 2) + '; ';
    }
    
    // if we have a cell on the right edge of the maze...
    if(w == (WIDTH - 1))
    {
        // set the top border width to twice what it should be
        // this keeps the look of the borders constant, since all other walls
        // in the maze will be double the thickness
        CSS += ' border-right-width: ' + (BORDER_WIDTH * 2) + '; ';
    }
    
    // if we have a cell on the left edge of the maze...
    if(w == 0)
    {
        // set the top border width to twice what it should be
        // this keeps the look of the borders constant, since all other walls
        // in the maze will be double the thickness
        CSS += ' border-left-width: ' + (BORDER_WIDTH * 2) + '; ';
    }
    
    // check to see if we're at the beginning or ending cell
    if(STARTING_X == w && STARTING_Y == h)
    {
        // if the removed wall is 0 or 2, add to the height
        if(EXIT == 0 || EXIT == 2)
            additional_height += BORDER_WIDTH;
        else
            additional_width += BORDER_WIDTH;
    }
    if(ENTRANCE_X == w && ENTRANCE_Y == h)
    {
        // if the removed wall is 0 or 2, add to the height
        if(ENTER == 0 || ENTER == 2)
            additional_height += BORDER_WIDTH;
        else
            additional_width += BORDER_WIDTH;
    }
    
    // add our final widths and heights for this cell
    CSS += ' width:' + additional_width + 'px; height:' + additional_height +'px;';
    
    return CSS;
}



/******************************************************************************/
//                          MAZE SOLVER                                       //
/******************************************************************************/

// List containing all coordinates that are included in the solution's path
var Solution_List = new Array();

// This function acts the same as the recursive function - only follows different
// steps.  It starts at the starting point, and gathers a list of neighbors
// which it has access to (no wall exists between).  It then calls that neighbor
// and continues the process until we reach an accessible neighbor that has the
// same coordinates as the end.  At this point, we add that neighbor to the list
// of path coordinates and return
function SolveMaze()
{
    // reset all of the visted attributes to false
    for(var i = 0; i < WIDTH; i++)
    {
        for(var j = 0; j < HEIGHT; j++)
            Maze[i][j][4] = false;
    }
    
    // Call the maze solver, passing in the starting point
    Solver(ENTRANCE_X, ENTRANCE_Y);
    
    // draw the HTML code of the answer (maze with path filled in)
    Maze_HTML_Answer = DrawMazeAnswer();
}

// Actual recursive function
function Solver(x, y)
{
    // check to see if we're at the ending point
    if(x == STARTING_X && y == STARTING_Y)
    {
        // NOTE: we don't add one to the number of steps it takes to solve
        // because the user will already be in one cell (free move)
        // so the actual number of moves it takes to solve is one less than the
        // number of cells included in the solution's path...
        
        // add this location to the solution list
        Solution_List.push(new Array(x, y));
        return true;
    }
    
    // set this cell to being visited
    Maze[x][y][4] = true;
    
    // get a list of accessible neighbors
    var neighbors = GetNeighborAccess(x, y);

    //alert(neighbors);
    
    // don't bother randomizing them - that would be pointless.
    // Run through the list of them, checking if they lead to the end...
    for(var i = 0; i < neighbors.length; i++)
    {
        if(Solver(neighbors[i][0], neighbors[i][1]) == true)
        {
            // if one of the neighbors leads to the end, add this current
            // cell to the list of solutions
            Solution_List.push(new Array(x, y));
            
            // add one to the step count to solve
            Steps_to_Solve = Steps_to_Solve + 1;
            
            // and return true!
            return true;
        }
    }
    
    // if we never returned true up to this point, none of our neighbors lead
    // to the end, so we...unfortunately, are worthless.
    return false;
}

// This function examines the available options for a path
// and returns a list of new neighbors one can move to from the passed in
// cell
function GetNeighborAccess(x, y)
{
    var neighbor_list = new Array();
    
    // examine the walls, look for "0" (be careful for entry/exit points!)
    if(Maze[x][y][0] == 0 && y != 0 && Maze[x][y-1][4] == false)
    {
        // we can go up!
        neighbor_list.push(new Array(x, (y-1)));
    }
    
    if(Maze[x][y][1] == 0 && x != (WIDTH - 1) && Maze[x+1][y][4] == false)
    {
        // we can go to the right!
        neighbor_list.push(new Array((x + 1), y));
    }
    
    if(Maze[x][y][2] == 0 && y != (HEIGHT - 1) && Maze[x][y+1][4] == false)
    {
        // we can go down!
        neighbor_list.push(new Array(x, (y+1)));
    }
    
    if(Maze[x][y][3] == 0 && x != 0 && Maze[x-1][y][4] == false)
    {
        // we can go to the left!
        neighbor_list.push(new Array((x - 1), y));
    }
    
    return neighbor_list;
}

// This function loops through the "Maze" and for each cell, draws a DIV cell
// with borders that match the "walls" of that cell, and if that cell exists in
// the list "Solution_List", fills the background of that cell red.
function DrawMazeAnswer()
{
    // HTML variable to hold our code
    var HTML = '\n<div style="display: table; margin-left: auto; margin-right: auto; display: table; border-collapse:collapse; ">';
    
    // for each row in our maze...
    for(var j = 0; j < HEIGHT; j++)
    {
        HTML += '\n  <div style="display: table-row;">';
        
        // now run through each "cell"
        for(var i = 0; i < WIDTH; i++)
        {
            // get background color (is answer?)
            var answer_color = "#FFFFFF; ";
            
            if(IsAnswer(i, j))
                answer_color = "#FF0000; ";            
            
            // create a new cell
            HTML += '    <div style="display: table-cell; border-width:' + BORDER_WIDTH + '; border-style:' + BORDER_STYLE + '; float: left; background-color: ' + answer_color;
            
            // get our border information
            HTML += GetBorderStyles(i, j);
            HTML += '" >';
            
            // since we don't have anything left for this cell, just close it off (with the DIV)
            HTML += '</div>\n';
        }
        HTML += '  </div>\n';
    }

    HTML += '</div>\n';

    return HTML;
}

// basically looks through the array "Solution_List" to see if the passed in coordinates
// are a cell that is on the solution path
function IsAnswer(x, y)
{
    for(var i = 0; i < Solution_List.length; i++)
    {
        if(Solution_List[i][0] == x && Solution_List[i][1] == y)
            return true;
    }
    return false;
}

// Just for kicks - this is line 1000.