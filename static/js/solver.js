/*******************************************************************************
 * File: solver.js
 * Date: December 7, 2011
 * Author: David Pettifor
 * Description:
 *      This file contains the GUI interactions code for solving the "Maze".
 *  The document object contains elements of DIV type in a row/column format,
 *  represented by the parent window's "Maze" object.  This Maze object is a
 *  3-dimensional array:
 *      Dimension 1: Width of the maze
 *      Dimension 2: Height of the maze
 *      Dimension 3: Array containing five (5) pieces of information:
 *          [0]: Top wall (1 [true] or 0 [false])
 *          [1]: Right wall (1 [true] or 0 [false])
 *          [2]: Bottom wall (1 [true] or 0 [false])
 *          [3]: Left wall (1 [true] or 0 [false])
 *          [4]: Visited (true or false)
 *      A wall with a "1" means the wall exists, and a wall with a "0" means
 *      the wall has been knocked down.
 *
 *  Other information is needed from the parent window:
 *      - Starting and Ending coordinates
 *      - Width and Height of the maze
 *      - Enterance and Exiting walls (with respect to the starting and ending)
 *      - Number of steps required to solve the puzzle (shortest possible path)
 *      - List of coordinates that are on the solution's path
 *  This information is gathered upon loading just below this commented section.
 *
 *  DOCUMENT OBJECTS:
 *      Each cell in the maze is represented by a very detailed DIV object with
 *      specific styles applied (mostly borders and colors).  Each DIV is given
 *      a unique ID that follows the following format:
 *          "X_Y"
 *          Where:
 *              X = Width Coordinate
 *              Y = Height Coordinate
 *      Keep in mind that the origins of this coordinate system is in the top-
 *      left corner of the maze: [0, 0].
 *      Example:
 *          If you had a maze that was 40 x 40, the following would be true:
 *          Top-Left corner: [0, 0]
 *          Top-Right corner: [39, 0]
 *          Bottom-left corner: [0, 39]
 *          Bottom-right corner: [39, 39]
 *
 *  MOVEMENT:
 *      Movement is defined by the characters:
 *          "W": Up
 *          "S": Down
 *          "A": Left
 *          "D": Right
 *      These characters are choice because ALL browsers support these charcters
 *      to be captured in a keyDown event, and they are the typical characters
 *      of movement in many other software applications (games).
 *
 *      Each time a movement character is pressed, the script references the
 *      Maze object to check if that movement is possible (that wall is a 0).
 *      If so, it clears the current document element of the generated
 *      background-image (updating colors according to enabled options), changes
 *      the current location's coordinates based on the move, and updates the
 *      new cell the user moved to in order to contain the background-image that
 *      represents where our user's current location is.
 *
 *      Every time a move is successfully made, the move count increases by 1.
 *
 *  USER'S LOCATION REPRESENTATION:
 *      The user's location is represented by a gradient red dot.  This dot is
 *      drawn using CSS styling and is set using the objects "background-image"
 *      property.  The CSS code required is browser-dependent, which is
 *      determined and set upon loading of the page.
 *
 *  FINISHING:
 *      During each move, the script checks to see if that last move exits the
 *      user out the exiting wall of the exit cell.  If so, it alerts the user,
 *      sets the current coordinates to [-1, -1] (preventing any further moves),
 *      and displays a table of ending statistics.
 *
 *  OPTIONS:
 *      There are three (3) options available for the user to enable during
 *      play:
 *
 *      - Show Visited Path:
 *          This runs through the maze object looking for that last element [4]
 *          for any that are "true".  This means the user has visited that
 *          location in the maze, and it updates the DIV object's background
 *          color to that of the "VisitedBGColor" variable.
 *      - Show Split Offs:
 *          This runs through the maze object looking for cells that have been
 *          visited AND that have at least 3 open walls.  A cell with at least
 *          3 open walls is a cell that gives the user a choice of which way to
 *          go.  Each cell has at least 2 open walls (enter and exit), but only
 *          cells with 3 or 4 open walls give the user a choice of which
 *          direction they would like to proceed in.  When it finds one of these
 *          cells, it changes that object's background color to that of the
 *          "SplitOffsColor" variable.
 *      - Show Current Stats:
 *          This displays a table below showing the current move count and
 *          current jump count.
*******************************************************************************/
// Cell "class" represented by an array:
// cell = {1, 1, 1, 1, false}
//
// Each element is:
//  [0] = Top wall
//  [1] = Right wall
//  [2] = Bottom wall
//  [3] = Left wall
//  [4] = visited



