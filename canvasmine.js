/**
 * @author Chiquitto<chiquitto@chiquitto.com.br>
 */

// cm -> canvasmine

$(document).ready(function(){
	cm.init(9,9,5);
});

var cm = {
	// const
	CELL_CLOSED:1001, // cell closed
	CELL_FLAG:1002, // cell with flag
	CELL_QUESTION:1003, // is a mine?
	CELL_MINE:1009, // cell with mine
	CELL_0_MINES_NEAR:1010, // cell with 0 mines near
	CELL_1_MINES_NEAR:1011, // cell with 1 mines near
	CELL_2_MINES_NEAR:1012, // cell with 2 mines near
	CELL_3_MINES_NEAR:1013, // cell with 3 mines near
	CELL_4_MINES_NEAR:1014, // cell with 4 mines near
	CELL_5_MINES_NEAR:1015, // cell with 5 mines near
	CELL_6_MINES_NEAR:1016, // cell with 6 mines near
	CELL_7_MINES_NEAR:1017, // cell with 7 mines near
	CELL_8_MINES_NEAR:1018, // cell with 8 mines near
	
	c:null, // the canvas element
	cOffset:null,
	cell:[],
	cellCount:0,
	d2:null,
	s:25, // size in px
	img:['./img/sprite.jpg'],
	flags:0,
	
	// mines config
	minescount:0,
	minespos:[],
	minesNear:[],
	
	// sizes
	h:0,
	w:0,
	
	/**
	 * Prepare the game
	 * @param int width
	 * @param int height
	 * @param int mines number of mines
	 */
	init: function(width, height, mines) {
		loadImages(cm.img, function(images) {
			cm.img = images;
			cm.prepareGame();
		});
		
		cm.h = height;
		cm.w = width;
		cm.minescount = mines;
	},
	
	/**
	 * Convert the cell position, to cell x position
	 */
	cell2CellX: function(celln) {
		return celln % cm.w;
	},
	
	/**
	 * Convert the cell position, to cell y position
	 */
	cell2CellY: function(celln) {
		return parseInt(celln / cm.h, 10);
	},
	
	/**
	 * Convert the cell position, to x position
	 */
	cell2PosX: function(celln) {
		return (celln % cm.w) * cm.s;
	},
	
	/**
	 * Convert the cell position, to x position
	 */
	cell2PosY: function(celln) {
		return parseInt(celln / cm.h, 10) * cm.s;
	},
	
	/**
	 * Convert the clickEvent to PosX and PosY
	 */
	click2PosXY: function(clickEvent) {
		return {
			posx: clickEvent.pageX - cm.cOffset.left,
			posy: clickEvent.pageY - cm.cOffset.top
		};
	},
	
	cellLeftClicked: function(clickEvent) {
		var celln = cm.click2Cell(clickEvent);
		if(cm.openCell(celln)) {
			cm.checkFinish();
		}
		return false;
	},
	
	cellRightClicked: function(clickEvent) {
		var celln = cm.click2Cell(clickEvent);
		if(cm.openCellOption(celln)) {
			cm.checkFinish();
		}
		return false;
	},
	
	cellXY2Celln: function(cellx, celly) {
		return (cm.w * celly) + cellx;
	},
	
	/**
	 * Checks whether the player has won
	 */
	checkFinish: function() {
		if(cm.flags == cm.minescount) {
			var finish = true;
			for(var i1 = 0; i1 < cm.minescount; i1++) {
				if( cm.cell[cm.minespos[i1]] != cm.CELL_FLAG ) {
					finish = false;
					break;
				}
			}
			if(finish) {
				cm.win();
			}
		}
	},
	
	/**
	 * Convert the clickEvent to Cell Number
	 */
	click2Cell: function(clickEvent) {
		var pos = cm.click2PosXY(clickEvent);
		var y = parseInt(pos.posy / 25, 10);
		var x = parseInt(pos.posx / 25, 10);
		return (cm.w * y) + x;
	},
	
	drawScreen: function() {
		for(var i1=0; i1<cm.cellCount; i1++) {
			cm.drawCell(i1);
		}
	},
	
	defeated: function() {
		alert("Game over. You've been defeated!");
	},
	
	/**
	 * Draws the cell
	 * 
	 * @param int celln Number of cell
	 */
	drawCell: function(celln) {
		var map = cm.spriteMap(cm.cell[celln]);
		cm.d2.drawImage(cm.img[0], map.x, map.y, map.w, map.h, cm.cell2PosX(celln), cm.cell2PosY(celln), map.w, map.h);
	},
	
	findAroundCells: function(celln) {
		var r = [];
		
		var cellx = cm.cell2CellX(celln);
		var findx = [];
		if(cellx > 0) {
			findx.push(cellx - 1);
		}
		findx.push(cellx);
		if(cellx < (cm.w-1)) {
			findx.push(cellx + 1);
		}
		
		var celly = cm.cell2CellY(celln);
		var findy = [];
		if(celly > 0) {
			findy.push(celly - 1);
		}
		findy.push(celly);
		if(celly < (cm.h-1)) {
			findy.push(celly + 1);
		}
		
		var ixmax = findx.length;
		var iymax = findy.length;
		for(var iy=0; iy < iymax; iy++) {
			for(var ix=0; ix < ixmax; ix++) {
				if((cellx != ix) || (celly != iy)) {
					r.push(cm.cellXY2Celln(findx[ix], findy[iy]));
				}
			}
		}
		return r;
	},
	
	/**
	 * Find the near mines
	 */
	findNearMines: function(celln) {
		if(typeof cm.minesNear[celln] == 'number') {
			return cm.minesNear[celln];
		}
		
		var aroundCells = cm.findAroundCells(celln);
		var aroundCellsLength = aroundCells.length;
		cm.minesNear[celln] = 0;
		for(var i1 = 0; i1 < aroundCellsLength; i1++) {
			if($.inArray(aroundCells[i1], cm.minespos) > -1) {
				cm.minesNear[celln]++;
			}
		}
		return cm.minesNear[celln];
	},
	
	/**
	 * Open an cell
	 */
	openCell: function(celln) {
		if(cm.cell[celln] != cm.CELL_CLOSED) {
			return false;
		}
		
		console.log('Open the cell ', celln);
		
		if($.inArray(celln, cm.minespos) > -1) {
			cm.cell[celln] = cm.CELL_MINE;
			cm.drawCell(celln);
			cm.defeated();
			return false;
		}

		var nearMines = cm.findNearMines(celln);
		cm.cell[celln] = nearMines + 1010;

		if(nearMines == 0) {
			cm.openCellAround(celln);
		}
		cm.drawCell(celln);
		return true;
	},
	
	openCellAround: function(celln) {
		var aroundCells = cm.findAroundCells(celln);
		var aroundCellsLength = aroundCells.length;
		for(var i1 = 0; i1 < aroundCellsLength; i1++) {
			cm.openCell(aroundCells[i1]);
		}
	},
	
	openCellOption: function(celln) {
		switch(cm.cell[celln]) {
			case cm.CELL_CLOSED:
				cm.cell[celln] = cm.CELL_FLAG;
				cm.flags++;
				break;
			case cm.CELL_FLAG:
				cm.cell[celln] = cm.CELL_QUESTION;
				cm.flags--;
				break;
			case cm.CELL_QUESTION:
				cm.cell[celln] = cm.CELL_CLOSED;
				break;
			default:
				return false;
		}
		cm.drawCell(celln);
		return true;
	},
	
	prepareGame: function() {
		for(var i1=0; i1<cm.h; i1++) {
			for(var i2=0; i2<cm.w; i2++) {
				cm.cell.push( cm.CELL_CLOSED );
			}
		}
		cm.cellCount = cm.cell.length;
		
		cm.c = $('#canvasmine');
		cm.c.attr('width', cm.w * cm.s);
		cm.c.attr('height', cm.h * cm.s);
		cm.cOffset = cm.c.offset();
		
		cm.d2 = cm.c.get(0).getContext('2d');
		cm.drawScreen();
		
		cm.c.click(cm.start);
	},
	
	spriteMap: function(type) {
		var map = {
			x:0,
			y:0,
			w:25,
			h:25
		};
		
		switch(type) {
			case cm.CELL_CLOSED:
				map.y = 25;
				break;
			case cm.CELL_FLAG:
				map.x = 25;
				map.y = 25;
				break;
			case cm.CELL_QUESTION:
				map.x = 50;
				map.y = 25;
				break;
			case cm.CELL_MINE:
				map.x = 75;
				map.y = 25;
				break;
			case cm.CELL_0_MINES_NEAR:
			case cm.CELL_1_MINES_NEAR:
			case cm.CELL_2_MINES_NEAR:
			case cm.CELL_3_MINES_NEAR:
			case cm.CELL_4_MINES_NEAR:
			case cm.CELL_5_MINES_NEAR:
			case cm.CELL_6_MINES_NEAR:
			case cm.CELL_7_MINES_NEAR:
			case cm.CELL_8_MINES_NEAR:
				map.x = (type - 1010) * 25;
				break;
		}
		
		return map;
	},
	
	/**
	 * Start the game
	 */
	start: function(e) {
		console.log('Start the game');
		
		var celln = cm.click2Cell(e);
		
		// rand mines
		var minesIn = 1;
		var r;
		do {
			r = rand(0, cm.cellCount);
			
			// prevents the player lost the game on the first click
			if(r == celln) {
				continue;
			}
			// prevents the mines are not in the same cell
			if($.inArray(r, cm.minespos) > -1) {
				continue;
			}
			
			cm.minespos.push(r);
			minesIn++;
		} while (minesIn <= cm.minescount);
		
		cm.openCell(celln);
		
		cm.c.unbind('click')
			.click(cm.cellLeftClicked)
			.bind('contextmenu', cm.cellRightClicked)
		;
	},
	
	win: function() {
		alert('Game over. You win!');
	}
}

function rand(min, max) {
	// phpjs.org
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * @source http://www.html5canvastutorials.com/tutorials/html5-canvas-image-loader/
 */
function loadImages(sources, callback) {
	var images = {};
	var loadedImages = 0;
	var numImages = 0;
	// get num of sources
	for(var src in sources) {
		numImages++;
	}
	for(var src in sources) {
		images[src] = new Image();
		images[src].onload = function() {
			if(++loadedImages >= numImages) {
				callback(images);
			}
		};
		images[src].src = sources[src];
	}
}