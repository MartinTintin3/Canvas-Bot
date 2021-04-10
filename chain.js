/* eslint-disable */

var path = new Path({
	segments: [[30, 75], [30, 25], [80, 25], [80, 75]],
	strokeColor: 'black',
	closed: true
});

// Select the path, so we can see its handles:
path.fullySelected = true;

// Create a copy of the path and move it 100pt to the right:
var copy = path.clone();
copy.fullySelected = true;
copy.position.x += 100;

// Smooth the segments of the copy:
copy.smooth();