// copy over the maze object
var Maze = window.opener.Maze;

// starting locations
var Start_X = window.opener.ENTRANCE_X;
var Start_Y = window.opener.ENTRANCE_Y;

// ending cell
var End_X = window.opener.STARTING_X;
var End_Y = window.opener.STARTING_Y;

// Maze limits
var WIDTH = window.opener.WIDTH;
var HEIGHT = window.opener.HEIGHT;

// Exiting wall
var Exit = window.opener.EXIT;

// Entering wall
var Enter = window.opener.ENTER;

// current locations
var Current_Location = new Array(Start_X, Start_Y);

var Current_Answer_Location = new Array(Start_X, Start_Y);

// Background color of the visted path (if visible)
var VistedBGColor = '#C9D4E8'

// Background color of the split offs (if visible)
var SplitOffsColor = '#759DE8'

// Keep track of how many moves it takes the user
var User_Moves = 0;

// Keep track of how many jumps the user has made
var User_Jumps = 0;

// Number of moves it actually takes
var Steps_to_Solve = window.opener.Steps_to_Solve;

// array holding the solution
var Solution_List = window.opener.Solution_List;


/****************** USER LOCATION REPRESENTATION ******************************/
// The following code represent dots based on which browser is being used
// The dots follow these parameters:
var DOT_COLOR = "#FF0000";
var ANS_COLOR = "#000000";
var ANS_BG_COLOR = "#00FF00";
var BACKGROUND = "#FFFFFF";
var DOT_SIZE = 80;  // % of cell

var User_Representation;

var Answer_Representation;

/***************** END USER LOCATION REPRESENTATION ***************************/


/******************************** MAZE CLEANUP ********************************/
// we need to run through the entire maze and reset the "visited" element
// to "false"
for(var i = 0; i < WIDTH; i++)
{
    for(var j = 0; j < HEIGHT; j++)
        Maze[i][j][4] = false;
}
/*************************** END MAZE CLEANUP *********************************/

Start();

// Function called when the body loads
function Start()
{
    SetUserRepresent();
    UpdatePosition();
}

// This function is called when a regular key is pressed
//  NOTE: it is tied to the <body> tag as "onkeypress"
// The purpose of this function is to find if the user pressed:
//  w:  Move up
//  s:  Move down
//  a:  Move left
//  d:  Move right
function keyDown(event)
{   
    // variable to hold the key pressed
    var keycode;
    
    // if we're in Internet Explorer
    if(window.event)
        keycode = event.keyCode;

    // other browsers (Netscape/Firefox/Opera/Chrome)
    else if(event.which) 
        keycode = event.which;

    // convert to string character
    keycode = String.fromCharCode(keycode);
    
    // check to see which direction we should move in!
    switch(keycode)
    {
        case 38:
        case 'w':
            MoveUp();
            break;
        case 40:
        case 's':
            MoveDown();
            break;
        case 37:
        case 'a':
            MoveLeft();
            break;
        case 39:
        case 'd':
            MoveRight();
            break;
    };
}


function MoveUp()
{
    // first check if the user tries to leave the maze
    // through the starting cell's open wall
    if(CheckStart(0))
        return;
    
    // check if we can move up
    if(Maze[Current_Location[0]][Current_Location[1]][0] == '0')
    {        
        // clear the current cell
        ClearCurrentCell();
        
        // check if we're at the end
        if(CheckFinish(0))
            return;
        
        // move our current location up
        Current_Location[1] = Current_Location[1] - 1;
        
        // update our position in the GUI!
        UpdatePosition();
        
        // increment our move count!
        User_Moves = User_Moves + 1;
        if(document.getElementById('showstats').checked == true)
            document.getElementById('display_moves').innerHTML = User_Moves;
    }
}

