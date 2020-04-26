function updateLandmarkIndicator() {

	var building = buildings.getObjectById(selectedLandmarkID);

	// position the sphere
	landmarkIndicator.position.x = building.position.x;
	landmarkIndicator.position.y =
	building.position.y + building.geometry.parameters.height / 2;
	landmarkIndicator.position.z = building.position.z;
}

// function to clear the raytracing lines
let clearLines = function() {
	skyPlane.visible = false;

	let arrayOfLines = []

	scene.traverse(function (line) {
		if (line instanceof THREE.Line) {
			arrayOfLines.push(line);
		}
	});

	arrayOfLines.forEach(line => {
		scene.remove(line);
	});
};

// function to compute the landmark visibility
let computeLandmarkVisability = function() {
	houseNumber = buildings.children.length;
	houseHits = Array(houseNumber).fill(0);
	let landmark = buildings.getObjectById(selectedLandmarkID);
	let w = landmark.geometry.parameters.width;
	let d = landmark.geometry.parameters.depth;
	let radius = Math.sqrt(Math.pow(w/2, 2)+Math.pow(d/2, 2));
	for (let angle = 0; angle < 360; angle++) {
		for (let height = 1; height < landmark.geometry.parameters.height; ) {
			let angleRad = (angle * Math.PI) / 180;
			let x = Math.sin(angleRad);
			let z = Math.cos(angleRad);

			let origin = landmark.position.clone();
			origin.y = height;
			let direction = new THREE.Vector3(x, 0, z).normalize();
			origin.x = origin.x + (direction.x*radius);
			origin.z = origin.z + (direction.z*radius);
			let intersects = getIntersections(origin, direction, buildings.children);

			if (intersects[0]) {
				createLine(new THREE.Vector3().copy(origin), direction, intersects[0].distance);
				houseHits[parseInt(intersects[0].object.name.substr(5))]++;
			}
			height = height + 1;
		}
	}

	houseHits.forEach(element => {
		if (element) totalHits++;
	});
};

// create ray and return intersections with objects
let getIntersections = function(origin, direction, objects) {
	let rayCast = new THREE.Raycaster(origin, direction.normalize());
	return rayCast.intersectObjects(objects);
};

// draw red line from point with direction and length
let createLine = function(pointA, direction, length) {
	let pointB = new THREE.Vector3();
	pointB.addVectors(pointA, direction.multiplyScalar(length));
	let geometry = new THREE.Geometry();
	geometry.vertices.push(pointA);
	geometry.vertices.push(pointB);
	let material = new THREE.LineBasicMaterial({ color: 0xff0000, opacity: 1.0, transparent: true });
	let line = new THREE.Line(geometry, material);
	scene.add(line);
	return line;
};