function MoveDown()
{
    // first check if the user tries to leave the maze
    // through the starting cell's open wall
    if(CheckStart(2))
        return;
    
    // check if we can move down
    if(Maze[Current_Location[0]][Current_Location[1]][2] == '0')
    {
        // clear the current cell
        ClearCurrentCell();
        
        // check if we're at the end
        if(CheckFinish(2))
            return;
        
        // move our current location up
        Current_Location[1] = Current_Location[1] + 1;
        
        // update our position in the GUI!
        UpdatePosition();
        
        // increment our move count!
        User_Moves = User_Moves + 1;
        if(document.getElementById('showstats').checked)
            document.getElementById('display_moves').innerHTML = User_Moves;
    }
}

function MoveLeft()
{
    // first check if the user tries to leave the maze
    // through the starting cell's open wall
    if(CheckStart(3))
        return;
    
    // check if we can move left
    if(Maze[Current_Location[0]][Current_Location[1]][3] == '0')
    {
        // clear the current cell
        ClearCurrentCell();
        
        // check if we're at the end
        if(CheckFinish(3))
            return;
        
        // move our current location up
        Current_Location[0] = Current_Location[0] - 1;
        
        // update our position in the GUI!
        UpdatePosition();
        
        // increment our move count!
        User_Moves = User_Moves + 1;
        if(document.getElementById('showstats').checked)
            document.getElementById('display_moves').innerHTML = User_Moves;
    }
}

function MoveRight()
{
    // first check if the user tries to leave the maze
    // through the starting cell's open wall
    if(CheckStart(1))
        return;
    
    // check if we can move right
    if(Maze[Current_Location[0]][Current_Location[1]][1] == '0')
    {
        // clear the current cell
        ClearCurrentCell();
        
        // check if we're at the end
        if(CheckFinish(1))
            return;
        
        // move our current location up
        Current_Location[0] = Current_Location[0] + 1;
        
        // update our position in the GUI!
        UpdatePosition();
        
        // increment our move count!
        User_Moves = User_Moves + 1;
        if(document.getElementById('showstats').checked)
            document.getElementById('display_moves').innerHTML = User_Moves;
    }
}

// Clears the current location of our user's cell in the maze
// (Used right before updating to a new location)
function ClearCurrentCell()
{
    // get rid of the dot...
    document.getElementById(Current_Location[0] + '_' + Current_Location[1]).style.backgroundImage = '';
    
    // update the background color (in case we have our "show visited path" checked or "show split offs" checked)
    if(document.getElementById('showpath').checked)
        document.getElementById(Current_Location[0] + '_' + Current_Location[1]).style.backgroundColor = VistedBGColor;
    if(document.getElementById('showsplits').checked && CountOpenings(Current_Location[0], Current_Location[1]) >= 3)
        document.getElementById(Current_Location[0] + '_' + Current_Location[1]).style.backgroundColor = SplitOffsColor;
    if(document.getElementById('showpath').checked == false && document.getElementById('showsplits').checked == false)
        document.getElementById(Current_Location[0] + '_' + Current_Location[1]).style.backgroundColor = '#FFFFFF';
}

// Looks at the current position and sets that DIV cell's background image
// to contain the pre-determined "User_Representation" dot
function UpdatePosition()
{
    // set this location in the maze to being visisted
    Maze[Current_Location[0]][Current_Location[1]][4] = true;
    
    document.getElementById(Current_Location[0] + '_' + Current_Location[1]).style.backgroundImage = User_Representation;
}

// This function checks to see if we're in the ending cell and if so,
// checks if the direction is correct for leaving the cell.
// If it is, it displays a message saying the maze is complete!
function CheckFinish(direction)
{
    if(Current_Location[0] == End_X && Current_Location[1] == End_Y && direction == Exit)
    {
        alert("Congratulations!  You have solved the maze!");
        Current_Location[0] = -1;
        Current_Location[1] = -1;
        ShowStats();
        return true;
    }
    return false;
}

// This function checks to see if we're at the starting cell and makes sure that
// the user doesn't leave the maze through the starting cell's open wall
function CheckStart(direction)
{
    if(Current_Location[0] == Start_X && Current_Location[1] == Start_Y && direction == Enter)
        return true;
    return false;
}

// This function is called when the user clicks on the checkbox "Show Visisted Path"
// It simply runs through the Maze array and sets any visited cell's background color
// to "VistedBGColor" if "showPath" is true, or white if not
function TogglePath(showPath)
{
    var color = '#FFFFFF';
    if(showPath)
        color = VistedBGColor;

    // loop through the Maze
    for(var i = 0; i < WIDTH; i++)
        for(var j = 0; j < HEIGHT; j++)
            if(Maze[i][j][4] == true)
            {
                // Check if we're currently showing our splits, and the current cell is a split
                if(document.getElementById('showsplits').checked == true && CountOpenings(i, j) >= 3)
                    document.getElementById(i + '_' + j).style.backgroundColor = SplitOffsColor;
                else
                    document.getElementById(i + '_' + j).style.backgroundColor = color;
            }
                
    SetUserRepresent();
    UpdatePosition();
}

// This function checks the status of "Show Visited Path"
// If it is checked, it creates a circle represnetation of the user's location in the maze
// determined by the user's browser, and sets the global "User_Representation" to that code
// which is used when updating the user's position
function SetUserRepresent()
{

    // Set the background color - determined by "Show Visited Path"
    if(document.getElementById('showpath').checked)
        BACKGROUND = VistedBGColor;
    else
        BACKGROUND = "#FFFFFF";
    
    /* IE10 */ 
    var USER_IE = '-ms-radial-gradient(center, circle contain, '+DOT_COLOR+' 0%, '+BACKGROUND+' '+DOT_SIZE+'%)';
    
    /* Mozilla Firefox */ 
    var USER_MOZ = '-moz-radial-gradient(center, circle contain, '+DOT_COLOR+' 0%, '+BACKGROUND+' '+DOT_SIZE+'%)';
    
    /* Opera */ 
    var USER_OPERA = '-o-radial-gradient(center, circle farthest-corner, '+DOT_COLOR+' 0%, '+BACKGROUND+' '+String(parseInt(DOT_SIZE)-20)+'%)';
    
    /* Webkit (Safari/Chrome 10) */ 
    var USER_SAFARI = '-webkit-gradient(radial, center center, 0, center center, 143, color-stop(0, '+DOT_COLOR+'), color-stop('+String(DOT_SIZE/100)+', '+BACKGROUND+'))';
    
    /* Webkit (Chrome 11+) */ 
    var USER_CHROME = '-webkit-radial-gradient(center, circle contain, '+DOT_COLOR+' 0%, '+BACKGROUND+' '+DOT_SIZE+'%)';
    
    
    /* IE10 */ 
    var ANSWER_IE = '-ms-radial-gradient(center, circle contain, '+ANS_COLOR+' 0%, '+ANS_BG_COLOR+' '+DOT_SIZE+'%)';
    
    /* Mozilla Firefox */ 
    var ANSWER_MOZ = '-moz-radial-gradient(center, circle contain, '+ANS_COLOR+' 0%, '+ANS_BG_COLOR+' '+DOT_SIZE+'%)';
    
    /* Opera */ 
    var ANSWER_OPERA = '-o-radial-gradient(center, circle farthest-corner, '+ANS_COLOR+' 0%, '+ANS_BG_COLOR+' '+String(parseInt(DOT_SIZE)-20)+'%)';
    
    /* Webkit (Safari/Chrome 10) */ 
    var ANSWER_SAFARI = '-webkit-gradient(radial, center center, 0, center center, 143, color-stop(0, '+ANS_COLOR+'), color-stop('+String(DOT_SIZE/100)+', '+ANS_BG_COLOR+'))';
    
    /* Webkit (Chrome 11+) */ 
    var ANSWER_CHROME = '-webkit-radial-gradient(center, circle contain, '+ANS_COLOR+' 0%, '+ANS_BG_COLOR+' '+DOT_SIZE+'%)';

    
    // get the user's browser type
    if(navigator.userAgent.indexOf("Firefox") >= 0)
    {
        User_Representation = USER_MOZ;
        Answer_Representation = ANSWER_MOZ;
    }
    else if(navigator.userAgent.indexOf("Opera") >= 0)
    {
        User_Representation = USER_OPERA;
        Answer_Representation = ANSWER_OPERA;
    }
    else if(navigator.userAgent.indexOf("SAFARI") >= 0)
    {
        User_Representation = USER_SAFARI;
        Answer_Representation = ANSWER_SAFARI;
    }
    else if(navigator.appName.indexOf("Internet Explorer") >= 0)
    {
        User_Representation = USER_IE;
        Answer_Representation = ANSWER_IE;
    }
    else
    {
        User_Representation = USER_CHROME;
        Answer_Representation = ANSWER_CHROME;
    }
}

// This function is called when the user clicks on a particular cell
// It checks to see if the user has been to this location, and if so,
// updates that user's position to that cell (really helps when you're
// reeeeeaaaaaaally off the right path...)
function JumpHere(cell_id)
{
    // get the coordinates
    cell_id = cell_id.split('_');
    var w = cell_id[0];
    var h = cell_id[1];
    
    // check if we've been there
    if(Maze[parseInt(w)][parseInt(h)][4] == true)
    {
        // clear the current cell
        ClearCurrentCell();
        
        // update our current position to that location
        Current_Location[0] = parseInt(w);
        Current_Location[1] = parseInt(h);
        
        // update our position in the GUI!
        UpdatePosition();
        
        // update our jump count!
        User_Jumps = User_Jumps + 1;
        
        if(document.getElementById('showstats').checked)
            document.getElementById('display_jumps').innerHTML = User_Jumps;
    }
}

// This function is called every time the user clicks on "Show Current Stats"
// It toggles the display of information such as number of clicks
function ToggleCurrentStats(checked)
{
    if(!checked)
    {
        document.getElementById('livestats').innerHTML = '';
        return;
    }
    
    var HTML = 'Statistics:<br><hr width="50%">';
    
    // show current move count
    HTML += '<div style="display: table; width: 400px; text-align: center; margin-left: auto; margin-right: auto;"><div style="display: table-row;"><div style="display: table-cell; text-align: left; width: 200px;">Current move count:</div><div id="display_moves" style="display: table-cell; text-align: right; width: 200px;">' + User_Moves + '</div></div>';
    
    // show current jump count
    HTML += '<div style="display: table-row;"><div style="display: table-cell; text-align: left; width: 200px;">Current jump count:</div><div id="display_jumps" style="display: table-cell; text-align: right; width: 200px;">'+User_Jumps+'</div></div>';
    
    
    // close off our stats DIV
    HTML += '</div>';
    
    document.getElementById('livestats').innerHTML = HTML;
}

// This function is called after the user completes the maze
function ShowStats()
{
    var HTML = 'Ending Statistics:<br><hr width="50%">';
    
    // show total move count
    HTML += '<div style="display: table; width: 400px; text-align: center; margin-left: auto; margin-right: auto;"><div style="display: table-row;"><div style="display: table-cell; text-align: left; width: 200px;">Total Move Count:</div><div id="display_moves" style="display: table-cell; text-align: right; width: 200px;">' + User_Moves + '</div></div>';
    HTML += '<div style="display: table-row;"><div style="display: table-cell; text-align: left; width: 200px;">Minimum Move Count:</div><div style="display: table-cell; text-align: right; width: 200px;">'+Steps_to_Solve+'</div></div>';
    HTML += '<div style="display: table-row;"><div style="display: table-cell; text-align: left; width: 200px;">Percentage of Accuracy:</div><div style="display: table-cell; text-align: right; width: 200px;">'+String((parseFloat(Steps_to_Solve)/parseFloat(User_Moves))*100)+'%</div></div>';
    
    
    // show current jump count
    HTML += '<div style="display: table-row;"><div style="display: table-cell; text-align: left; width: 200px;">Total Jump Count:</div><div id="display_jumps" style="display: table-cell; text-align: right; width: 200px;">'+User_Jumps+'</div></div>';
    
    
    // give option to show answer
    HTML += '<br><div style="display: table-row;"><div style="display: table-cell; text-align: left; width: 200px;"><input style="margin-left: auto; margin-right: auto;" type="checkbox" onclick="ToggleAnswer(this.checked);"> Show Answer</input></div>\
            <div style="display: table-cell; text-align: right; width: 200px;"><button type="button" onclick="PlayAnswer();">Play Answer</button></div></div>';
    
    // close off our stats DIV
    HTML += '</div>';
    
    document.getElementById('livestats').innerHTML = HTML;
}

// This function is called when the user clicks on the "Play Answer" button after completing the maze.
// It loops through (backwards) the answer list and updates the answer's location, showing which
// way is the correct path.
function PlayAnswer()
{
    // call the Update Answer recursive function with the last point
    UpdateAnswer(Solution_List.length - 1);
}

function UpdateAnswer(index)
{
    if(index < 0)
        return;
    
    // get rid of the dot...
    document.getElementById(Current_Answer_Location[0] + '_' + Current_Answer_Location[1]).style.backgroundImage = '';
    
    // update the background color to show this is part of the answer
    document.getElementById(Current_Answer_Location[0] + '_' + Current_Answer_Location[1]).style.backgroundColor = ANS_BG_COLOR;
    
    // update our location
    Current_Answer_Location = Solution_List[index];
    
    // update our position in the GUI!
    document.getElementById(Current_Answer_Location[0] + '_' + Current_Answer_Location[1]).style.backgroundImage = Answer_Representation;
    
    window.setTimeout(function(){UpdateAnswer(index - 1)}, 100);
}


// Clears the current location of our user's cell in the maze
// (Used right before updating to a new location)
function ClearAnswerCurrentCell()
{
    // get rid of the dot...
    document.getElementById(Current_Answer_Location[0] + '_' + Current_Answer_Location[1]).style.backgroundImage = '';
    
    // update the background color to show this is part of the answer
    document.getElementById(Current_Answer_Location[0] + '_' + Current_Answer_Location[1]).style.backgroundColor = ANS_BG_COLOR;
}

// Looks at the current position and sets that DIV cell's background image
// to contain the pre-determined "User_Representation" dot
function UpdateAnswerPosition()
{
    document.getElementById(Current_Answer_Location[0] + '_' + Current_Answer_Location[1]).style.backgroundImage = Answer_Representation;
}

// This function is called when the "Show Answer" checkbox is clicked
// This checkbox is only displayed after the maze has been completed
// This runs through the array "Solution_List" and colors any DIV
// that exists in this list (matching coordinates)
function ToggleAnswer(show)
{
    var color = "#00FF00";
    
    // loop through the maze
    for(var i = 0; i < WIDTH; i++)
    {
        for(var j = 0; j < HEIGHT; j++)
        {
            // check if we do show the answer
            if(show)
            {
                // check if the current location is in our list
                if(IsAnswer(i, j))
                    document.getElementById(i + '_' + j).style.backgroundColor = color;
            }
            else
            {
                // check if we want to show the path and is visited
                if(Maze[i][j][4] == true)
                    document.getElementById(i + '_' + j).style.backgroundColor = "#FFFFFF";
                if(Maze[i][j][4] == true && document.getElementById('showpath').checked == true)
                    document.getElementById(i + '_' + j).style.backgroundColor = VistedBGColor;
                if(Maze[i][j][4] == true && document.getElementById('showsplits').checked == true && CountOpenings(i, j) >= 3)
                    document.getElementById(i + '_' + j).style.backgroundColor = SplitOffsColor;
                
            }
        }
    }
}

// This function is called when the user clicks on the "Show Split Offs" checkbox
// It runs through the maze, checking if a particular cell is on the visited path
// If it is, it checks to see if it has more than one missing wall - if so, it colors
// that cell a specific color
function ToggleSplits(show)
{
    // run through the maze
    for(var i = 0; i < WIDTH; i++)
    {
        for(var j = 0; j < HEIGHT; j++)
        {
            // check if this cell has been visited
            if(Maze[i][j][4] == true)
            {
                // check if this wall has more than one missing wall
                if(CountOpenings(i, j) >= 3)
                {
                    // check if we want to see this split
                    if(show)
                    {
                        // color that cell!
                        document.getElementById(i + '_' + j).style.backgroundColor = SplitOffsColor;
                    }
                    else
                    {
                        // otherwise, check if we want to just show the path or not
                        if(document.getElementById('showpath').checked == true)
                            document.getElementById(i + '_' + j).style.backgroundColor = VistedBGColor;
                        else
                            document.getElementById(i + '_' + j).style.backgroundColor = "#FFFFFF";
                    }
                }
            }
        }
    }
}

// Counts how many open walls exist in the cell passed in
// and returns that number
function CountOpenings(w, h)
{
    var count = 0;
    for(var i = 0; i < 4; i++)
        if(Maze[w][h][i] == 0)
            count += 1;
            
    return count;
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